create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  icon text,
  color text,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
drop policy if exists "categories_v1_read" on categories;
create policy "categories_v1_read" on categories for select using (true);
drop policy if exists "categories_v1_write" on categories;
create policy "categories_v1_write" on categories for all using (true) with check (true);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  category_id uuid references categories(id),
  type text not null,
  channel text not null,
  amount numeric(12,2) not null,
  txn_date date not null,
  note text,
  ai_category_suggestion text,
  ai_category_source text,
  ai_category_confidence numeric,
  ai_category_review_status text default 'unreviewed',
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;
drop policy if exists "transactions_v1_read" on transactions;
create policy "transactions_v1_read" on transactions for select using (true);
drop policy if exists "transactions_v1_write" on transactions;
create policy "transactions_v1_write" on transactions for all using (true) with check (true);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  category_id uuid references categories(id),
  month date not null,
  limit_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

alter table budgets enable row level security;
drop policy if exists "budgets_v1_read" on budgets;
create policy "budgets_v1_read" on budgets for select using (true);
drop policy if exists "budgets_v1_write" on budgets;
create policy "budgets_v1_write" on budgets for all using (true) with check (true);

create table if not exists savings_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);

alter table savings_targets enable row level security;
drop policy if exists "savings_targets_v1_read" on savings_targets;
create policy "savings_targets_v1_read" on savings_targets for select using (true);
drop policy if exists "savings_targets_v1_write" on savings_targets;
create policy "savings_targets_v1_write" on savings_targets for all using (true) with check (true);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  budget_id uuid references budgets(id),
  savings_target_id uuid references savings_targets(id),
  alert_type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table alerts enable row level security;
drop policy if exists "alerts_v1_read" on alerts;
create policy "alerts_v1_read" on alerts for select using (true);
drop policy if exists "alerts_v1_write" on alerts;
create policy "alerts_v1_write" on alerts for all using (true) with check (true);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  period_start date not null,
  period_end date not null,
  format text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

alter table reports enable row level security;
drop policy if exists "reports_v1_read" on reports;
create policy "reports_v1_read" on reports for select using (true);
drop policy if exists "reports_v1_write" on reports;
create policy "reports_v1_write" on reports for all using (true) with check (true);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null default 'trial',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;
drop policy if exists "subscriptions_v1_read" on subscriptions;
create policy "subscriptions_v1_read" on subscriptions for select using (true);
drop policy if exists "subscriptions_v1_write" on subscriptions;
create policy "subscriptions_v1_write" on subscriptions for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  tool_name text,
  input_snapshot jsonb,
  output_snapshot jsonb,
  risk_level text,
  approved_by text,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into categories (id, user_id, name, icon, color) values
  ('a1000000-0000-0000-0000-000000000001', null, 'Food & Drink', '🍔', '#F97316'),
  ('a1000000-0000-0000-0000-000000000002', null, 'Transport', '🚌', '#3B82F6'),
  ('a1000000-0000-0000-0000-000000000003', null, 'Rent & Housing', '🏠', '#8B5CF6'),
  ('a1000000-0000-0000-0000-000000000004', null, 'Salary', '💰', '#22C55E'),
  ('a1000000-0000-0000-0000-000000000005', null, 'Entertainment', '🎬', '#EC4899')
on conflict (id) do nothing;

insert into transactions (id, user_id, category_id, type, channel, amount, txn_date, note) values
  ('b1000000-0000-0000-0000-000000000001', null, 'a1000000-0000-0000-0000-000000000004', 'income',  'online', 3200.00, current_date - 20, 'Monthly salary'),
  ('b1000000-0000-0000-0000-000000000002', null, 'a1000000-0000-0000-0000-000000000003', 'expense', 'online', 1100.00, current_date - 18, 'Rent payment'),
  ('b1000000-0000-0000-0000-000000000003', null, 'a1000000-0000-0000-0000-000000000001', 'expense', 'cash',   42.50,  current_date - 10, 'Weekly grocery shop'),
  ('b1000000-0000-0000-0000-000000000004', null, 'a1000000-0000-0000-0000-000000000002', 'expense', 'online', 28.00,  current_date - 7,  'Monthly bus pass'),
  ('b1000000-0000-0000-0000-000000000005', null, 'a1000000-0000-0000-0000-000000000005', 'expense', 'online', 14.99,  current_date - 5,  'Streaming subscription'),
  ('b1000000-0000-0000-0000-000000000006', null, 'a1000000-0000-0000-0000-000000000001', 'expense', 'cash',   18.75,  current_date - 2,  'Lunch with colleague')
on conflict (id) do nothing;

insert into budgets (id, user_id, category_id, month, limit_amount) values
  ('c1000000-0000-0000-0000-000000000001', null, 'a1000000-0000-0000-0000-000000000001', date_trunc('month', current_date)::date, 150.00),
  ('c1000000-0000-0000-0000-000000000002', null, 'a1000000-0000-0000-0000-000000000002', date_trunc('month', current_date)::date, 60.00)
on conflict (id) do nothing;

insert into savings_targets (id, user_id, name, target_amount, current_amount, deadline) values
  ('d1000000-0000-0000-0000-000000000001', null, 'Holiday Fund', 2000.00, 450.00, current_date + 90)
on conflict (id) do nothing;