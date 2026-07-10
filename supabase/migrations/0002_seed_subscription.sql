insert into subscriptions (id, user_id, stripe_customer_id, status, trial_ends_at) values
  ('e1000000-0000-0000-0000-000000000001', null, 'demo_customer_seed', 'trial', now() + interval '30 days')
on conflict (id) do nothing;
