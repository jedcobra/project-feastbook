-- Special Spoon — shelf privacy + add-to-shelf sheet support.
-- Run after 0005_revisions.sql, in the Supabase SQL Editor.

alter table public.shelves
  add column visibility text not null default 'private'
  check (visibility in ('private', 'followers', 'link'));

-- "Recently added" ordering inside a shelf needs a timestamp — position
-- existed for a future drag-reorder feature that was never built.
alter table public.shelf_recipes
  add column created_at timestamptz not null default now();

drop policy "shelves are publicly readable" on public.shelves;

create policy "shelves are readable per visibility" on public.shelves for select using (
  visibility = 'link'
  or owner_id in (select id from public.profiles where user_id = auth.uid())
  or (
    visibility = 'followers'
    and owner_id in (
      select followee_id from public.follows
      where follower_id in (select id from public.profiles where user_id = auth.uid())
    )
  )
);

drop policy "shelf_recipes are publicly readable" on public.shelf_recipes;

create policy "shelf_recipes are readable per shelf visibility" on public.shelf_recipes for select using (
  shelf_id in (
    select id from public.shelves where
      visibility = 'link'
      or owner_id in (select id from public.profiles where user_id = auth.uid())
      or (
        visibility = 'followers'
        and owner_id in (
          select followee_id from public.follows
          where follower_id in (select id from public.profiles where user_id = auth.uid())
        )
      )
  )
);
