-- Special Spoon — Web Push subscriptions.
-- Run after 0015_message_photos.sql, in the Supabase SQL Editor.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- No public select policy — the only server-side reader is /api/push/send,
-- which uses the service-role key and so bypasses RLS entirely. A client
-- only ever needs to see (and manage) its own device's subscription.
create policy "users manage their own push subscriptions" on public.push_subscriptions for all
  using (user_id in (select id from public.profiles where user_id = auth.uid()))
  with check (user_id in (select id from public.profiles where user_id = auth.uid()));
