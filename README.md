# RemitLand — Hashthink Full-Stack Test

A responsive remittance dashboard built with **Laravel 12**, **React (Inertia.js)**, **TailwindCSS**, **Redis**, **Laravel Reverb (WebSockets)**, and **Laravel Queues**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.2, Laravel 12 |
| Frontend | React 19, TypeScript, TailwindCSS v4 |
| SPA Bridge | Inertia.js v2 |
| Database | SQLite (dev) |
| Cache | Redis |
| WebSockets | Laravel Reverb |
| Queue | Laravel Queue (database driver) |
| Auth | Laravel Fortify |

---

## Requirements

- PHP 8.2+
- Node.js 18+ and pnpm
- Redis (running on `127.0.0.1:6379`)
- Laravel Herd (or any local PHP server)

---

## Installation

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd hashthink

composer install
pnpm install
```

### 2. Environment setup

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your values:

```env
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database
CACHE_STORE=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### 3. Database setup

```bash
php artisan migrate:fresh --seed
```

This seeds:
- **3 currencies** — USD (default), AED, CAD
- **10 receivers** — including John Bonham with realistic bank details
- **~150+ transactions** — spread across all receivers and currencies

### 4. Build frontend assets

```bash
pnpm run build
# or for development with hot reload:
pnpm run dev
```

---

## Running the App

The app requires **3 processes** running simultaneously for full functionality:

```bash
# Terminal 1 — Web server (handled by Laravel Herd automatically)
# Visit: http://hashthink.test

# Terminal 2 — WebSocket server (Reverb)
php artisan reverb:start

# Terminal 3 — Queue worker
php artisan queue:work
```

---

## Login

```
Email:    kasra@email.com
Password: password
```

---

## Features

### Dashboard (`/dashboard`)
- Account balance overview with per-currency breakdown (USD / INR / CAD)
- Quick Conversion card
- Transactions table with real-time updates
- Filter by type (All / Add money / Send Money / Conversion)
- Search by recipient name or status
- Filter by status (Pending / Approved / Success / Cancelled / Rejected)
- Click any transaction row to open the Receiver Detail modal

### Receivers (`/receivers`)
- Single "View Receiver" CTA page
- Opens the Receiver Detail modal

### Receiver Detail Modal
- Switches between **AED / USD / CAD** currency tabs
- Last selected currency is remembered — reopening the modal restores it
- Receiver info: country, bank, branch, Swift/BIC (expandable)
- Transaction table filtered by selected currency
- Search by recipient name or status (client-side)
- "Only Action Needed" toggle — shows only pending transactions
- Download receipt for successful transactions
- Pagination
- **Live updates** — status changes and new transactions appear instantly without refresh

### Send Money Form
- Triggered by the yellow **Send Money** button in the sidebar
- Select receiver, currency (AED/USD/CAD), type, subtype, recipient, and amount
- Submits via queue — the new transaction appears live in both the dashboard and modal

---

## How the Key Systems Work

### Queue

When a user submits the **Send Money** form, the request hits `TransactionController@store` which dispatches a `ProcessNewTransaction` job onto the queue instead of saving directly. This decouples the HTTP response from the database write.

```
User submits form
    → POST /transactions
    → ProcessNewTransaction job dispatched to queue
    → HTTP response returns immediately (fast UX)

php artisan queue:work (background)
    → Picks up the job
    → Creates the Transaction record in the database
    → Invalidates Redis cache for that receiver
    → Dispatches NewTransactionCreated broadcast event
    → Reverb sends the event to all connected clients
    → Transaction appears live in the UI
```

### Reverb (WebSockets)

Reverb is a first-party Laravel WebSocket server. It allows the server to **push events to the browser** without the client polling.

Two events are broadcast:

| Event | Channel | Triggered by |
|-------|---------|-------------|
| `transaction.created` | `transactions`, `receiver.{id}` | Queue job after saving |
| `transaction.status.updated` | `transactions`, `receiver.{id}` | `PATCH /api/transactions/{id}/status` |

The frontend subscribes using `@laravel/echo-react`:

```ts
// Dashboard — listens on global transactions channel
useEchoPublic('transactions', '.transaction.created', (e) => {
    setTransactions((prev) => [e, ...prev]);
});

// Modal — listens on specific receiver channel
useEchoPublic(`receiver.${receiver.id}`, '.transaction.status.updated', (e) => {
    dispatch({ type: 'UPDATE_STATUS', id: e.id, status: e.status });
});
```

When a status is updated by one user, **all connected clients** see the badge change live.

### Cache (Redis)

Redis caching reduces repeated database queries. The cache is automatically invalidated when data changes.

| Cache Key | TTL | Content |
|-----------|-----|---------|
| `currencies` | 1 hour | All 3 currencies (rarely changes) |
| `receivers` | 5 min | Receiver list for the Send Money dropdown |
| `receiver.{id}` | 10 min | Receiver detail with transactions |
| `transactions.r{id}.c{code}.p{n}` | 2 min | Paginated transactions per receiver + currency + page |

**Invalidation** — when a transaction is created or its status changes, `bustReceiverCache()` clears all cached transaction pages and the receiver detail for that receiver, so the next request always fetches fresh data.

```
Status update / new transaction
    → bustReceiverCache(receiver_id)
    → Deletes: transactions.r{id}.c*.p1-10
    → Deletes: receiver.{id}
    → Next modal open fetches fresh data from DB and re-caches
```

---

## API Endpoints

All endpoints require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/currencies` | List all currencies |
| `GET` | `/api/receivers` | List all receivers |
| `GET` | `/api/receivers/{id}` | Receiver detail with transactions |
| `GET` | `/api/transactions` | Paginated transactions (filter by `receiver_id`, `currency_code`) |
| `PATCH` | `/api/transactions/{id}/status` | Update transaction status |
| `GET` | `/api/transactions/{id}/download` | Download transaction receipt |

---

## Project Structure

```
app/
├── Events/
│   ├── NewTransactionCreated.php      # Broadcast when queue job finishes
│   └── TransactionStatusUpdated.php   # Broadcast on status change
├── Http/Controllers/
│   ├── Api/
│   │   ├── CurrencyController.php
│   │   ├── ReceiverController.php
│   │   └── TransactionController.php  # Includes cache + broadcast logic
│   ├── DashboardController.php
│   ├── ReceiverPageController.php
│   └── TransactionController.php      # Handles Send Money form → queue
├── Jobs/
│   └── ProcessNewTransaction.php      # Queue job: save + broadcast
└── Models/
    ├── Currency.php
    ├── Receiver.php
    └── Transaction.php

resources/js/
├── components/
│   ├── receiver-modal.tsx             # Full modal with real-time Echo subscriptions
│   └── send-money-modal.tsx           # Send Money form (Inertia useForm)
├── pages/
│   ├── dashboard.tsx                  # Dashboard with real-time transaction list
│   └── receivers.tsx                  # Receivers page
└── types/
    └── receiver.ts                    # TypeScript interfaces
```
