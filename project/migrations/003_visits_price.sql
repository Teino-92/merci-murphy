-- Migration 003: add price column to visits

alter table public.visits
  add column if not exists price numeric;
