from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from transactions.models import Transaction
from transactions.serializers import (
    TransactionSerializer,
    TransactionCreateSerializer,
    TransactionStatusUpdateSerializer,
    TransactionDetailSerializer
)
from transactions.services import TransactionService
from utils.custom_permissions import IsBuyer, IsSeller, IsTransactionParticipant, IsTransactionBuyer, IsTransactionSeller
from utils.exceptions import InvalidTransactionStatusError, UnauthorizedTransactionAccessError, InsufficientBalanceError


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see their transactions."""
        if self.request.user.is_authenticated:
            return Transaction.objects.filter(
                buyer=self.request.user
            ) | Transaction.objects.filter(
                seller=self.request.user
            )
        return Transaction.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionCreateSerializer
        elif self.action == 'update_status':
            return TransactionStatusUpdateSerializer
        elif self.action == 'retrieve':
            return TransactionDetailSerializer
        return TransactionSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsBuyer()]
        elif self.action == 'update_status':
            return [IsAuthenticated(), IsTransactionSeller()]
        elif self.action in ['cancel', 'confirm_delivery']:
            return [IsAuthenticated(), IsTransactionBuyer()]
        return [IsAuthenticated(), IsTransactionParticipant()]

    def create(self, request, *args, **kwargs):
        """
        Create a new transaction (send money).
        Buyer initiates payment to seller.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        seller_id = serializer.validated_data.get('seller_id')
        seller_email = serializer.validated_data.get('seller_email')
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description')

        if seller_id is not None:
            seller = get_object_or_404(self.queryset.model.seller.model, id=seller_id)
        else:
            seller = get_object_or_404(self.queryset.model.seller.model, email=seller_email)

        try:
            txn = TransactionService.create_transaction(
                buyer=request.user,
                seller=seller,
                amount=amount,
                description=description
            )
            output_serializer = TransactionDetailSerializer(txn)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        except InsufficientBalanceError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTransactionSeller])
    def update_status(self, request, pk=None):
        """
        Update transaction status (seller action).
        Allowed transitions: PENDING -> PROCESSING -> SHIPPED or -> CANCELED
        """
        txn = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']

        try:
            txn = TransactionService.update_status(txn, new_status, request.user)
            output_serializer = TransactionDetailSerializer(txn)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        except (InvalidTransactionStatusError, UnauthorizedTransactionAccessError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTransactionBuyer])
    def cancel(self, request, pk=None):
        """
        Cancel transaction and refund buyer (buyer action).
        Only allowed if status is PENDING or PROCESSING.
        """
        txn = self.get_object()

        try:
            txn = TransactionService.cancel_transaction(txn, request.user)
            output_serializer = TransactionDetailSerializer(txn)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        except (InvalidTransactionStatusError, UnauthorizedTransactionAccessError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTransactionBuyer])
    def confirm_delivery(self, request, pk=None):
        """
        Confirm delivery and release funds to seller (buyer action).
        Only allowed if status is SHIPPED.
        """
        txn = self.get_object()

        try:
            txn = TransactionService.confirm_delivery(txn, request.user)
            output_serializer = TransactionDetailSerializer(txn)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        except (InvalidTransactionStatusError, UnauthorizedTransactionAccessError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_transactions(self, request):
        """Get all transactions for the current user."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsBuyer])
    def as_buyer(self, request):
        """Get all transactions where current user is the buyer."""
        queryset = Transaction.objects.filter(buyer=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsSeller])
    def as_seller(self, request):
        """Get all transactions where current user is the seller."""
        queryset = Transaction.objects.filter(seller=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
