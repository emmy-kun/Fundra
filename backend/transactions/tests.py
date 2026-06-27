from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase

from transactions.models import Transaction
from transactions.services import TransactionService
from wallets.models import PlatformRevenue, Wallet

User = get_user_model()


class TransactionServiceFeeTests(TestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(
            username='buyer',
            email='buyer@example.com',
            password='password123',
            role=User.Role.BUYER,
        )
        self.seller = User.objects.create_user(
            username='seller',
            email='seller@example.com',
            password='password123',
            role=User.Role.SELLER,
        )
        self.buyer.wallet.available_balance = Decimal('10000.00')
        self.buyer.wallet.save(update_fields=['available_balance', 'updated_at'])

    def test_create_transaction_deducts_fee_and_records_revenue(self):
        transaction = TransactionService.create_transaction(
            buyer=self.buyer,
            seller=self.seller,
            amount=Decimal('5000.00'),
            description='Escrow payment',
        )

        self.buyer.wallet.refresh_from_db()
        self.assertEqual(self.buyer.wallet.available_balance, Decimal('4000.00'))
        self.assertEqual(self.buyer.wallet.escrow_balance, Decimal('5000.00'))
        self.assertEqual(transaction.fee_charged, Decimal('1000.00'))
        self.assertEqual(transaction.status, Transaction.Status.PENDING)
        self.assertTrue(PlatformRevenue.objects.filter(transaction=transaction).exists())
        self.assertEqual(
            PlatformRevenue.objects.get(transaction=transaction).amount,
            Decimal('1000.00'),
        )
