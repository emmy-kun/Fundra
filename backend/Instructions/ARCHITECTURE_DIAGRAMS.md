# PayFlow Backend - Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)                        │
│                  - Buyer Dashboard                                   │
│                  - Seller Dashboard                                  │
│                  - Transaction Management                            │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTP/REST API Calls
                         │ CORS Enabled
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Django REST Framework Backend (Port 8000)               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    URL Routing Layer                          │  │
│  │            /api/users/  /api/wallets/  /api/transactions/    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         ▼ ▼ ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   DRF ViewSets Layer                         │  │
│  │  ┌────────────┬──────────────┬──────────────┬────────────┐  │  │
│  │  │ UserViewSet│ WalletViewSet│TransactionSet│UtilsViews │  │  │
│  │  └────────────┴──────────────┴──────────────┴────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         ▼ ▼ ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Serializers Layer (JSON)                        │  │
│  │  ┌────────────┬──────────────┬──────────────┐               │  │
│  │  │UserSerializer│WalletSerializer│TransactionSerializer│   │  │
│  │  └────────────┴──────────────┴──────────────┘               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         ▼ ▼ ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Permission Layer (Custom DRF)                      │  │
│  │  ┌────────────┬──────────────┬──────────────┐               │  │
│  │  │ IsBuyer    │ IsSeller     │ IsTxnPartic. │               │  │
│  │  └────────────┴──────────────┴──────────────┘               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         ▼ ▼ ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         Business Logic Layer (@transaction.atomic)           │  │
│  │  ┌────────────────────┬──────────────────────────────────┐  │  │
│  │  │  WalletService     │  TransactionService             │  │  │
│  │  │  - add_balance     │  - create_transaction          │  │  │
│  │  │  - lock_to_escrow  │  - update_status               │  │  │
│  │  │  - release_from    │  - cancel_transaction          │  │  │
│  │  │  - transfer        │  - confirm_delivery            │  │  │
│  │  └────────────────────┴──────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         ▼ ▼ ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 ORM Layer (Django Models)                    │  │
│  │  ┌───────────┬──────────────┬──────────────┐                │  │
│  │  │   User    │   Wallet     │ Transaction  │                │  │
│  │  └───────────┴──────────────┴──────────────┘                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                         ▼
                  ┌──────────────┐
                  │   Database   │
                  │  (SQLite or  │
                  │  PostgreSQL) │
                  └──────────────┘
