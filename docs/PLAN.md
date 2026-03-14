# Hashthink Full-Stack Test — Implementation Plan

## Objective

Build a responsive dashboard with a **Receivers** page that displays receiver/beneficiary details and their transactions in a modal popup, with real-time status updates via WebSockets and new transactions arriving via queue.

---

## Reference Designs

| File | Purpose |
|------|---------|
| `Remitland.jpg` | Appendix 1 — Receiver detail modal (primary UI reference) |
| `wallet (home).svg` | Appendix 2 — Dashboard page (bonus, triggers same modal on transaction row click) |

### Dashboard UI (Appendix 2) Key Elements
- **Sidebar navigation**: Dashboard, Conversion, Wallet, Beneficiaries, Reports, Team, Notifications, Settings
- **Account Balance card**: Overall balance in USD, per-currency breakdown (USD $14,000 / INR ₹1,191,680 / CAD $2,878.48) + "Show More"
- **Quick Conversion card** (partial, right side): Cash → Cash rate/fee calculator
- **Transactions section**:
  - Filter tabs: All, Add money, Send Money, Conversion
  - Table columns: `Date & Time`, `Request ID`, `Type`, `To`, `Amount`, `Status`
  - Status badges: `success` (green), `failed` (red), `needs action` (orange)
  - Clicking a transaction row → opens Receiver Detail Modal (Appendix 1)
- **Add Money** (dark green) + **Send Money** (yellow) CTAs in sidebar

### Modal UI (Appendix 1) Key Elements
- Receiver name + type badge (e.g., "Individual")
- Email address
- **3 currency tabs**: AED, USD, CAD — clicking switches transaction list; selected tab highlighted (yellow border)
- **Details section**: Country, Bank name, Branch name, Swift/BIC code + "Show More" toggle
- **"Transactions With [Name]"** section:
  - Search icon
  - "Only Action Needed" toggle
  - Table columns: `#`, `Date & Time`, `Request ID`, `Type`, `To`, `Amount`, `Status`, `Actions`
  - Status badges: `Pending` (yellow), `Cancelled` (red), `Rejected` (red), `Success` (green), `Approved`
  - Action CTAs per status: `Track Your Payment (Amendment)`, `View Reason`, `View Rejection`, `Download`
  - Pagination
- Mobile responsive

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Inertia.js), TypeScript, TailwindCSS |
| Backend | Laravel 12 (PHP 8.5) |
| Database | Supabase (PostgreSQL) |
| Cache | Redis |
| Realtime | Laravel Reverb + Laravel Echo (SocketIO alternative built into Laravel ecosystem) |
| Queue | Laravel Queues with Redis driver (or RabbitMQ connector) |
| Auth | Laravel Fortify (already installed) |

> **Note on Reverb vs SocketIO:** Since the project uses Laravel, Laravel Reverb is the idiomatic WebSocket server. It is fully compatible with Laravel Echo on the frontend, eliminating the need for a separate SocketIO server. If the requirement strictly mandates SocketIO, `beyondcode/laravel-websockets` or a Node SocketIO bridge can be added.

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Existing placeholder → replaced with transaction list (Appendix 2, bonus) |
| `/receivers` | Receivers | Main required page — single "View Receiver" CTA |

---

## Feature Breakdown

### 1. Receivers Page (`/receivers`)
- Single page with a centered "View Receiver" button
- On click: opens the **Receiver Detail Modal**
- No menu or other elements (as per spec)

### 2. Receiver Detail Modal
- **Currency Tabs** (AED, USD, CAD)
  - USD selected by default (different background/highlight color)
  - Last selected currency stored in React state (persists while modal is open; reopening restores last selection via state)
- **Receiver Info** — name, email, type badge, country, bank, branch, Swift/BIC
- **Transaction Table** — paginated, filtered by selected currency
- **Search** — client-side filter on `To` field and `Status`
- **Statuses** — `Approved` and `Pending` only (per spec item 13; design also shows Cancelled/Rejected/Success for reference)
- **Download CTA** — downloads a sample file (any file format)
- **"Only Action Needed" toggle** — filters to transactions requiring user action

### 3. Real-Time Transaction Status Updates
- Backend broadcasts a `TransactionStatusUpdated` event via Laravel Reverb/Echo
- Frontend subscribes to the channel and updates the transaction row in-place (no page reload)
- Status change by any user reflects to all connected clients on the same channel

### 4. Queued New Transactions
- New transactions are dispatched as queued jobs (`ShouldQueue`)
- Worker processes the job and saves the transaction to the database
- After saving, broadcasts a `NewTransactionCreated` event
- Frontend appends the new transaction row in real-time

