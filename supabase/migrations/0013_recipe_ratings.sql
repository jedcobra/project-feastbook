-- Special Spoon — real recipe ratings.
-- Run after 0012_shelf_archive.sql, in the Supabase SQL Editor.

-- recipes.rating was a static number seeded with the demo data — there was
-- never a way for anyone to actually submit one, just a display of
-- whatever the seed happened to say. This replaces it with a real
-- per-person rating, aggregated below.
create table public.recipe_ratings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.recipe_ratings enable row level security;

create policy "recipe ratings are publicly readable" on public.recipe_ratings for select using (true);
create policy "users manage their own recipe ratings" on public.recipe_ratings for all
  using (user_id in (select id from public.profiles where user_id = auth.uid()));

-- Adds the real average/count alongside the existing made_it/save counts.
create or replace view public.recipe_stats as
select
  r.id,
  (select count(*) from public.made_it m where m.recipe_id = r.id) as made_it_count,
  (select count(*) from public.saves s where s.recipe_id = r.id) as save_count,
  (select round(avg(rr.stars)::numeric, 1) from public.recipe_ratings rr where rr.recipe_id = r.id) as rating_avg,
  (select count(*) from public.recipe_ratings rr where rr.recipe_id = r.id) as rating_count
from public.recipes r;

alter table public.recipes drop column rating;