```

## Transaction Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ESCROW TRANSACTION FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

TIME: T0
┌───────────────────────────────────────────────────────────────────────┐
│ BUYER: Initiates Payment                                              │
│ ─────────────────────────────────────────────────────────────────────  │
│ Action: POST /api/transactions/                                       │
│         { seller_id: 2, amount: 50.00 }                              │
│                                                                        │
│ Service Call: TransactionService.create_transaction()                │
│   1. WalletService.lock_to_escrow(buyer, 50.00)                     │
│      - available_balance: 1000 → 950                                 │
│      - escrow_balance: 0 → 50                                        │
│   2. Transaction.objects.create(status=PENDING)                     │
│                                                                        │
│ Result: ✅ Transaction created (PENDING)                             │
│         ✅ Funds locked in escrow                                     │
└───────────────────────────────────────────────────────────────────────┘

TIME: T1
┌───────────────────────────────────────────────────────────────────────┐
│ SELLER: Marks as Processing                                           │
│ ─────────────────────────────────────────────────────────────────────  │
│ Action: POST /api/transactions/1/update_status/                      │
│         { status: "PROCESSING" }                                     │
│                                                                        │
│ Service Call: TransactionService.update_status(txn, PROCESSING)      │
│   1. Validate transition: PENDING → PROCESSING ✅                    │
│   2. Update transaction.status = PROCESSING                          │
│                                                                        │
│ Wallets: UNCHANGED                                                    │
│ Result: ✅ Status: PENDING → PROCESSING                              │
└───────────────────────────────────────────────────────────────────────┘

TIME: T2
┌───────────────────────────────────────────────────────────────────────┐
│ SELLER: Marks as Shipped                                              │
│ ─────────────────────────────────────────────────────────────────────  │
│ Action: POST /api/transactions/1/update_status/                      │
│         { status: "SHIPPED" }                                        │
│                                                                        │
│ Service Call: TransactionService.update_status(txn, SHIPPED)         │
│   1. Validate transition: PROCESSING → SHIPPED ✅                    │
│   2. Update transaction.status = SHIPPED                             │
│                                                                        │
│ Wallets: UNCHANGED                                                    │
│ Result: ✅ Status: PROCESSING → SHIPPED                              │
└───────────────────────────────────────────────────────────────────────┘

TIME: T3 (SUCCESS PATH)
┌───────────────────────────────────────────────────────────────────────┐
│ BUYER: Confirms Delivery (SUCCESSFUL)                                │
│ ─────────────────────────────────────────────────────────────────────  │
│ Action: POST /api/transactions/1/confirm_delivery/                   │
│                                                                        │
│ Service Call: TransactionService.confirm_delivery(txn, buyer)        │
│   1. Validate: status = SHIPPED ✅                                   │
│   2. WalletService.transfer_from_escrow_to_seller(                  │
│        buyer, seller, 50.00)                                         │
│       - Buyer escrow: 50 → 0                                         │
│       - Seller available: 0 → 50                                     │
│   3. Update transaction.status = SUCCESSFUL                          │
│                                                                        │
│ Buyer Wallet:           Seller Wallet:                                │
│ available: 950          available: 50 ← RECEIVED!                    │
│ escrow: 0               escrow: 0                                    │
│                                                                        │
│ Result: ✅ TRANSACTION COMPLETE                                       │
│         ✅ Funds transferred to seller                                │
└───────────────────────────────────────────────────────────────────────┘

OR

TIME: T3 (CANCEL PATH)
┌───────────────────────────────────────────────────────────────────────┐
│ BUYER: Cancels Transaction (PENDING or PROCESSING)                   │
│ ─────────────────────────────────────────────────────────────────────  │
│ Action: POST /api/transactions/1/cancel/                             │
│                                                                        │
│ Service Call: TransactionService.cancel_transaction(txn, buyer)      │
│   1. Validate: status in [PENDING, PROCESSING] ✅                   │
│   2. WalletService.release_from_escrow(buyer, 50.00)                │
│       - Buyer available: 950 → 1000                                  │
│       - Buyer escrow: 50 → 0                                         │
│   3. Update transaction.status = CANCELED                            │
│                                                                        │
│ Buyer Wallet:           Seller Wallet:                                │
│ available: 1000 ← REFUNDED! available: 0 (unchanged)                │
│ escrow: 0               escrow: 0                                    │
│                                                                        │
│ Result: ✅ TRANSACTION CANCELLED                                      │
│         ✅ Funds refunded to buyer                                    │
│         ✅ Seller received nothing                                    │
└───────────────────────────────────────────────────────────────────────┘
```

## Database Relationships

