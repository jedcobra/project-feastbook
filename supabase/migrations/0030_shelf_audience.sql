-- Special Spoon — shelf sharing reworded and "People I follow" made literal.
-- Run after 0029_shelf_notifications.sql, in the Supabase SQL Editor.

-- The three settings are now "Just me" (private), "People I follow"
-- (followers) and "Everyone" (link); the stored values stay the same.
-- "People I follow" used to let anyone who followed the shelf's owner see
-- it. It now means what it says: only people the owner follows.
drop policy "shelves are readable per visibility" on public.shelves;

create policy "shelves are readable per visibility" on public.shelves for select using (
  visibility = 'link'
  or owner_id in (select id from public.profiles where user_id = auth.uid())
  or (
    visibility = 'followers'
    and owner_id in (
      select follower_id from public.follows
      where followee_id in (select id from public.profiles where user_id = auth.uid())
    )
  )
);

drop policy "shelf_recipes are readable per shelf visibility" on public.shelf_recipes;

create policy "shelf_recipes are readable per shelf visibility" on public.shelf_recipes for select using (
  shelf_id in (
    select id from public.shelves where
      visibility = 'link'
      or owner_id in (select id from public.profiles where user_id = auth.uid())
      or (
        visibility = 'followers'
        and owner_id in (
          select follower_id from public.follows
          where followee_id in (select id from public.profiles where user_id = auth.uid())
        )
      )
  )
);
