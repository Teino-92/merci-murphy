-- Migration: add numero_puce to dogs, copy remaining dog data from profiles, drop dog columns from profiles

-- 1. Add missing column to dogs
alter table public.dogs
  add column if not exists numero_puce text;

-- 2. Copy grooming_duration from profiles → dogs (for existing rows)
update public.dogs d
set grooming_duration = p.grooming_duration
from public.profiles p
where d.owner_id = p.id
  and p.grooming_duration is not null
  and d.grooming_duration is null;

-- 3. Copy age_chien from profiles → dogs
update public.dogs d
set age = p.age_chien
from public.profiles p
where d.owner_id = p.id
  and p.age_chien is not null
  and d.age is null;

-- 4. Copy numero_puce from profiles → dogs
update public.dogs d
set numero_puce = p.numero_puce
from public.profiles p
where d.owner_id = p.id
  and p.numero_puce is not null
  and d.numero_puce is null;

-- 5. Drop dog columns from profiles
alter table public.profiles
  drop column if exists nom_chien,
  drop column if exists race_chien,
  drop column if exists age_chien,
  drop column if exists poids_chien,
  drop column if exists etat_poil,
  drop column if exists grooming_duration,
  drop column if exists numero_puce;
