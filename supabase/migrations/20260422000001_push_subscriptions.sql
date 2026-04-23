-- Web push subscriptions for staff dashboard notifications.
-- One row per (user_id, endpoint). Endpoint is globally unique across all devices.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "users select own subs"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "users insert own subs"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "users delete own subs"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Service role bypasses RLS → server helper can query all staff subs.
