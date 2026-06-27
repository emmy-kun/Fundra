# PayFlow Backend - API Test Requests

This file contains example API requests you can use to test all endpoints.

## Authentication

Most endpoints require authentication. You can authenticate using:
- **Token Authentication**: `Authorization: Bearer {token}`
- **Session Authentication**: Login via `/api-auth/login/`

## 1. User Management

### Register New Buyer
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_buyer",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "role": "BUYER",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

Response:
```json
{
  "id": 1,
  "username": "john_buyer",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "BUYER",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Register New Seller
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_seller",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "role": "SELLER",
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

### Get Current User Profile
```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List All Sellers
```bash
curl -X GET http://localhost:8000/api/users/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

### Change Password
```bash
curl -X POST http://localhost:8000/api/users/change_password/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "OldPass123!",
    "new_password": "NewPass456!",
    "new_password_confirm": "NewPass456!"
  }'
```

## 2. Wallet Operations

### Get My Wallet
```bash
curl -X GET http://localhost:8000/api/wallets/my_wallet/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

Response:
```json
{
  "id": 1,
  "username": "john_buyer",
  "email": "john@example.com",
  "available_balance": "0.00",
  "escrow_balance": "0.00",
  "total_balance": "0.00",
  "created_at": "2024-01-15T10:30:01Z",
  "updated_at": "2024-01-15T10:30:01Z"
}
```

### Add Funds (Simulate Deposit)
```bash
curl -X POST http://localhost:8000/api/wallets/add_funds/ \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00
  }'
```

Response:
```json
{
  "id": 1,
  "username": "john_buyer",
  "email": "john@example.com",
  "available_balance": "1000.00",
  "escrow_balance": "0.00",
  "total_balance": "1000.00",
  "created_at": "2024-01-15T10:30:01Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

## 3. Transaction Operations (Escrow Flow)

### Create Transaction (Buyer Sends Money)
This is the first step - buyer initiates payment to seller.

```bash
curl -X POST http://localhost:8000/api/transactions/ \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seller_id": 2,
    "amount": 50.00,
    "description": "Payment for vintage watch"
  }'
```

Response:
```json
{
  "id": 1,
  "buyer": {
    "id": 1,
    "username": "john_buyer",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "BUYER"
  },
  "seller": {
    "id": 2,
    "username": "jane_seller",
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "SELLER"
  },
  "amount": "50.00",
  "status": "PENDING",
  "description": "Payment for vintage watch",
  "can_cancel": true,
  "can_confirm_delivery": false,
  "created_at": "2024-01-15T10:40:00Z",
  "updated_at": "2024-01-15T10:40:00Z"
}
```

**Wallet State After:**
- Buyer available_balance: 950.00 (was 1000.00)
- Buyer escrow_balance: 50.00 (was 0.00)
- Seller balance: unchanged

### List My Transactions
```bash
curl -X GET http://localhost:8000/api/transactions/my_transactions/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

### Get Transaction Details
```bash
curl -X GET http://localhost:8000/api/transactions/1/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

### Update Transaction Status (Seller)
Status transition: PENDING → PROCESSING
```bash
curl -X POST http://localhost:8000/api/transactions/1/update_status/ \
  -H "Authorization: Bearer SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSING"
  }'
```

Response:
```json
{
  "id": 1,
  "buyer": {...},
  "seller": {...},
  "amount": "50.00",
  "status": "PROCESSING",
  "can_cancel": true,
  "can_confirm_delivery": false,
  "updated_at": "2024-01-15T10:42:00Z"
}
```

### Update Transaction Status Again (Seller)
Status transition: PROCESSING → SHIPPED
```bash
curl -X POST http://localhost:8000/api/transactions/1/update_status/ \
  -H "Authorization: Bearer SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED"
  }'
```

Response:
```json
{
  "id": 1,
  "status": "SHIPPED",
  "can_cancel": false,
  "can_confirm_delivery": true,
  "updated_at": "2024-01-15T10:45:00Z"
}
```

### Confirm Delivery (Buyer)
This completes the transaction and releases funds to seller.

```bash
curl -X POST http://localhost:8000/api/transactions/1/confirm_delivery/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

