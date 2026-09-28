-- `leads.source` carries a CHECK constraint created outside this migrations
-- folder, allowing only 'reservation' and 'contact'. Reseller enquiries insert
-- source = 'revendeur' and were rejected with SQLSTATE 23514.
--
-- Widen the constraint rather than drop it: the column stays validated.

alter table public.leads
  drop constraint if exists leads_source_check;

alter table public.leads
  add constraint leads_source_check
  check (source in ('reservation', 'contact', 'revendeur'));
