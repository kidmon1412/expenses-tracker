# Test Plan — Expenses Tracker

## v1 Success Scenario (manual)
1. Open `/` — dashboard loads with demo transactions and savings bar. No login required.
2. Click **Add Transaction** — form appears (loading state: button spinner).
3. Submit with amount=0 — validation error shown inline. Form not submitted.
4. Fill valid transaction: £45, Expense, Food, Cash, today, note "Weekly shop" — submit.
5. Transaction appears in transaction list immediately (no page reload).
6. Dashboard totals update: total spent increases by £45.
7. If Food budget is set to £50, an alert banner appears: "You've used 90 % of your Food budget."
8. Create a Savings Target: "Holiday Fund", £2000, deadline 3 months out.
9. Savings progress bar shows £0 / £2000.
10. Click **Generate Report** → select current month → click Download PDF.
11. PDF downloads and contains the £45 Food transaction.
12. Click Download CSV — CSV file opens with correct columns and data.

## Empty States
- No transactions yet: dashboard shows "No transactions yet — add your first one" with CTA.
- No budget set: budget section shows "Set a budget to track your limits" prompt.
- No savings targets: shows "Create a savings goal to get started" prompt.

## Error Cases
- `/api/transactions` returns 500 → form shows "Something went wrong. Please try again." Entry not duplicated.
- Report generation fails → "Report could not be generated. Try again." No broken download link.
- Stripe webhook with invalid signature → 400 returned, no subscription update, event logged.

## Permission Check (post Sprint 6)
- Log in as User A, log a transaction. Log in as User B — transaction not visible.
- Expired trial user clicks Export — redirected to upgrade page, no file served.
