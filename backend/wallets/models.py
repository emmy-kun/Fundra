from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    available_balance = models.DecimalField(
        max_digits=19,
        decimal_places=2,
        default=Decimal('0.00')
    )
    escrow_balance = models.DecimalField(
        max_digits=19,
        decimal_places=2,
        default=Decimal('0.00')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'
        verbose_name = 'Wallet'
        verbose_name_plural = 'Wallets'

    def __str__(self):
        return f"Wallet for {self.user.username}"

    @property
    def total_balance(self):
        """Total balance (available + escrow)"""
        return self.available_balance + self.escrow_balance


class PlatformRevenue(models.Model):
    transaction = models.OneToOneField(
        'transactions.Transaction',
        on_delete=models.CASCADE,
        related_name='platform_revenue'
    )
    amount = models.DecimalField(max_digits=19, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'platform_revenue'
        verbose_name = 'Platform Revenue'
        verbose_name_plural = 'Platform Revenue'

    def __str__(self):
        return f"Platform fee {self.amount} for transaction {self.transaction_id}"