```
┌────────────────────────────────────────────────────────────┐
│                     User (users_user)                      │
│                                                            │
│  PK: id                                                    │
│  username (UNIQUE)                                         │
│  email (UNIQUE)                                            │
│  role (BUYER or SELLER)                                   │
│  password (hashed)                                         │
│  first_name, last_name                                    │
│  is_active, is_staff                                      │
│  created_at, updated_at                                   │
│                                                            │
│  Relationships:                                            │
│  - wallet (OneToOne) → Wallet                             │
│  - transactions_as_buyer (OneToMany) → Transaction       │
│  - transactions_as_seller (OneToMany) → Transaction      │
└────────────────────────────────────────────────────────────┘
           ▲
           │ OneToOne
           │
┌────────────────────────────────────────────────────────────┐
│                  Wallet (wallets_wallet)                   │
│                                                            │
│  PK: id                                                    │
│  FK: user_id (OneToOne)                                   │
│  available_balance (Decimal 19,2)                         │
│  escrow_balance (Decimal 19,2)                            │
│  created_at, updated_at                                   │
│                                                            │
│  Computed Property:                                        │
│  - total_balance = available + escrow                     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              Transaction (transactions_transaction)        │
│                                                            │
│  PK: id                                                    │
│  FK: buyer_id → User (as BUYER)                           │
│  FK: seller_id → User (as SELLER)                         │
│  amount (Decimal 19,2)                                    │
│  status (PENDING/PROCESSING/SHIPPED/SUCCESSFUL/CANCELED) │
│  description (Text, optional)                             │
│  created_at, updated_at                                   │
│                                                            │
│  Computed Properties:                                      │
│  - is_pending, is_processing, is_shipped                  │
│  - is_successful, is_canceled                             │
│  - can_cancel (PENDING or PROCESSING)                     │
│  - can_confirm_delivery (SHIPPED only)                    │
└────────────────────────────────────────────────────────────┘
```

## Request/Response Flow Example

### Complete Transaction Lifecycle

```
CLIENT (React)                    BACKEND (Django)             DATABASE

[Register Buyer]
   │
   ├─ POST /api/users/           ──────────────>  UserViewSet.create()
   │                                              ├─ UserCreateSerializer.save()
   │                                              ├─ User.objects.create_user()
   │                                              └─ signals.create_wallet()
   │                            <──────────────   ✅ User + Wallet created
   │
   ├─ Response: User ID, Token   <──────────────  { "id": 1, ... }
   │
[Add Funds]
   │
   ├─ POST /api/wallets/add_funds/
   │  { "amount": 1000 }        ──────────────>  WalletViewSet.add_funds()
   │                                             ├─ WalletService.add_balance()
   │                                             └─ wallet.save()
   │                            <──────────────   ✅ Wallet updated
   │
   ├─ Response: available=1000,
   │  escrow=0                  <──────────────   { available_balance: 1000, ... }
   │
[Create Transaction]
   │
   ├─ POST /api/transactions/
   │  { seller_id: 2,           ──────────────>  TransactionViewSet.create()
   │    amount: 50 }                            ├─ TransactionCreateSerializer.validate()
   │                                             ├─ TransactionService.create_transaction()
   │                                             │  ├─ @transaction.atomic
   │                                             │  ├─ WalletService.lock_to_escrow()
   │                                             │  │  └─ UPDATE wallets SET...
   │                                             │  └─ Transaction.objects.create()
   │                                             │     └─ INSERT INTO transactions...
   │                            <──────────────   ✅ Transaction created
   │
   ├─ Response: status=PENDING,
   │  amount=50                 <──────────────   { "id": 1, "status": "PENDING", ... }
   │
[Update Status - Seller]
   │
   ├─ POST /api/transactions/1/
   │  update_status/
   │  { status: "SHIPPED" }     ──────────────>  TransactionViewSet.update_status()
   │                                             ├─ IsTransactionSeller permission ✅
   │                                             ├─ TransactionStatusUpdateSerializer
   │                                             └─ TransactionService.update_status()
   │                                                ├─ @transaction.atomic
   │                                                ├─ validate_transition()
   │                                                └─ UPDATE transactions SET status=...
   │
   │                            <──────────────   ✅ Status updated
   │
   ├─ Response: status=SHIPPED  <──────────────   { "id": 1, "status": "SHIPPED", ... }
   │
[Confirm Delivery - Buyer]
   │
   ├─ POST /api/transactions/1/
   │  confirm_delivery/         ──────────────>  TransactionViewSet.confirm_delivery()
   │                                             ├─ IsTransactionBuyer permission ✅
   │                                             └─ TransactionService.confirm_delivery()
   │                                                ├─ @transaction.atomic
   │                                                ├─ validate_status = SHIPPED ✅
   │                                                ├─ WalletService.transfer_from_escrow()
   │                                                │  ├─ UPDATE buyer wallet SET escrow-50
   │                                                │  └─ UPDATE seller wallet SET available+50
   │                                                └─ UPDATE transaction status=SUCCESSFUL
   │
   │                            <──────────────   ✅ Funds transferred
   │
   └─ Response: status=SUCCESSFUL
                                <──────────────   { "id": 1, "status": "SUCCESSFUL", ... }
```

