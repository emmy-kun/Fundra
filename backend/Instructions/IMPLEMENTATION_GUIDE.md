# PayFlow Backend - Complete Implementation Guide

## Project Overview

This is a **production-ready Django REST Framework backend** for a secure escrow-based payment system. The architecture uses atomic transactions to ensure financial operations are safe from race conditions.

## 📁 Generated Files Structure

```
backend/
├── payflow_backend/              # Main Django Project
│   ├── __init__.py
│   ├── settings.py               # ✅ Complete settings (ready to use)
│   ├── urls.py                   # ✅ URL routing
│   ├── wsgi.py                   # ✅ WSGI config
│
├── users/                        # User Authentication App
│   ├── __init__.py
│   ├── models.py                 # ✅ Custom User model with role field
│   ├── views.py                  # ✅ User viewsets (register, profile)
│   ├── serializers.py            # ✅ User serializers
│   ├── urls.py                   # ✅ User routes
│   ├── signals.py                # ✅ Auto-create wallet on user creation
│   ├── apps.py                   # ✅ App config
│   ├── admin.py                  # ✅ Admin panel
│
├── wallets/                      # Wallet Management App
│   ├── __init__.py
│   ├── models.py                 # ✅ Wallet model (available + escrow balance)
│   ├── views.py                  # ✅ Wallet viewsets
│   ├── serializers.py            # ✅ Wallet serializers
│   ├── services.py               # ✅ ATOMIC wallet operations
│   ├── urls.py                   # ✅ Wallet routes
│   ├── apps.py                   # ✅ App config
│   ├── admin.py                  # ✅ Admin panel
│
├── transactions/                 # Transaction State Machine App
│   ├── __init__.py
│   ├── models.py                 # ✅ Transaction model + state logic
│   ├── views.py                  # ✅ Transaction viewsets
│   ├── serializers.py            # ✅ Transaction serializers
│   ├── services.py               # ✅ ATOMIC transaction operations
│   ├── urls.py                   # ✅ Transaction routes
│   ├── apps.py                   # ✅ App config
│   ├── admin.py                  # ✅ Admin panel
│
├── utils/                        # Shared Utilities
│   ├── __init__.py
│   ├── custom_permissions.py     # ✅ DRF permissions (IsBuyer, IsSeller, etc)
│   ├── exceptions.py             # ✅ Custom exceptions
│   ├── apps.py                   # ✅ App config
│   ├── models.py                 # ✅ Empty (placeholder)
│   ├── views.py                  # ✅ Empty (placeholder)
│
├── manage.py                     # ✅ Django management script
├── requirements.txt              # ✅ Python dependencies
├── .gitignore                    # ✅ Git ignore patterns
├── .env.example                  # ✅ Environment template
├── README.md                     # ✅ Setup instructions
├── SETTINGS_GUIDE.md             # ✅ Settings explanation
└── IMPLEMENTATION_GUIDE.md       # ✅ This file
```

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 3: Start Server
```bash
python manage.py runserver
```

Access API: http://localhost:8000/api/

## 🔐 Core Features Implemented

### 1. User Authentication
- **Model**: `users.models.User` (extends AbstractUser)
- **Roles**: BUYER or SELLER
- **Features**:
  - Custom registration endpoint
  - Password change endpoint
  - Profile retrieval
  - List all sellers

**Key Files**:
- `users/models.py` - User model with role field
- `users/views.py` - User viewsets
- `users/serializers.py` - User serializers
- `users/signals.py` - Auto-creates wallet on user creation

### 2. Wallet System
- **Model**: `wallets.models.Wallet` (OneToOne with User)
- **Fields**:
  - `available_balance` - Spendable funds
  - `escrow_balance` - Locked in transactions
  - `total_balance` - Computed property (available + escrow)

**Atomic Operations** (`wallets/services.py`):
- `add_balance()` - Add funds
- `deduct_balance()` - Deduct funds (with validation)
- `lock_to_escrow()` - Lock funds when transaction starts
- `release_from_escrow()` - Refund funds when cancelled
- `transfer_from_escrow_to_seller()` - Release to seller on confirmation

**Key Files**:
- `wallets/models.py` - Wallet model
- `wallets/services.py` - Atomic operations (uses `@transaction.atomic`)
- `wallets/views.py` - Wallet viewsets

