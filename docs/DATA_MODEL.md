# Data Model — Expenses Tracker

## users _(managed by Supabase Auth)_
Referenced via `user_id uuid` on all domain tables. No custom profile table in v1.

## categories
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | null = system preset |
| name | text | e.g. Food, Transport |
| icon | text | emoji or icon key |
| color | text | hex |
| created_at | timestamptz | |

## transactions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| category_id | uuid FK → categories | |
| type | text | 'income' \| 'expense' |
| channel | text | 'cash' \| 'online' |
| amount | numeric(12,2) | positive always |
| txn_date | date | |
| note | text nullable | |
| ai_category_suggestion | text | AI field |
| ai_category_source | text | model name |
| ai_category_confidence | numeric | 0–1 |
| ai_category_review_status | text | 'unreviewed'\|'accepted'\|'rejected' |
| created_at | timestamptz | |

## budgets
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| category_id | uuid FK → categories | |
| month | date | first day of month |
| limit_amount | numeric(12,2) | |
| created_at | timestamptz | |

## savings_targets
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| name | text | e.g. "Emergency Fund" |
| target_amount | numeric(12,2) | |
| current_amount | numeric(12,2) | updated on each save |
| deadline | date nullable | |
| created_at | timestamptz | |

## alerts
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| budget_id | uuid FK → budgets nullable | |
| savings_target_id | uuid FK → savings_targets nullable | |
| alert_type | text | 'budget_80'\|'budget_100'\|'target_met' |
| message | text | |
| read | boolean default false | |
| created_at | timestamptz | |

## reports
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| period_start | date | |
| period_end | date | |
| format | text | 'pdf'\|'csv' |
| storage_path | text nullable | Supabase Storage key |
| created_at | timestamptz | |

## subscriptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| stripe_customer_id | text | |
| stripe_subscription_id | text nullable | |
| status | text | 'trial'\|'active'\|'cancelled'\|'expired' |
| trial_ends_at | timestamptz | |
| current_period_end | timestamptz nullable | |
| created_at | timestamptz | |

## RLS Notes
- v1: permissive open policies (demo mode). Lock-down sprint replaces with `auth.uid() = user_id`.
- `categories` with `user_id IS NULL` are readable by all (system presets).
