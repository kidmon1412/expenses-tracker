# PRD — Expenses Tracker

## Problem
People struggle to monitor daily spending across cash and online channels, lose sight of savings goals, and have no easy way to review or share a clean financial summary.

## Target User
Anyone who wants to track personal income, expenses, and savings — from casual budgeters to people working toward a specific savings goal.

## Core Objects
- **Transaction** — a single income or expense entry (amount, type, category, channel, date, note)
- **Category** — user-defined or default labels (Food, Transport, Rent, Salary, etc.)
- **Budget** — monthly spending limit per category
- **Savings Target** — a named goal with a target amount and deadline
- **Report** — a generated monthly or custom-range summary (PDF/CSV export)

## MVP Must-Haves
- [ ] Log a transaction (amount, category, channel: cash/online, date, note)
- [ ] View a dashboard: total spent, total saved, remaining budget this month
- [ ] Set a monthly savings target and see progress against it
- [ ] Categorise transactions (preset + custom categories)
- [ ] Alert when spending approaches or exceeds a budget limit
- [ ] Generate and export a monthly report (PDF or CSV)
- [ ] Free 30-day trial; paid tier with Stripe checkout to unlock continued access

## Non-Goals (v1)
- Bank/open-banking API sync
- Multi-currency support
- Shared household/team accounts
- Recurring transaction automation

## Success Criteria
A user signs up, logs five transactions across two categories, sets a monthly savings target, receives a budget alert, and downloads a monthly expense report — all within one session.
