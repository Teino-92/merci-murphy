-- profiles: row policies stay ("own" row), but restrict which columns clients
-- can read/write directly. Internal decision fields (can_book, admission_passed)
-- are read-only for clients; notes are never exposed.
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, nom, telephone, can_book, admission_passed, newsletter_subscribed)
  ON public.profiles TO authenticated;
GRANT UPDATE (nom, telephone, newsletter_subscribed) ON public.profiles TO authenticated;

-- TRUNCATE bypasses RLS and is never needed by client roles
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
