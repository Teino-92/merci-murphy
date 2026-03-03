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
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled'))
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

-- leads: public INSERT, service role SELECT/UPDATE
create policy "leads_insert_public" on public.leads
  for insert to anon with check (true);

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
