-- Special Spoon — blocking, and deleting your own messages.
-- Run after 0009_messages.sql, in the Supabase SQL Editor.

create table public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocked_users enable row level security;

-- Whether someone has blocked you isn't any of your business to read —
-- only the blocker can see their own block list.
create policy "users see their own blocks" on public.blocked_users for select using (
  blocker_id in (select id from public.profiles where user_id = auth.uid())
);

create policy "users manage their own blocks" on public.blocked_users for all using (
  blocker_id in (select id from public.profiles where user_id = auth.uid())
);

-- Deleting a comment already had a "delete your own" policy; messages never
-- got one.
create policy "senders delete their own messages" on public.messages for delete using (
  sender_id in (select id from public.profiles where user_id = auth.uid())
);

-- A block cuts off messaging in both directions, in both new and existing
-- conversations — replaces the insert policy from 0009 with the same
-- check plus "neither side has blocked the other".
drop policy "participants send messages" on public.messages;
create policy "participants send messages" on public.messages for insert with check (
  sender_id in (select id from public.profiles where user_id = auth.uid())
  and conversation_id in (
    select id from public.conversations
    where user_a_id in (select id from public.profiles where user_id = auth.uid())
       or user_b_id in (select id from public.profiles where user_id = auth.uid())
  )
  and not exists (
    select 1 from public.conversations c
    join public.blocked_users b
      on (b.blocker_id = c.user_a_id and b.blocked_id = c.user_b_id)
      or (b.blocker_id = c.user_b_id and b.blocked_id = c.user_a_id)
    where c.id = conversation_id
  )
);

-- Same for starting a brand new conversation with someone you've blocked
-- or who's blocked you.
drop policy "signed-in users start conversations they're part of" on public.conversations;
create policy "signed-in users start conversations they're part of" on public.conversations for insert with check (
  (user_a_id in (select id from public.profiles where user_id = auth.uid())
    or user_b_id in (select id from public.profiles where user_id = auth.uid()))
  and not exists (
    select 1 from public.blocked_users b
    where (b.blocker_id = user_a_id and b.blocked_id = user_b_id)
       or (b.blocker_id = user_b_id and b.blocked_id = user_a_id)
  )
);

-- A block also means you can't (re-)follow each other. Existing follows
-- aren't touched by this policy — the app removes those itself at block
-- time (see the next policy) — this just stops new ones while it stands.
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
  );

-- Lets blocking clean up a follow in *either* direction (the policy above
-- only ever let you delete a follow row where you're the follower) — also
-- doubles as a real "remove this follower" ability on its own.
create policy "followees can remove a follower" on public.follows for delete using (
  followee_id in (select id from public.profiles where user_id = auth.uid())
);
