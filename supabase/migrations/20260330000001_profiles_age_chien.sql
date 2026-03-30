-- Add age_chien to profiles if not already present
alter table public.profiles
  add column if not exists age_chien text;