### 3. Transaction State Machine
- **Model**: `transactions.models.Transaction`
- **Status Flow**:
  ```
  PENDING (buyer sends) 
    ↓
  PROCESSING (seller processing) 
    ↓
  SHIPPED (seller ships)
    ↓
  SUCCESSFUL (buyer confirms) → funds released to seller
    
  Or at any point (PENDING/PROCESSING):
    ↓
  CANCELED → funds refunded to buyer
  ```

**Key Files**:
- `transactions/models.py` - Transaction model with state properties
- `transactions/services.py` - State machine logic (atomic)
- `transactions/views.py` - Transaction viewsets

### 4. Permission System
- `IsBuyer` - Only buyers can access
- `IsSeller` - Only sellers can access
- `IsTransactionParticipant` - Buyer or seller of transaction
- `IsTransactionBuyer` - Only transaction buyer
- `IsTransactionSeller` - Only transaction seller

**Key File**: `utils/custom_permissions.py`

### 5. Error Handling
- `InsufficientBalanceError` - Not enough balance
- `InvalidTransactionStatusError` - Invalid state transition
- `UnauthorizedTransactionAccessError` - Not transaction participant

**Key File**: `utils/exceptions.py`

## 📡 API Endpoints

### Users
```
POST   /api/users/                    Register user
GET    /api/users/me/                 Get current user profile
POST   /api/users/change_password/    Change password
GET    /api/users/                    List sellers
```

### Wallets
```
GET    /api/wallets/my_wallet/        Get current user's wallet
POST   /api/wallets/add_funds/        Add funds (buyer only)
```

### Transactions (Core Escrow Logic)
```
POST   /api/transactions/                        Create transaction (buyer sends money)
GET    /api/transactions/                        List user's transactions
GET    /api/transactions/{id}/                   Get transaction details
POST   /api/transactions/{id}/update_status/     Update status (seller only)
POST   /api/transactions/{id}/cancel/            Cancel transaction (buyer only)
POST   /api/transactions/{id}/confirm_delivery/  Confirm delivery (buyer only)
GET    /api/transactions/as_buyer/               Get buyer transactions
GET    /api/transactions/as_seller/              Get seller transactions
```

## 🔄 Complete User Flow Example

### Step 1: Registration
```bash
POST /api/users/
{
  "username": "john_buyer",
  "email": "john@example.com",
  "password": "secure_password_123",
  "password_confirm": "secure_password_123",
  "role": "BUYER",
  "first_name": "John"
}
```
✅ Response: User created + Wallet auto-created

### Step 2: Add Funds
```bash
POST /api/wallets/add_funds/
Authorization: Bearer {token}
{
  "amount": 1000.00
}
```
✅ Response: Wallet balance = 1000.00 available

### Step 3: View Sellers
```bash
GET /api/users/?role=SELLER
Authorization: Bearer {token}
```
✅ Response: List of sellers

### Step 4: Send Money (Transaction Created)
```bash
POST /api/transactions/
Authorization: Bearer {token}
{
  "seller_id": 5,
  "amount": 50.00,
  "description": "Payment for item XYZ"
}
```
✅ Actions:
- Transaction created with status PENDING
- 50.00 deducted from buyer's available_balance
- 50.00 added to buyer's escrow_balance
- Seller notified

### Step 5: Seller Marks as Processing
```bash
POST /api/transactions/123/update_status/
Authorization: Bearer {seller_token}
{
  "status": "PROCESSING"
}
```
✅ Status: PENDING → PROCESSING

### Step 6: Seller Marks as Shipped
```bash
POST /api/transactions/123/update_status/
Authorization: Bearer {seller_token}
{
  "status": "SHIPPED"
}
```
✅ Status: PROCESSING → SHIPPED

### Step 7: Buyer Confirms Delivery
```bash
POST /api/transactions/123/confirm_delivery/
Authorization: Bearer {buyer_token}
```
✅ Actions:
- Status: SHIPPED → SUCCESSFUL
- 50.00 removed from buyer's escrow_balance
- 50.00 added to seller's available_balance
- Transaction complete!

### Alternative: Buyer Cancels (if PENDING/PROCESSING)
```bash
POST /api/transactions/123/cancel/
Authorization: Bearer {buyer_token}
```
✅ Actions:
- Status → CANCELED
- 50.00 returned from escrow to available_balance
- Seller doesn't receive funds

## 💾 Database Schema

