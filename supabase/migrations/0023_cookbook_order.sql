-- Special Spoon — a person's own ordering of the recipes in their cookbook.
-- Run after 0022_who_can_follow.sql, in the Supabase SQL Editor.

-- One row per recipe the owner has placed; recipes without a row (added
-- or saved since the last rearrange) show ahead of placed ones, newest
-- first, so new things never get buried at the bottom.
create table public.cookbook_order (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position integer not null,
  primary key (owner_id, recipe_id)
);

alter table public.cookbook_order enable row level security;

-- Visitors see the owner's order too, but only for recipes they could
-- already read — the subquery runs under the viewer's own recipe RLS, so
-- a private or followers-only recipe's id never leaks through here.
create policy "cookbook order is readable for visible recipes" on public.cookbook_order for select
  using (exists (select 1 from public.recipes r where r.id = recipe_id));

create policy "owners manage their cookbook order" on public.cookbook_order for all
  using (owner_id in (select id from public.profiles where user_id = auth.uid()))
  with check (owner_id in (select id from public.profiles where user_id = auth.uid()));
