-- Special Spoon — threaded notes (replies, real likes, cooked-it) and a
-- real notifications table. Run after 0006_shelves.sql, in the Supabase
-- SQL Editor.

alter table public.comments
  add column parent_id uuid references public.comments(id) on delete cascade,
  add column cooked boolean not null default false;

-- The old `comments.likes` counter can't be toggled per-user or prevent a
-- double-like; real counts are computed from this table instead. The
-- column itself is left in place (unused going forward) rather than
-- dropped, to avoid touching anything else that might reference it.
create table public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_likes enable row level security;

create policy "comment likes are publicly readable" on public.comment_likes for select using (true);
create policy "users manage their own comment likes" on public.comment_likes for all using (
  user_id in (select id from public.profiles where user_id = auth.uid())
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('note', 'reply', 'follow', 'cooked', 'digest')),
  recipe_id uuid references public.recipes(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  excerpt text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.notifications enable row level security;

create policy "recipients read their own notifications" on public.notifications for select using (
  recipient_id in (select id from public.profiles where user_id = auth.uid())
);

-- The recipient is never the acting user for a notification insert (it's
-- always someone notifying someone else), so this can't be scoped to
-- "manage your own rows" the way most tables here are. It only checks
-- that whoever is claimed as the actor really is the caller.
create policy "signed-in users notify others" on public.notifications for insert with check (
  actor_id is null or actor_id in (select id from public.profiles where user_id = auth.uid())
);

create policy "recipients mark their own notifications read" on public.notifications for update using (
  recipient_id in (select id from public.profiles where user_id = auth.uid())
);