Response:
```json
{
  "id": 1,
  "status": "SUCCESSFUL",
  "can_cancel": false,
  "can_confirm_delivery": false,
  "updated_at": "2024-01-15T10:48:00Z"
}
```

**Wallet State After:**
- Buyer available_balance: 950.00 (unchanged)
- Buyer escrow_balance: 0.00 (was 50.00)
- Seller available_balance: 50.00 (was 0.00)
- Seller escrow_balance: 0.00 (unchanged)

### Cancel Transaction (Buyer) - Alternative Flow
If buyer wants to cancel before seller ships (PENDING or PROCESSING status):

```bash
curl -X POST http://localhost:8000/api/transactions/1/cancel/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

Response:
```json
{
  "id": 1,
  "status": "CANCELED",
  "can_cancel": false,
  "can_confirm_delivery": false,
  "updated_at": "2024-01-15T10:50:00Z"
}
```

**Wallet State After:**
- Buyer available_balance: 1000.00 (refunded)
- Buyer escrow_balance: 0.00 (was 50.00)
- Seller balance: unchanged (didn't receive funds)

### Get Transactions as Buyer
```bash
curl -X GET http://localhost:8000/api/transactions/as_buyer/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

### Get Transactions as Seller
```bash
curl -X GET http://localhost:8000/api/transactions/as_seller/ \
  -H "Authorization: Bearer SELLER_TOKEN"
```

## Error Examples

### Insufficient Balance
```bash
curl -X POST http://localhost:8000/api/transactions/ \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "seller_id": 2,
    "amount": 2000.00
  }'
```

Response (400):
```json
{
  "error": "Insufficient balance. Available: 950.00, Required: 2000.00"
}
```

### Invalid Status Transition
```bash
curl -X POST http://localhost:8000/api/transactions/1/update_status/ \
  -H "Authorization: Bearer SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUCCESSFUL"
  }'
```

Response (400):
```json
{
  "error": "Cannot transition from PENDING to SUCCESSFUL"
}
```

### Cannot Cancel SHIPPED Transaction
```bash
curl -X POST http://localhost:8000/api/transactions/1/cancel/ \
  -H "Authorization: Bearer BUYER_TOKEN"
```

Response (400):
```json
{
  "error": "Cannot cancel transaction with status SHIPPED. Only PENDING or PROCESSING transactions can be canceled."
}
```

### Unauthorized: Only Seller Can Update Status
```bash
curl -X POST http://localhost:8000/api/transactions/1/update_status/ \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSING"
  }'
```

Response (403):
```json
{
  "detail": "You do not have permission to perform this action."
}
```

## Complete Workflow Example

### Step 1: Create users
- Buyer (john_buyer)
- Seller (jane_seller)

### Step 2: Add funds to buyer
- POST /api/wallets/add_funds/ → 1000.00

### Step 3: Create transaction
- POST /api/transactions/ → seller_id=2, amount=50.00
- Status: PENDING
- Buyer escrow: 50.00

### Step 4: Seller updates to PROCESSING
- POST /api/transactions/1/update_status/ → status="PROCESSING"

### Step 5: Seller updates to SHIPPED
- POST /api/transactions/1/update_status/ → status="SHIPPED"

### Step 6: Buyer confirms delivery
- POST /api/transactions/1/confirm_delivery/
- Status: SUCCESSFUL
- Funds released to seller

## Using Postman

1. Import the requests below into Postman
2. Set environment variable `BUYER_TOKEN` and `SELLER_TOKEN`
3. Run requests in order

**Environment Variables:**
- `base_url` = http://localhost:8000
- `BUYER_TOKEN` = (get from login response)
- `SELLER_TOKEN` = (get from seller login response)

## Debugging

### View Database State
```bash
# Open Django shell
python manage.py shell

# Check balances
from users.models import User
user = User.objects.get(username='john_buyer')
print(f"Available: {user.wallet.available_balance}")
print(f"Escrow: {user.wallet.escrow_balance}")

# Check transactions
from transactions.models import Transaction
Transaction.objects.filter(buyer=user)
```

### View Admin Panel
- Visit: http://localhost:8000/admin/
- Username: superuser
- View Users, Wallets, Transactions

---

**All endpoints tested and working!** ✅
