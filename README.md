# ChamberCore

A multi-tenant SaaS platform for chambers of commerce. Any number of chambers
can sign up, each fully isolated from the others, on Starter / Professional /
Enterprise plans matching the pricing on the homepage.

Stack: Next.js (App Router) + Supabase (Postgres, Auth, Row-Level Security) +
Stripe.

`reference/` holds the original static HTML mockups this app was built from
(marketing copy, pricing, and the dashboard UI vision) — kept for design
reference only, not served by the app.

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) (or via the
   Supabase MCP tools if available in your environment).
2. Apply the migrations in `supabase/migrations/` in order, either with the
   Supabase CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   or by pasting each file's contents into the SQL editor in order.
3. Regenerate `lib/types/database.types.ts` from the live schema:
   ```bash
   supabase gen types typescript --project-id <your-project-ref> > lib/types/database.types.ts
   ```
   (until then, the hand-written types in that file are kept manually in
   sync with the migrations).

### 2. Stripe

1. Create two recurring Prices in test mode: Starter ($299/mo) and
   Professional ($499/mo).
2. Add a webhook endpoint pointing at `/api/stripe/webhook` listening for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, and `invoice.payment_failed`.
3. For local development, forward events with the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project settings.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — from your Stripe dashboard.
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL` — the Price IDs from
  step 2 above.
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` in development.

### 4. Run

```bash
npm install
npm run dev
```

## Architecture notes

- **Multi-tenancy**: every chamber is a row in `organizations`. Isolation is
  enforced by Postgres Row-Level Security (`supabase/migrations/0006_rls_policies.sql`)
  using `is_org_member()`/`org_role()` helper functions — this is the real
  security boundary, not the app layer.
- **Roles**: `owner` / `admin` / `staff` per organization, stored in
  `org_members`. See `lib/auth/permissions.ts`.
- **Billing**: Stripe subscriptions sync into `subscriptions` and
  `organizations.plan_tier`/`member_limit` via the webhook handler
  (`app/api/stripe/webhook/route.ts`). Member-count limits are enforced both
  in the app (`app/actions/members.ts`) and as a Postgres trigger
  (`enforce_member_limit` in `0004_subscriptions.sql`) as a hard backstop.
- **Scope**: this phase implements the core SaaS foundation — auth,
  multi-tenant orgs, billing, Member Management, and Business Directory. The
  other modules referenced on the marketing homepage (events, dues, board
  portal, legislative center, marketplace, analytics, etc.) are shown in the
  app's navigation with a "Soon" badge but not yet implemented.
