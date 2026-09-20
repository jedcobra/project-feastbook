-- Special Spoon — revision history for recipe content.
-- Run after 0004_onboarding.sql, in the Supabase SQL Editor.

create table public.recipe_revisions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  snapshot jsonb not null
);

alter table public.recipe_revisions enable row level security;

create policy "revisions are readable by the recipe's author" on public.recipe_revisions for select using (
  recipe_id in (
    select id from public.recipes where author_id in (select id from public.profiles where user_id = auth.uid())
  )
);

create policy "authors create revisions for their own recipes" on public.recipe_revisions for insert with check (
  recipe_id in (
    select id from public.recipes where author_id in (select id from public.profiles where user_id = auth.uid())
  )
);