### User Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(10) CHECK (role IN ('BUYER', 'SELLER')),
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP AUTO_INCREMENT,
    updated_at TIMESTAMP AUTO_INCREMENT
);
```

### Wallet Table
```sql
CREATE TABLE wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    available_balance DECIMAL(19,2) DEFAULT 0.00,
    escrow_balance DECIMAL(19,2) DEFAULT 0.00,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Transaction Table
```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'SUCCESSFUL', 'CANCELED')),
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE PROTECT,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE PROTECT
);
```

## ⚙️ Settings Configuration

**Key settings in `payflow_backend/settings.py`:**

```python
# Custom user model
AUTH_USER_MODEL = 'users.User'

# Installed apps (includes our 4 apps)
INSTALLED_APPS = [
    'rest_framework',
    'corsheaders',
    'users.apps.UsersConfig',
    'wallets.apps.WalletsConfig',
    'transactions.apps.TransactionsConfig',
    'utils.apps.UtilsConfig',
]

# DRF authentication
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# CORS for React frontend
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']

# Database (SQLite for dev, PostgreSQL for prod)
DATABASES = {...}
```

**See `SETTINGS_GUIDE.md` for complete details.**

## 🛡️ Security Features

✅ **Atomic Transactions**: All financial operations use `@transaction.atomic()` to prevent race conditions

✅ **Permission Checking**: Every endpoint validates user permissions

✅ **State Machine Validation**: Only valid status transitions allowed

✅ **Balance Validation**: Cannot spend more than available

✅ **SQL Injection Prevention**: Django ORM protects against injection

✅ **CSRF Protection**: Enabled by default

✅ **Password Hashing**: Using Django's password hasher

✅ **Token Authentication**: For frontend/mobile apps

## 📝 Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "role": "BUYER"
  }'

# Get wallet
curl -X GET http://localhost:8000/api/wallets/my_wallet/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create transaction
curl -X POST http://localhost:8000/api/transactions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seller_id": 2,
    "amount": 50.00,
    "description": "Test transaction"
  }'
```

### Using Django Admin
```
1. Create superuser: python manage.py createsuperuser
2. Visit http://localhost:8000/admin/
3. Manage Users, Wallets, Transactions
```

## 🚀 Production Deployment

1. **Database**: Switch to PostgreSQL (update settings.py)
2. **Secret Key**: Generate strong key
3. **Debug**: Set `DEBUG = False`
4. **Allowed Hosts**: Configure for your domain
5. **HTTPS**: Enable SSL/TLS
6. **Environment**: Use environment variables
7. **Static Files**: Run `python manage.py collectstatic`
8. **Server**: Use Gunicorn/uWSGI
9. **Reverse Proxy**: Use Nginx
10. **Monitoring**: Add error tracking (Sentry)

## 📚 File Descriptions

| File | Purpose |
|------|---------|
| `models.py` | Database models (User, Wallet, Transaction) |
| `services.py` | Business logic with @transaction.atomic |
| `views.py` | API endpoints (ViewSets) |
| `serializers.py` | JSON serialization/deserialization |
| `urls.py` | URL routing |
| `permissions.py` | DRF permission classes |
| `signals.py` | Django signals (auto-create wallet) |
| `settings.py` | Django configuration |

## 🔧 Next Steps

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Run migrations: `python manage.py migrate`
3. ✅ Create superuser: `python manage.py createsuperuser`
4. ✅ Start server: `python manage.py runserver`
5. ✅ Test endpoints (see Testing section)
6. ✅ Connect React frontend to API

## ❓ FAQ

**Q: How does escrow work?**
A: When buyer sends money, it moves from available_balance to escrow_balance. On delivery confirmation, it moves to seller's available_balance. On cancellation, it returns to buyer's available_balance.

**Q: Are transactions safe from race conditions?**
A: Yes! All wallet operations use `@transaction.atomic()` which uses database-level locking to prevent race conditions.

**Q: Can I change database to PostgreSQL?**
A: Yes! Update DATABASES in settings.py and install psycopg2-binary (already in requirements.txt).

**Q: How do I add authentication tokens?**
A: DRF handles it automatically. Use SessionAuthentication (login) or TokenAuthentication (token).

**Q: Can multiple roles exist for one user?**
A: Currently no - users are either BUYER or SELLER. To change this, modify the User model's role field to ManyToMany.

## 📞 Support & Documentation

- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- PostgreSQL: https://www.postgresql.org/docs/

---

**Backend is ready to integrate with React frontend!** 🎉
