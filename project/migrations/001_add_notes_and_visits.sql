-- Migration 001: add notes to profiles + visits table

-- Add groomer notes to existing profiles table
alter table public.profiles
  add column if not exists notes text;

-- Visit history
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  service text not null check (service in ('toilettage', 'bains', 'creche', 'education', 'osteo', 'autre')),
  date date not null,
  notes text,
  staff text
);

alter table public.visits enable row level security;

create policy "visits_all_service_role" on public.visits
  for all to service_role using (true);

create policy "visits_select_own" on public.visits
  for select to authenticated using (
    profile_id = auth.uid()
  );
