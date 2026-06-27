from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        SHIPPED = 'SHIPPED', 'Shipped'
        SUCCESSFUL = 'SUCCESSFUL', 'Successful'
        CANCELED = 'CANCELED', 'Canceled'

    buyer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='transactions_as_buyer'
    )
    seller = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='transactions_as_seller'
    )
    amount = models.DecimalField(max_digits=19, decimal_places=2)
    fee_charged = models.DecimalField(
        max_digits=19,
        decimal_places=2,
        default=Decimal('1000.00')
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Transaction {self.id} - {self.buyer.username} -> {self.seller.username}"

    @property
    def is_pending(self):
        return self.status == self.Status.PENDING

    @property
    def is_processing(self):
        return self.status == self.Status.PROCESSING

    @property
    def is_shipped(self):
        return self.status == self.Status.SHIPPED

    @property
    def is_successful(self):
        return self.status == self.Status.SUCCESSFUL

    @property
    def is_canceled(self):
        return self.status == self.Status.CANCELED

    @property
    def can_cancel(self):
        """Can cancel if PENDING or PROCESSING"""
        return self.status in [self.Status.PENDING, self.Status.PROCESSING]

    @property
    def can_confirm_delivery(self):
        """Can confirm delivery only if SHIPPED"""
        return self.status == self.Status.SHIPPED
