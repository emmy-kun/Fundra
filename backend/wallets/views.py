from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from wallets.models import Wallet
from wallets.serializers import WalletSerializer
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
