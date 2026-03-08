-- profiles (linked to Supabase Auth users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  nom text not null,
  telephone text not null,
  -- dog info
  nom_chien text,
  race_chien text,
  poids_chien text,
  etat_poil text,
  -- groomer notes (internal, staff only)
  notes text,
  -- team toggle: when true the customer can self-book (Phase 2)
  can_book boolean not null default false
);

-- visit history
create table public.visits (
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

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "profiles_all_service_role" on public.profiles
  for all to service_role using (true);

-- leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  nom text not null,
  email text not null,
  telephone text not null,
  service text not null check (service in ('toilettage', 'bains', 'creche', 'education', 'osteo', 'autre')),
  race_chien text,
  poids_chien text,
  etat_poil text,
  message text,
  source text not null check (source in ('reservation', 'contact', 'newsletter')),
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled')),
  user_id uuid references auth.users(id) on delete set null
);

-- newsletter_subscribers
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default now(),
  active boolean not null default true
);

-- RLS
alter table public.leads enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- leads: authenticated INSERT, service role SELECT/UPDATE
create policy "leads_insert_authenticated" on public.leads
  for insert to authenticated with check (true);

create policy "leads_select_own" on public.leads
  for select to authenticated using (auth.uid() = user_id);

create policy "leads_select_service_role" on public.leads
  for select to service_role using (true);

create policy "leads_update_service_role" on public.leads
  for update to service_role using (true);

-- newsletter_subscribers: public INSERT, service role SELECT/UPDATE
create policy "newsletter_insert_public" on public.newsletter_subscribers
  for insert to anon with check (true);

create policy "newsletter_select_service_role" on public.newsletter_subscribers
  for select to service_role using (true);

create policy "newsletter_update_service_role" on public.newsletter_subscribers
  for update to service_role using (true);
