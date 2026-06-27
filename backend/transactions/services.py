from decimal import Decimal
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone

from transactions.models import Transaction
from wallets.services import PLATFORM_FEE, WalletService
from utils.exceptions import InvalidTransactionStatusError, UnauthorizedTransactionAccessError

User = get_user_model()


class TransactionService:
    """Service for transaction operations with state machine logic and atomic transactions."""

    @staticmethod
    @transaction.atomic
    def create_transaction(buyer, seller, amount, description=None):
        """
        Create a new transaction and lock funds in buyer's escrow.
        Called when buyer initiates payment.
        """
        if not buyer.is_buyer():
            raise ValueError("Only buyers can initiate transactions")

        if not seller.is_seller():
            raise ValueError("Only sellers can receive transactions")

        amount_value = Decimal(str(amount))
        fee_value = PLATFORM_FEE
        total_required = amount_value + fee_value

        WalletService.lock_to_escrow(buyer, amount_value, platform_fee=fee_value)

        txn = Transaction.objects.create(
            buyer=buyer,
            seller=seller,
            amount=amount_value,
            fee_charged=fee_value,
            status=Transaction.Status.PENDING,
            description=description
        )

        WalletService.record_platform_revenue(txn, fee_value)

        return txn

    @staticmethod
    @transaction.atomic
    def update_status(transaction_obj, new_status, user):
        """
        Update transaction status with validation.
        Only seller can update status: PENDING -> PROCESSING -> SHIPPED.
        Or transition to CANCELED (refunds buyer).
        """
        # Verify the user is the seller
        if user != transaction_obj.seller:
            raise UnauthorizedTransactionAccessError("Only the seller can update transaction status")

        current_status = transaction_obj.status

        # Validate transitions
        valid_transitions = {
            Transaction.Status.PENDING: [Transaction.Status.PROCESSING, Transaction.Status.CANCELED],
            Transaction.Status.PROCESSING: [Transaction.Status.SHIPPED, Transaction.Status.CANCELED],
            Transaction.Status.SHIPPED: [Transaction.Status.CANCELED],
            Transaction.Status.SUCCESSFUL: [],
            Transaction.Status.CANCELED: [],
        }

        if new_status not in valid_transitions.get(current_status, []):
            raise InvalidTransactionStatusError(
                f"Cannot transition from {current_status} to {new_status}"
            )

        # If transitioning to CANCELED, refund buyer
        if new_status == Transaction.Status.CANCELED:
            WalletService.release_from_escrow(transaction_obj.buyer, transaction_obj.amount)

        # Update status
        transaction_obj.status = new_status
        transaction_obj.updated_at = timezone.now()
        transaction_obj.save(update_fields=['status', 'updated_at'])

        return transaction_obj

    @staticmethod
    @transaction.atomic
    def cancel_transaction(transaction_obj, user):
        """
        Cancel a transaction and refund the buyer.
        Only buyer can cancel, and only if status is PENDING or PROCESSING.
        """
        # Verify the user is the buyer
        if user != transaction_obj.buyer:
            raise UnauthorizedTransactionAccessError("Only the buyer can cancel this transaction")

        # Check if cancellation is allowed
        if not transaction_obj.can_cancel:
            raise InvalidTransactionStatusError(
                f"Cannot cancel transaction with status {transaction_obj.status}. "
                f"Only PENDING or PROCESSING transactions can be canceled."
            )

        # Refund buyer
        WalletService.release_from_escrow(transaction_obj.buyer, transaction_obj.amount)

        # Update status
        transaction_obj.status = Transaction.Status.CANCELED
        transaction_obj.updated_at = timezone.now()
        transaction_obj.save(update_fields=['status', 'updated_at'])

        return transaction_obj

    @staticmethod
    @transaction.atomic
    def confirm_delivery(transaction_obj, user):
        """
        Confirm delivery and release funds to seller.
        Only buyer can confirm, and only if status is SHIPPED.
        """
        # Verify the user is the buyer
        if user != transaction_obj.buyer:
            raise UnauthorizedTransactionAccessError("Only the buyer can confirm delivery")

        # Check if confirmation is allowed
        if not transaction_obj.can_confirm_delivery:
            raise InvalidTransactionStatusError(
                f"Cannot confirm delivery for transaction with status {transaction_obj.status}. "
                f"Only SHIPPED transactions can be confirmed."
            )

        # Transfer funds from buyer's escrow to seller's available balance
        WalletService.transfer_from_escrow_to_seller(
            transaction_obj.buyer,
            transaction_obj.seller,
            transaction_obj.amount
        )

        # Update status to SUCCESSFUL
        transaction_obj.status = Transaction.Status.SUCCESSFUL
        transaction_obj.updated_at = timezone.now()
        transaction_obj.save(update_fields=['status', 'updated_at'])

        return transaction_obj
