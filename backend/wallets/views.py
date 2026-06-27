from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from wallets.models import PlatformRevenue, Wallet
from wallets.serializers import PlatformRevenueSummarySerializer, WalletSerializer
from utils.custom_permissions import IsBuyer, IsSeller


class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own wallet."""
        if self.request.user.is_authenticated:
            return Wallet.objects.filter(user=self.request.user)
        return Wallet.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_wallet(self, request):
        """Get current user's wallet."""
        try:
            wallet = request.user.wallet
            serializer = self.get_serializer(wallet)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Wallet.DoesNotExist:
            return Response(
                {'error': 'Wallet not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def platform_revenue(self, request):
        """Return platform revenue totals for superusers only."""
        if not request.user.is_superuser:
            return Response({'detail': 'Only superusers can access platform revenue totals.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = PlatformRevenue.objects.select_related('transaction').all()
        total_revenue = queryset.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        summary = {
            'total_revenue': f'{total_revenue:.2f}',
            'transaction_count': queryset.count(),
            'transactions': PlatformRevenueSummarySerializer(queryset, many=True).data,
        }
        return Response(summary, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsBuyer])
    def add_funds(self, request):
        """
        Add funds to buyer's available balance.
        In a real application, this would integrate with a payment gateway.
        """
        from wallets.services import WalletService
        from utils.exceptions import InsufficientBalanceError

        amount = request.data.get('amount')

        if not amount:
            return Response(
                {'error': 'amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("Amount must be positive")

            wallet = WalletService.add_balance(request.user, amount)
            serializer = self.get_serializer(wallet)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except (ValueError, InsufficientBalanceError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
