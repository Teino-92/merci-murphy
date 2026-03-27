-- Migration 002: dogs table + dog_id on visits

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  breed text,
  age text,
  poids text,
  etat_poil text,
  photo_url text,
  grooming_duration integer,
  notes text,
  can_book_online boolean not null default false
);

alter table public.dogs enable row level security;

create policy "dogs_select_own" on public.dogs
  for select to authenticated
  using (owner_id = auth.uid());

create policy "dogs_insert_own" on public.dogs
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "dogs_update_own_safe" on public.dogs
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "dogs_all_service_role" on public.dogs
  for all to service_role using (true);

-- Add dog attribution to visits (nullable — old visits have no dog)
alter table public.visits
  add column if not exists dog_id uuid references public.dogs(id) on delete set null;
