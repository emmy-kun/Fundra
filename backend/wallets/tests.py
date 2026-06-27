from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase

from transactions.models import Transaction
from transactions.services import TransactionService

User = get_user_model()


class PlatformRevenueAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.superuser = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='password123',
        )
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

    def test_superuser_can_view_platform_revenue_summary(self):
        TransactionService.create_transaction(
            buyer=self.buyer,
            seller=self.seller,
            amount=Decimal('5000.00'),
            description='Escrow payment',
        )

        self.client.force_authenticate(self.superuser)
        response = self.client.get(reverse('wallet-platform-revenue'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_revenue'], '1000.00')
        self.assertEqual(response.data['transaction_count'], 1)

    def test_non_superuser_cannot_view_platform_revenue_summary(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.get(reverse('wallet-platform-revenue'))

        self.assertEqual(response.status_code, 403)
