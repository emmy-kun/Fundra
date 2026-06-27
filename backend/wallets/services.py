from decimal import Decimal
from django.db import transaction
from django.contrib.auth import get_user_model

from utils.exceptions import InsufficientBalanceError

User = get_user_model()


class WalletService:
    """Service for wallet operations with thread-safe atomic transactions."""

    @staticmethod
    @transaction.atomic
    def add_balance(user, amount):
        """Add funds to a user's available balance."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        wallet = user.wallet
        wallet.available_balance += Decimal(str(amount))
        wallet.save(update_fields=['available_balance', 'updated_at'])
        return wallet

    @staticmethod
    @transaction.atomic
    def deduct_balance(user, amount):
        """Deduct funds from a user's available balance."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        wallet = user.wallet
        if wallet.available_balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient balance. Available: {wallet.available_balance}, Required: {amount}"
            )

        wallet.available_balance -= Decimal(str(amount))
        wallet.save(update_fields=['available_balance', 'updated_at'])
        return wallet

    @staticmethod
    @transaction.atomic
    def lock_to_escrow(user, amount):
        """Move funds from available_balance to escrow_balance (used when buyer sends money)."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        wallet = user.wallet
        if wallet.available_balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient balance. Available: {wallet.available_balance}, Required: {amount}"
            )

        wallet.available_balance -= Decimal(str(amount))
        wallet.escrow_balance += Decimal(str(amount))
        wallet.save(update_fields=['available_balance', 'escrow_balance', 'updated_at'])
        return wallet

    @staticmethod
    @transaction.atomic
    def release_from_escrow(user, amount):
        """Release funds from escrow back to available_balance (used when canceling)."""
        if amount <= 0:
            raise ValueError("Amount must be positive")

        wallet = user.wallet
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

        buyer_wallet = buyer.wallet
        seller_wallet = seller.wallet

        # Deduct from buyer's escrow
        if buyer_wallet.escrow_balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient escrow balance. Available: {buyer_wallet.escrow_balance}, Required: {amount}"
            )

        buyer_wallet.escrow_balance -= Decimal(str(amount))
        buyer_wallet.save(update_fields=['escrow_balance', 'updated_at'])

        # Add to seller's available balance
        seller_wallet.available_balance += Decimal(str(amount))
        seller_wallet.save(update_fields=['available_balance', 'updated_at'])

        return buyer_wallet, seller_wallet
