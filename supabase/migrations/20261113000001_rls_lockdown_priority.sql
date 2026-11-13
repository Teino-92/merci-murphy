-- RLS lockdown: close direct PostgREST access that the app never uses.
-- All application reads/writes on these tables go through supabaseAdmin (service role).

-- staff_schedule: "Service role full access" was declared TO public (anon + authenticated)
DROP POLICY IF EXISTS "Service role full access" ON public.staff_schedule;
REVOKE ALL ON public.staff_schedule FROM anon, authenticated;

-- leads / newsletter_subscribers: inserts go through validated Server Actions only
DROP POLICY IF EXISTS leads_insert_public ON public.leads;
DROP POLICY IF EXISTS newsletter_insert_public ON public.newsletter_subscribers;
REVOKE ALL ON public.leads, public.newsletter_subscribers FROM anon, authenticated;

-- visits: clients must not read respond_token / internal notes directly
-- (visits_select_dashboard kept for dashboard realtime)
DROP POLICY IF EXISTS visits_select_own ON public.visits;

-- dogs: writes go through dog-actions.ts (service role)
REVOKE INSERT, UPDATE, DELETE ON public.dogs FROM anon, authenticated;

-- staff / availabilities / time_off: employee data, read server-side only
DROP POLICY IF EXISTS "staff readable by all" ON public.staff;
DROP POLICY IF EXISTS "availabilities readable by all" ON public.availabilities;
DROP POLICY IF EXISTS "time_off readable by all" ON public.time_off;
REVOKE ALL ON public.staff, public.availabilities, public.time_off FROM anon, authenticated;