### 5. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/receivers` | List receivers |
| `GET` | `/api/receivers/{id}` | Single receiver details |
| `GET` | `/api/currencies` | List currencies (AED, USD, CAD) |
| `GET` | `/api/transactions` | List transactions (filterable by `currency`, `receiver_id`) |
| `PATCH` | `/api/transactions/{id}/status` | Update transaction status |
| `GET` | `/api/transactions/{id}/download` | Download sample document |

### 6. Caching
- Currency list: cached in Redis (rarely changes)
- Receiver details: cached per receiver ID with cache invalidation on update
- Transaction list: short TTL cache per currency + receiver combo

---

## Database Schema

### `receivers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | ULID/UUID | PK |
| `name` | string | |
| `email` | string | |
| `type` | enum | `individual`, `business` |
| `country` | string | |
| `bank_name` | string | |
| `branch_name` | string | |
| `swift_bic` | string | |
| `account_numbers` | json | Per-currency account numbers |

### `currencies`
| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `code` | string | `AED`, `USD`, `CAD` |
| `name` | string | |
| `flag` | string | Emoji or asset path |

### `transactions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | ULID/UUID | PK |
| `receiver_id` | FK | |
| `currency_id` | FK | |
| `request_id` | string | Display ID (e.g., `6A5SIDSA`) |
| `type` | string | e.g., `Send Money International` |
| `to` | string | Recipient name |
| `amount` | decimal | |
| `status` | enum | `pending`, `approved`, `cancelled`, `rejected`, `success` |
| `created_at` | timestamp | |

---

## Frontend State Management

Using **React Context + useReducer** (or Zustand) for:

```
AppState {
  selectedCurrency: 'USD' | 'AED' | 'CAD'   // default: 'USD'
  isModalOpen: boolean
  activeReceiverId: string | null
}
```

- `selectedCurrency` persists in component state and survives modal close/reopen within the same session
- Per spec item 10: closing and reopening the popup restores the last selected currency

---

## Component Tree

```
ReceiverPage
└── ViewReceiverButton
    └── ReceiverModal (Dialog)
        ├── ReceiverHeader (name, email, type badge)
        ├── CurrencyTabs (AED | USD | CAD)
        ├── ReceiverDetails (country, bank, branch, swift) + ShowMore
        └── TransactionSection
            ├── TransactionSearch (client-side filter: To + Status)
            ├── OnlyActionNeededToggle
            ├── TransactionTable
            │   └── TransactionRow (real-time status badge updates)
            └── Pagination

[Bonus] Dashboard
└── AppLayout (sidebar)
    └── TransactionList
        └── TransactionRow → opens ReceiverModal on click
```

---

## Implementation Order

1. **Database & Models** — migrations, factories, seeders with realistic data
2. **API Controllers** — receivers, currencies, transactions (with Redis caching)
3. **Queue Job** — `ProcessNewTransaction` job + seeder to queue sample transactions
4. **Broadcasting** — `TransactionStatusUpdated` + `NewTransactionCreated` events via Reverb
5. **Receivers Page** — single CTA page
6. **Receiver Modal** — currency tabs, receiver details, transaction table
7. **Real-time frontend** — Laravel Echo subscription + React state updates
8. **Search + Filters** — client-side filtering by To/Status
9. **Download** — file download endpoint + frontend CTA
10. **Dashboard (bonus)** — transaction list page triggering same modal

---

## Key Files to Create

### Backend
```
app/Models/Receiver.php
app/Models/Currency.php
app/Models/Transaction.php
app/Http/Controllers/Api/ReceiverController.php
app/Http/Controllers/Api/CurrencyController.php
app/Http/Controllers/Api/TransactionController.php
app/Events/TransactionStatusUpdated.php
app/Events/NewTransactionCreated.php
app/Jobs/ProcessNewTransaction.php
database/migrations/..._create_receivers_table.php
database/migrations/..._create_currencies_table.php
database/migrations/..._create_transactions_table.php
database/seeders/ReceiverSeeder.php
database/seeders/CurrencySeeder.php
database/seeders/TransactionSeeder.php
```

### Frontend
```
resources/js/pages/receivers.tsx
resources/js/components/receiver-modal.tsx
resources/js/components/currency-tabs.tsx
resources/js/components/transaction-table.tsx
resources/js/components/transaction-row.tsx
resources/js/hooks/use-receiver-transactions.ts
resources/js/hooks/use-realtime-transactions.ts
resources/js/types/receiver.ts
resources/js/types/transaction.ts
```

---

## Notes

- Statuses `Approved` and `Pending` are the only two per spec item 13 — design reference shows additional statuses but spec overrides
- USD has a distinct background color when selected (to be determined during implementation — likely a highlighted card/tab style)
- Search is **client-side only** — no backend filtering for the search input
- The "Download" action downloads any sample file (PDF, CSV, etc.)
- RabbitMQ is optional per spec — Redis queue driver satisfies the queuing requirement within the Laravel ecosystem
