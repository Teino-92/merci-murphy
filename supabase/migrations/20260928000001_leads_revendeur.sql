-- Leads: support B2B reseller enquiries alongside B2C bookings.
--
-- Reseller leads land in the same `leads` table (one inbox in the dashboard)
-- but carry source = 'revendeur' and their own set of business fields.
-- All columns are nullable so existing B2C rows stay valid.

alter table public.leads
  add column if not exists entreprise    text,
  add column if not exists ville         text,
  add column if not exists type_commerce text,
  add column if not exists siret         text,
  add column if not exists site_web      text;

comment on column public.leads.entreprise    is 'Reseller leads: shop / company name.';
comment on column public.leads.ville         is 'Reseller leads: city, used for territory questions.';
comment on column public.leads.type_commerce is 'Reseller leads: boutique | concept-store | toiletteur | animalerie | e-commerce | autre.';
comment on column public.leads.siret         is 'Reseller leads: optional, self-declared. Not validated.';
comment on column public.leads.site_web      is 'Reseller leads: website or Instagram handle.';

-- Filtering the dashboard by lead type is the most common query on this table.
create index if not exists leads_source_created_at_idx
  on public.leads (source, created_at desc);
