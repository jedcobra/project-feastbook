-- Special Spoon — recipe visibility (public / followers / private).
-- Run after 0002_recipe_stats.sql, in the Supabase SQL Editor.

alter table public.recipes
  add column visibility text not null default 'public'
  check (visibility in ('public', 'followers', 'private'));

drop policy "recipes are publicly readable" on public.recipes;

create policy "recipes are readable per visibility" on public.recipes for select using (
  visibility = 'public'
  or author_id in (select id from public.profiles where user_id = auth.uid())
  or (
    visibility = 'followers'
    and author_id in (
      select followee_id from public.follows
      where follower_id in (select id from public.profiles where user_id = auth.uid())
    )
  )
);
