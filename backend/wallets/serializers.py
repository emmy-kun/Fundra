from rest_framework import serializers
from wallets.models import Wallet


class WalletSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    total_balance = serializers.DecimalField(
        max_digits=19,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Wallet
        fields = ('id', 'username', 'email', 'available_balance', 'escrow_balance', 'total_balance', 'created_at', 'updated_at')
        read_only_fields = ('id', 'available_balance', 'escrow_balance', 'created_at', 'updated_at')
