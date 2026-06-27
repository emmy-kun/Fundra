class InsufficientBalanceError(Exception):
    """Raised when a wallet doesn't have sufficient balance."""
    pass


class InvalidTransactionStatusError(Exception):
    """Raised when a transaction status transition is invalid."""
    pass


class UnauthorizedTransactionAccessError(Exception):
    """Raised when a user tries to access/modify a transaction they're not part of."""
    pass


class EscrowException(Exception):
    """Base class for escrow-related exceptions."""
    pass
