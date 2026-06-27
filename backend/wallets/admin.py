from django.contrib import admin
from wallets.models import PlatformRevenue, Wallet


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'available_balance', 'escrow_balance', 'total_balance', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'total_balance')
    date_hierarchy = 'created_at'

    def total_balance(self, obj):
        return obj.total_balance
    total_balance.short_description = 'Total Balance'


@admin.register(PlatformRevenue)
class PlatformRevenueAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'amount', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('transaction__id', 'transaction__buyer__username', 'transaction__seller__username')
    readonly_fields = ('created_at',)
