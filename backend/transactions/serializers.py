from rest_framework import serializers
from transactions.models import Transaction
from users.serializers import UserSerializer


class TransactionSerializer(serializers.ModelSerializer):
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    can_confirm_delivery = serializers.BooleanField(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id',
            'buyer',
            'buyer_username',
            'seller',
            'seller_username',
            'amount',
            'fee_charged',
            'status',
            'description',
            'can_cancel',
            'can_confirm_delivery',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'buyer_username', 'seller_username', 'can_cancel', 'can_confirm_delivery', 'created_at', 'updated_at')


class TransactionCreateSerializer(serializers.ModelSerializer):
    seller_id = serializers.IntegerField(write_only=True, required=False)
    seller_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Transaction
        fields = ('seller_id', 'seller_email', 'amount', 'description')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate(self, attrs):
        seller_id = attrs.get('seller_id')
        seller_email = attrs.get('seller_email')

        if seller_id is None and seller_email is None:
            raise serializers.ValidationError({"seller_id": "Either seller_id or seller_email is required"})

        if seller_id is not None and seller_email is not None:
            raise serializers.ValidationError({"seller_email": "Provide either seller_id or seller_email, not both"})

        return attrs


class TransactionStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Transaction.Status.choices)

    def validate_status(self, value):
        if value not in [Transaction.Status.PROCESSING, Transaction.Status.SHIPPED, Transaction.Status.CANCELED]:
            raise serializers.ValidationError("Invalid status for update")
        return value


class TransactionDetailSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    can_confirm_delivery = serializers.BooleanField(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id',
            'buyer',
            'seller',
            'amount',
            'fee_charged',
            'status',
            'description',
            'can_cancel',
            'can_confirm_delivery',
            'created_at',
            'updated_at'
        )
        read_only_fields = fields
