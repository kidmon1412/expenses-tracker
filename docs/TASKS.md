# Tasks & Sprints — Expenses Tracker

## Sprint 1 — Database & Demo Seed _(Foundation)_
**Goal:** All tables exist, constraints enforced, demo data visible without login.
- Create all tables via migration SQL (categories, transactions, budgets, savings_targets, alerts, reports, subscriptions, audit_logs)
- Seed 5 system categories, 6 demo transactions, 2 budgets, 1 savings target
- Enable RLS with v1 open policies
- Confirm dashboard page renders seed data for anonymous visitor
**Definition of Done:** `/` loads in preview showing demo transactions and a savings progress bar — no login required. All tables exist in Supabase.

---

## Sprint 2 — Core Engine: Log a Transaction _(v1 functional milestone)_
**Goal:** The one core action works end-to-end.
- Build "Add Transaction" form (amount, type, category, channel, date, note)
- POST `/api/transactions` — validates, writes to DB, returns new row
- Budget-usage recalculation runs server-side after each write
- Alert record created when usage ≥ 80 % or 100 % of budget limit
- Dashboard totals (spent, saved, remaining) re-fetch after submission
- Handle loading / empty / error / success states on form and dashboard
- Keyword-rule category suggestion shown inline (stored with confidence + review_status)
**Definition of Done:** A tester logs a transaction, sees it on the dashboard, and — if it pushes spending over 80 % of a budget — an alert appears. No dead buttons. Data persists on page refresh.

---

## Sprint 3 — Budget & Savings Target Management
**Goal:** Users can set and manage budgets and savings goals.
- Create/edit/delete budget per category per month
- Create/edit savings target (name, amount, deadline, current amount)
- Savings progress bar and "on track" / "at risk" indicator
- All five UI states handled per screen
**Definition of Done:** Tester creates a budget, adds a savings target, and both reflect correctly on the dashboard after a page refresh.

---

## Sprint 4 — Reports & Export
**Goal:** Users can generate and download a monthly report.
- Report generation API (`/api/reports/generate`) — aggregates transactions by date range
- PDF export via `@react-pdf/renderer`; CSV export via stream
- Report stored in Supabase Storage; signed URL returned
- Reports history list on a `/reports` page
- All five UI states on report generation screen
**Definition of Done:** Tester clicks "Generate Report", selects a month, downloads a valid PDF and CSV containing their transactions.

---

## Sprint 5 — Payments: Trial & Paid Tier
**Goal:** Stripe checkout live; free trial enforced.
- `subscriptions` table seeded with demo trial row
- Stripe Checkout session created server-side (`stripe_create_checkout`)
- Webhook handler: `checkout.session.completed` → update subscription status
- Trial expiry check middleware: blocks report export and redirects to upgrade after 30 days
- Upgrade prompt banner shown when trial < 5 days remaining
**Definition of Done:** Tester completes Stripe test checkout, subscription status updates to 'active', and export is accessible. Trial-expired user sees upgrade prompt and cannot export.

---

## Sprint 6 — Lock It Down (Auth + Per-User RLS)
**Goal:** Real user isolation before any real data goes in.
- Supabase Auth: email/password sign-up + login + logout
- Replace open RLS policies with `auth.uid() = user_id` owner policies
- Associate all writes with `auth.uid()`
- System categories (`user_id IS NULL`) remain readable by all
- Redirect unauthenticated users to `/login` only after this sprint
**Definition of Done:** Two test accounts cannot see each other's transactions. Anonymous visitor sees demo seed data. Logged-in user sees only their own records.

---

## Gantt (Sprint → Feature)
```
Sprint 1  │ DB schema, seed, demo view
Sprint 2  │ Add transaction, budget alerts, dashboard        ← v1 functional
Sprint 3  │ Budget + savings target CRUD
Sprint 4  │ Report generation + PDF/CSV export
Sprint 5  │ Stripe trial + paid tier
Sprint 6  │ Auth + RLS lock-down
```
