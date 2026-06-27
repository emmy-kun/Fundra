from decimal import Decimal
from django.db import transaction
from django.contrib.auth import get_user_model

from wallets.models import PlatformRevenue, Wallet
from utils.exceptions import InsufficientBalanceError

User = get_user_model()

PLATFORM_FEE = Decimal('1000.00')


class WalletService:
    """Service for wallet operations with thread-safe atomic transactions."""

    @staticmethod
    @transaction.atomic
    def add_balance(user, amount):
        """Add funds to a user's available balance."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        wallet = Wallet.objects.select_for_update().get(user=user)
        wallet.available_balance += Decimal(str(amount))
        wallet.save(update_fields=['available_balance', 'updated_at'])
        return wallet

    @staticmethod
    @transaction.atomic
    def deduct_balance(user, amount):
        """Deduct funds from a user's available balance."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        wallet = Wallet.objects.select_for_update().get(user=user)
        if wallet.available_balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient balance. Available: {wallet.available_balance}, Required: {amount}"
            )

        wallet.available_balance -= Decimal(str(amount))
        wallet.save(update_fields=['available_balance', 'updated_at'])
        return wallet

    @staticmethod
    @transaction.atomic
    def lock_to_escrow(user, amount, platform_fee=PLATFORM_FEE):
        """Move funds from available_balance to escrow_balance while charging the platform fee."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        amount_value = Decimal(str(amount))
        fee_value = Decimal(str(platform_fee))
        required_total = amount_value + fee_value

        wallet = Wallet.objects.select_for_update().get(user=user)
        if wallet.available_balance < required_total:
            raise InsufficientBalanceError(
                f"Insufficient balance. Available: {wallet.available_balance}, Required: {required_total}"
            )

        wallet.available_balance -= required_total
        wallet.escrow_balance += amount_value
        wallet.save(update_fields=['available_balance', 'escrow_balance', 'updated_at'])
        return wallet

    @staticmethod
    @transaction.atomic
    def release_from_escrow(user, amount):
        """Release funds from escrow back to available_balance (used when canceling)."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        wallet = Wallet.objects.select_for_update().get(user=user)
        if wallet.escrow_balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient escrow balance. Available: {wallet.escrow_balance}, Required: {amount}"
            )

        wallet.escrow_balance -= Decimal(str(amount))
        wallet.available_balance += Decimal(str(amount))
        wallet.save(update_fields=['available_balance', 'escrow_balance', 'updated_at'])
        return wallet

    @staticmethod
    @transaction.atomic
    def transfer_from_escrow_to_seller(buyer, seller, amount):
        """
        Transfer funds from buyer's escrow to seller's available balance.
        Used when transaction is confirmed (delivery confirmed).
        """
        if amount <= 0:
            raise ValueError("Amount must be positive")

        buyer_wallet = Wallet.objects.select_for_update().get(user=buyer)
        seller_wallet = Wallet.objects.select_for_update().get(user=seller)

        if buyer_wallet.escrow_balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient escrow balance. Available: {buyer_wallet.escrow_balance}, Required: {amount}"
            )

        buyer_wallet.escrow_balance -= Decimal(str(amount))
        buyer_wallet.save(update_fields=['escrow_balance', 'updated_at'])

        seller_wallet.available_balance += Decimal(str(amount))
        seller_wallet.save(update_fields=['available_balance', 'updated_at'])

        return buyer_wallet, seller_wallet

    @staticmethod
    @transaction.atomic
    def record_platform_revenue(transaction, fee_amount=PLATFORM_FEE):
        """Persist the platform fee for a transaction."""
        fee_value = Decimal(str(fee_amount))
        if fee_value <= 0:
            return None

        return PlatformRevenue.objects.create(transaction=transaction, amount=fee_value)
