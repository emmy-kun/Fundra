# PayFlow Backend - Django REST Framework Escrow Payment System

## Project Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create .env File
```bash
# Create a .env file in the backend directory
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

## Project Structure

```
backend/
├── payflow_backend/          # Main project settings
│   ├── settings.py          # Django settings
│   ├── urls.py              # URL routing
│   ├── wsgi.py              # WSGI config
│   └── __init__.py
├── users/                   # User authentication app
│   ├── models.py            # Custom User model
│   ├── views.py             # User viewsets
│   ├── serializers.py       # User serializers
│   ├── urls.py              # User URLs
│   ├── signals.py           # User signals (wallet creation)
│   ├── apps.py
│   ├── admin.py
│   └── __init__.py
├── wallets/                 # Wallet management app
│   ├── models.py            # Wallet model
│   ├── views.py             # Wallet viewsets
│   ├── serializers.py       # Wallet serializers
│   ├── services.py          # Wallet business logic (atomic)
│   ├── urls.py              # Wallet URLs
│   ├── apps.py
│   ├── admin.py
│   └── __init__.py
├── transactions/            # Transaction/order state machine
│   ├── models.py            # Transaction model
│   ├── views.py             # Transaction viewsets
│   ├── serializers.py       # Transaction serializers
│   ├── services.py          # Transaction business logic (atomic)
│   ├── urls.py              # Transaction URLs
│   ├── apps.py
│   ├── admin.py
│   └── __init__.py
├── utils/                   # Shared utilities
│   ├── custom_permissions.py  # DRF permissions
│   ├── exceptions.py        # Custom exceptions
│   ├── apps.py
│   └── __init__.py
├── manage.py                # Django management script
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## API Endpoints

### Users
- `POST /api/users/` - Register new user
- `GET /api/users/me/` - Get current user profile
- `POST /api/users/change_password/` - Change password
- `GET /api/users/` - List all sellers

### Wallets
- `GET /api/wallets/my_wallet/` - Get current user's wallet
- `POST /api/wallets/add_funds/` - Add funds (buyer only)

### Transactions
- `POST /api/transactions/` - Create transaction (buyer sends money)
- `GET /api/transactions/` - List user's transactions
- `GET /api/transactions/{id}/` - Get transaction details
- `POST /api/transactions/{id}/update_status/` - Update status (seller only)
- `POST /api/transactions/{id}/cancel/` - Cancel transaction (buyer only)
- `POST /api/transactions/{id}/confirm_delivery/` - Confirm delivery (buyer only)
- `GET /api/transactions/as_buyer/` - Get buyer transactions
- `GET /api/transactions/as_seller/` - Get seller transactions

## Core Features

### 1. User Authentication & Roles
- Custom User model with BUYER/SELLER roles
- Automatic wallet creation on user registration
- Password change endpoint

### 2. Wallet System
- Available balance: Funds available for spending
- Escrow balance: Funds locked in transactions
- Atomic balance operations (prevent race conditions)

### 3. Escrow Transaction State Machine
**Buyer → Seller Flow:**

1. **PENDING**: Buyer sends money (funds locked in escrow)
2. **PROCESSING**: Seller marks as processing
3. **SHIPPED**: Seller marks as shipped
4. **SUCCESSFUL**: Buyer confirms delivery (funds released to seller)

**Cancellation:**
- Can cancel from PENDING or PROCESSING (refunds buyer)
- Cannot cancel from SHIPPED

### 4. Business Logic (services.py)
All financial operations use `@transaction.atomic` to ensure:
- No race conditions
- Consistent state on failure
- ACID compliance

**WalletService Methods:**
- `add_balance()` - Add funds to available balance
- `deduct_balance()` - Deduct funds (with validation)
- `lock_to_escrow()` - Move to escrow (when transaction created)
- `release_from_escrow()` - Release back to available (on cancel)
- `transfer_from_escrow_to_seller()` - Complete transaction

**TransactionService Methods:**
- `create_transaction()` - Initiate payment
- `update_status()` - Seller updates transaction status
- `cancel_transaction()` - Buyer cancels (if allowed)
- `confirm_delivery()` - Buyer confirms, funds released

### 5. DRF Permissions
- `IsBuyer` - Only buyers can access
- `IsSeller` - Only sellers can access
- `IsTransactionParticipant` - Buyer or seller
- `IsTransactionBuyer` - Only transaction buyer
- `IsTransactionSeller` - Only transaction seller

## Settings.py Configuration

Key additions needed (already in payflow_backend/settings.py):

```python
# 1. Custom User Model
AUTH_USER_MODEL = 'users.User'

# 2. INSTALLED_APPS
INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'users.apps.UsersConfig',
    'wallets.apps.WalletsConfig',
    'transactions.apps.TransactionsConfig',
    'utils.apps.UtilsConfig',
]

# 3. MIDDLEWARE
MIDDLEWARE = [
    ...
    'corsheaders.middleware.CorsMiddleware',
    ...
]

# 4. DRF Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# 5. CORS Settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # React frontend
]
```

## Database Schema

### User
- id (PK)
- username (unique)
- email (unique)
- password (hashed)
- role (BUYER/SELLER)
- created_at, updated_at

### Wallet
- id (PK)
- user (OneToOne FK)
- available_balance (Decimal)
- escrow_balance (Decimal)
- created_at, updated_at

### Transaction
- id (PK)
- buyer (FK to User)
- seller (FK to User)
- amount (Decimal)
- status (PENDING/PROCESSING/SHIPPED/SUCCESSFUL/CANCELED)
- description (Text)
- created_at, updated_at

## Running Tests
```bash
python manage.py test
```

## Production Deployment
1. Switch to PostgreSQL (update DATABASES in settings.py)
2. Set `DEBUG = False`
3. Generate strong `SECRET_KEY`
4. Configure allowed hosts
5. Use HTTPS only
6. Use environment variables for sensitive config
7. Run migrations: `python manage.py migrate`
8. Collect static files: `python manage.py collectstatic`
9. Use Gunicorn: `gunicorn payflow_backend.wsgi:application`

## Error Handling
The system raises specific exceptions:
- `InsufficientBalanceError` - Not enough funds
- `InvalidTransactionStatusError` - Invalid state transition
- `UnauthorizedTransactionAccessError` - Not a transaction participant

All exceptions are caught in views and returned as 400 Bad Request with error message.

## Security Considerations
- Passwords hashed with Django's password hasher
- CSRF protection enabled
- SQL injection prevention via ORM
- Atomic transactions prevent race conditions
- Permission checks on all sensitive endpoints
- Token/Session authentication supported

## Future Enhancements
- Email notifications
- Payment gateway integration (Stripe, PayPal)
- Transaction history/audit log
- Dispute resolution system
- Refund policies
- User ratings/reviews
