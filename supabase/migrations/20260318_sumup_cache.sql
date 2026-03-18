-- Migration: create sumup_cache table
-- Purpose: cache aggregated SumUp transaction data per period to avoid N+1 API calls

create table if not exists sumup_cache (
  id uuid primary key default gen_random_uuid(),
  period text not null unique,           -- e.g. '2026-03' (one row per month)
  transactions jsonb not null default '[]',
  by_day jsonb not null default '[]',    -- [{ date, revenue, count }]
  by_product jsonb not null default '[]', -- [{ name, revenue, quantity }]
  by_payment_type jsonb not null default '[]', -- [{ type, count, revenue }]
  payouts jsonb not null default '[]',
  total_revenue numeric not null default 0,
  transaction_count integer not null default 0,
  avg_ticket numeric not null default 0,
  refund_rate numeric not null default 0,  -- 0–1
  refreshed_at timestamptz not null default now()
);

-- RLS: service role only — never exposed to the browser directly
alter table sumup_cache enable row level security;

-- No public access policy — only service role (bypasses RLS) can read/write
