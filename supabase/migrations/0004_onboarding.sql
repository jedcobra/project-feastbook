-- Special Spoon — onboarding gate + taste tags.
-- Run after 0003_recipe_visibility.sql, in the Supabase SQL Editor.

alter table public.profiles
  add column onboarded_at timestamptz,
  add column taste_tags text[] not null default '{}';

-- Existing profiles (seed data, already-active accounts) shouldn't be
-- forced through onboarding retroactively.
update public.profiles set onboarded_at = created_at where onboarded_at is null;
