# Agentic Layer — Expenses Tracker

## Risk Levels & Actions

### Low — Auto (no approval needed)
- Suggest a category for a new transaction (keyword rules → LLM later)
- Auto-tag channel as 'online' if note contains payment-app keywords
- Generate and store a monthly report on the 1st of each month

### Medium — Light approval (user confirms)
- Create a new budget limit for a category when none exists and user hits 80 % on the first transaction
- Send an in-app alert when budget threshold crossed

### High — Always approval before execution
- Send an email or push notification to user
- Initiate Stripe checkout / upgrade prompt

### Critical — Human only
- Issue a refund via Stripe
- Delete a user's account and all data
- Access another user's financial records

## Named Tools (approved list)
- `suggest_category(note, amount)` → returns suggestion + confidence
- `calculate_budget_usage(user_id, month)` → returns per-category usage
- `generate_report(user_id, start, end, format)` → returns storage path
- `create_alert(user_id, type, message)` → writes to alerts table
- `stripe_create_checkout(user_id, plan)` → returns hosted URL

## Audit Log Fields
`id, user_id, action, tool_name, input_snapshot, output_snapshot, risk_level, approved_by, created_at`

## v1 vs Later
**v1:** auto category suggestion + budget alerts + report generation.
**Later:** scheduled monthly email digests, AI spend coaching messages.
