from django.contrib import admin
from transactions.models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'seller', 'amount', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('buyer__username', 'seller__username', 'id')
    readonly_fields = ('created_at', 'updated_at', 'can_cancel', 'can_confirm_delivery')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Transaction Details', {
            'fields': ('buyer', 'seller', 'amount', 'status', 'description')
        }),
        ('Status Info', {
            'fields': ('can_cancel', 'can_confirm_delivery')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
