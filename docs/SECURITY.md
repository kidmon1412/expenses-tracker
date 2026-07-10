# Security — Expenses Tracker

## Secret Handling
- Stripe secret key, Supabase service-role key: server-side env vars only (`.env.local`, Vercel secrets). Never imported in any client component.
- Stripe webhook signature verified on every inbound event before processing.
- Supabase anon key (public) used client-side; scoped by RLS.

## Permission Model
- **v1 (demo):** open RLS policies — any visitor can read/write. No sensitive real data yet.
- **Lock-down sprint:** `auth.uid() = user_id` owner policies on every table. System categories (`user_id IS NULL`) remain readable by all.
- Users can only read/write their own transactions, budgets, targets, alerts, and reports.
- Subscription status checked server-side before report generation and export endpoints.

## Approved-Tools Rule
- Agents and server routes call only the named tools listed in AGENTIC_LAYER.md.
- No `eval`, no dynamic SQL, no raw shell execution.
- Every tool call is logged to `audit_logs` before the action executes.

## Audit Principle
- Every write that affects money fields (transactions, budgets, savings_targets, subscriptions) is logged.
- Logs are append-only; no update or delete permitted on `audit_logs` rows.
- Stripe webhook events stored verbatim before processing.