## Permission & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│              INCOMING REQUEST                               │
│  POST /api/transactions/1/update_status/                   │
│  Authorization: Bearer TOKEN_XYZ                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  DRF Authenticate    │
        │  (TokenAuth)         │
        └──────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Check user authenticated │
    └──────┬───────────────────┘
           │ ✅ Yes
           ▼
    ┌──────────────────────────┐
    │ Is User Authenticated?   │
    │ permission_classes:      │
    │ [IsAuthenticated]        │
    └──────┬───────────────────┘
           │ ✅ Yes
           ▼
    ┌──────────────────────────┐
    │ Get Transaction Object   │
    │ txn = Txn.objects.get(1) │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ Check Custom Permission  │
    │ IsTransactionSeller:     │
    │ user == txn.seller?      │
    └──────┬───────────────────┘
           │
           ├─ ✅ Yes → Execute view
           │
           └─ ❌ No → Return 403 Forbidden
                "You do not have permission"
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────┐
│          BUSINESS LOGIC ERROR HANDLING           │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌─────────────────────┐  ┌──────────────────────┐
│InsufficientBalance  │  │InvalidTransactionStat│
│    Error            │  │       Error          │
│                     │  │                      │
│Available: 100       │  │Cannot go from        │
│Required: 500        │  │SHIPPED to PENDING    │
│                     │  │                      │
└──────┬──────────────┘  └──────┬───────────────┘
       │                        │
       ▼                        ▼
┌─────────────────────────────────────┐
│  Caught in View Try/Except Block    │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Return HTTP 400 Response │
    │ with Error Message       │
    │                          │
    │ {                        │
    │   "error": "Insufficient │
    │   balance. Available:    │
    │   100, Required: 500"    │
    │ }                        │
    └──────────────────────────┘
```

## Atomic Transaction Guarantee

```
@transaction.atomic
def confirm_delivery():
    ┌─────────────────────────────────────┐
    │  BEGIN TRANSACTION                  │
    │  (Database Lock Acquired)           │
    └─────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Step 1: Validate Status             │
    │ if txn.status != SHIPPED:           │
    │     raise InvalidStatusError()      │
    └─────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Step 2: Deduct from Buyer Escrow    │
    │ buyer_wallet.escrow -= 50           │
    │ buyer_wallet.save()                 │
    │ UPDATE wallets SET escrow = escrow-50│
    │ WHERE user_id = buyer_id            │
    └─────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Step 3: Add to Seller Balance       │
    │ seller_wallet.available += 50       │
    │ seller_wallet.save()                │
    │ UPDATE wallets SET available = ... │
    │ WHERE user_id = seller_id           │
    └─────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Step 4: Update Transaction Status   │
    │ txn.status = SUCCESSFUL             │
    │ txn.save()                          │
    │ UPDATE transactions SET status=...  │
    │ WHERE id = 1                        │
    └─────────────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼ SUCCESS     ▼ ERROR
┌──────────┐  ┌────────────────┐
│ COMMIT   │  │ ROLLBACK       │
│          │  │ (All changes   │
│ All      │  │  reverted)     │
│Changes   │  │                │
│Applied   │  │                │
└──────────┘  └────────────────┘
     │              │
     └──────┬───────┘
            ▼
    ┌─────────────────────┐
    │ UNLOCK DATABASE     │
    │ (Transaction end)   │
    └─────────────────────┘
```

---

These diagrams show the complete architecture, flow, and security model of the PayFlow backend system.
