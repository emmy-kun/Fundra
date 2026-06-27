from rest_framework import permissions


class IsBuyer(permissions.BasePermission):
    """Allow access only to buyers."""
    message = 'Only buyers can access this resource.'

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_buyer()


class IsSeller(permissions.BasePermission):
    """Allow access only to sellers."""
    message = 'Only sellers can access this resource.'

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_seller()


class IsTransactionParticipant(permissions.BasePermission):
    """Allow access only to buyer or seller of the transaction."""
    message = 'You are not a participant in this transaction.'

    def has_object_permission(self, request, view, obj):
        # obj is a Transaction instance
        return request.user == obj.buyer or request.user == obj.seller


class IsTransactionBuyer(permissions.BasePermission):
    """Allow access only to buyer of the transaction."""
    message = 'Only the transaction buyer can perform this action.'

    def has_object_permission(self, request, view, obj):
        return request.user == obj.buyer


class IsTransactionSeller(permissions.BasePermission):
    """Allow access only to seller of the transaction."""
    message = 'Only the transaction seller can perform this action.'

    def has_object_permission(self, request, view, obj):
        return request.user == obj.seller
