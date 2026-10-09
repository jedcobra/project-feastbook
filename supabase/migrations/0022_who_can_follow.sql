-- Special Spoon — a real "who can follow you" setting.
-- Run after 0021_lowercase_handles.sql, in the Supabase SQL Editor.

alter table public.profiles
  add column who_can_follow text not null default 'anyone'
  check (who_can_follow in ('anyone', 'no_one'));

-- Existing follows aren't touched when this flips to 'no_one' — same
-- stance as blocking (0010): it stops new ones, it doesn't undo old ones.
drop policy "users manage their own follows" on public.follows;
create policy "users manage their own follows" on public.follows for all
  using (follower_id in (select id from public.profiles where user_id = auth.uid()))
  with check (
    follower_id in (select id from public.profiles where user_id = auth.uid())
    and not exists (
      select 1 from public.blocked_users b
      where (b.blocker_id = follower_id and b.blocked_id = followee_id)
         or (b.blocker_id = followee_id and b.blocked_id = follower_id)
    )
    and (select who_can_follow from public.profiles where id = followee_id) = 'anyone'
  );
