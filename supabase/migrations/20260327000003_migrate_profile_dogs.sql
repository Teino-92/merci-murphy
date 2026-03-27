-- Migration 003: migrate dog data from profiles → dogs table
-- For any profile that has nom_chien set and no dog row yet, create one.

insert into public.dogs (owner_id, name, breed, poids, etat_poil)
select
  p.id,
  p.nom_chien,
  p.race_chien,
  p.poids_chien,
  p.etat_poil
from public.profiles p
where p.nom_chien is not null
  and not exists (
    select 1 from public.dogs d where d.owner_id = p.id
  );
