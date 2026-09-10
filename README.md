# ChamberCore

A multi-tenant SaaS platform for chambers of commerce. Any number of chambers
can sign up, each fully isolated from the others, on Starter / Professional /
Enterprise plans matching the pricing on the homepage.

Stack: Next.js (App Router) + MySQL (`mysql2/promise`) + Stripe.

`reference/` holds the original static HTML mockups this app was built from
(marketing copy, pricing, and the dashboard UI vision) — kept for design
reference only, not served by the app.

## Setup

### 1. MySQL Database

1. Create a MySQL database (e.g. via cPanel MySQL Databases or local MySQL).
2. Import `schema_mysql.sql` into your database (using phpMyAdmin, MySQL Workbench, or CLI):
   ```bash
   mysql -u <user> -p <database_name> < schema_mysql.sql
   ```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

- `MYSQL_HOST` — database host (e.g., `localhost`).
- `MYSQL_PORT` — port (`3306`).
- `MYSQL_USER` — database username.
- `MYSQL_PASSWORD` — database user password.
- `MYSQL_DATABASE` — database name.
- `JWT_SECRET` — random 32+ character string for signing session JWTs.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — from your Stripe dashboard.
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL` — the Price IDs from Stripe.
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` in development or your domain in production.

### 3. Stripe Setup

1. Create two recurring Prices in test mode: Starter ($299/mo) and
   Professional ($499/mo).
2. Add a webhook endpoint pointing at `/api/stripe/webhook` listening for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, and `invoice.payment_failed`.
3. For local development, forward events with the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### 4. Run

```bash
npm install
npm run dev
```

## Architecture Notes

- **Multi-tenancy**: every chamber is a row in `organizations`. Isolation is
  enforced at the query and transaction layer with explicit multi-tenant `org_id`
  foreign keys and session verification in `lib/auth/session.ts`.
- **Authentication**: Built-in HMAC-SHA256 JWT sessions stored in `httpOnly` secure cookies (`cc_session`), with password hashing via Node.js native `crypto.scrypt` and constant-time verification.
- **Roles**: `owner` / `admin` / `staff` per organization, stored in
  `org_members`. See `lib/auth/permissions.ts`. Member portal users are authenticated via `members` records.
- **File Storage**: Documents are uploaded and managed via local filesystem storage under `uploads/documents/` and served via streaming API route `/api/documents/[id]/download` with strict org-level authorization checks.
- **Billing**: Stripe subscriptions sync into `subscriptions` and
  `organizations.plan_tier`/`member_limit` via the webhook handler
  (`app/api/stripe/webhook/route.ts`). Member-count limits are enforced in `app/actions/members.ts`.

