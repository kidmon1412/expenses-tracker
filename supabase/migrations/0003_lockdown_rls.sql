-- Lock-down sprint (docs/TASKS.md Sprint 6, docs/SECURITY.md): replace v1's open
-- "using (true)" policies with owner-scoped policies. Rows with user_id IS NULL are
-- the shared demo/seed dataset and stay visible + writable by anyone (matching
-- "Anonymous visitor sees demo seed data" in the sprint's Definition of Done);
-- rows owned by a real user are only visible/writable by that user going forward,
-- which is what makes "two test accounts cannot see each other's transactions" hold.

-- categories: reference data stays fully public to read; writes require ownership.
drop policy if exists "categories_v1_write" on categories;
create policy "categories_write" on categories for insert with check (auth.uid() = user_id);
create policy "categories_update" on categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete" on categories for delete using (auth.uid() = user_id);

do $$
declare
  t text;
begin
  foreach t in array array['transactions', 'budgets', 'savings_targets', 'alerts', 'reports', 'subscriptions']
  loop
    execute format('drop policy if exists "%s_v1_read" on %I', t, t);
    execute format('drop policy if exists "%s_v1_write" on %I', t, t);

    execute format(
      'create policy "%s_select" on %I for select using (user_id is null or auth.uid() = user_id)',
      t, t
    );
    execute format(
      'create policy "%s_insert" on %I for insert with check ((auth.uid() is null and user_id is null) or auth.uid() = user_id)',
      t, t
    );
    execute format(
      'create policy "%s_update" on %I for update using (user_id is null or auth.uid() = user_id) with check (user_id is null or auth.uid() = user_id)',
      t, t
    );
    execute format(
      'create policy "%s_delete" on %I for delete using (user_id is null or auth.uid() = user_id)',
      t, t
    );
  end loop;
end $$;

-- audit_logs: append-only per docs/SECURITY.md — no update or delete, ever.
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_select" on audit_logs for select using (user_id is null or auth.uid() = user_id);
create policy "audit_logs_insert" on audit_logs for insert
  with check ((auth.uid() is null and user_id is null) or auth.uid() = user_id);
