-- Special Spoon — direct messages between two cooks.
-- Run after 0008_settings.sql, in the Supabase SQL Editor.

-- One row per pair, never two — user_a_id/user_b_id are stored in a fixed
-- (smaller, larger) order so there's exactly one conversation between any
-- two people, and a lookup doesn't need to check both orderings.
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "participants read their conversations" on public.conversations for select using (
  user_a_id in (select id from public.profiles where user_id = auth.uid())
  or user_b_id in (select id from public.profiles where user_id = auth.uid())
);

create policy "signed-in users start conversations they're part of" on public.conversations for insert with check (
  user_a_id in (select id from public.profiles where user_id = auth.uid())
  or user_b_id in (select id from public.profiles where user_id = auth.uid())
);

create policy "participants update their conversations" on public.conversations for update using (
  user_a_id in (select id from public.profiles where user_id = auth.uid())
  or user_b_id in (select id from public.profiles where user_id = auth.uid())
);

create policy "participants read their messages" on public.messages for select using (
  conversation_id in (
    select id from public.conversations
    where user_a_id in (select id from public.profiles where user_id = auth.uid())
       or user_b_id in (select id from public.profiles where user_id = auth.uid())
  )
);

create policy "participants send messages" on public.messages for insert with check (
  sender_id in (select id from public.profiles where user_id = auth.uid())
  and conversation_id in (
    select id from public.conversations
    where user_a_id in (select id from public.profiles where user_id = auth.uid())
       or user_b_id in (select id from public.profiles where user_id = auth.uid())
  )
);

create policy "participants mark messages read" on public.messages for update using (
  conversation_id in (
    select id from public.conversations
    where user_a_id in (select id from public.profiles where user_id = auth.uid())
       or user_b_id in (select id from public.profiles where user_id = auth.uid())
  )
);
