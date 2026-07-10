# Architecture — Expenses Tracker

## Stack
- **Frontend:** Next.js 14 (App Router) hosted on Vercel
- **Backend/DB:** Supabase (Postgres + RLS + Storage)
- **Payments:** Stripe Checkout (hosted page) + Stripe webhooks
- **Export:** server-side PDF via `@react-pdf/renderer`; CSV via stream

## Now vs Later
**Now:** manual transaction entry, category management, budget + savings targets, dashboard totals, basic alerts, PDF/CSV export, Stripe trial + paid tier.
**Later:** bank sync, recurring entries, multi-device push alerts, AI spend insights, shared accounts.

## Key User Action — Logging a Transaction
1. User fills the "Add Transaction" form (amount, category, channel, date, note).
2. Form POSTs to `/api/transactions` — server validates and writes to `transactions` table.
3. A server-side function recalculates the current month's `budget_usage` and `savings_snapshot`.
4. If usage crosses 80 % or 100 % of the budget limit, an alert record is written and shown on next load.
5. Dashboard re-fetches totals and reflects the new balance and savings progress bar.
6. On report request, server aggregates the date range, renders PDF/CSV, and returns a signed URL.

## Layer Plan
1. **Data first** — tables, constraints, RLS policies, seed data.
2. **App logic** — CRUD API routes, budget-alert rules (pure SQL/server), report generation.
3. **Smart features** — AI category suggestions, spend-pattern summaries (added after core is stable).

## Core Without AI
Every feature — logging, budgeting, alerts, export — is rule-based server logic. AI is additive only.
