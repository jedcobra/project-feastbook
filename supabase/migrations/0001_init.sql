-- Special Spoon — initial schema.
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- profiles
-- user_id is nullable + unique rather than the primary key so we can seed
-- demo authors (Maya, Ren, Cora, ...) as real rows without fake auth
-- accounts. A real signup gets its own fresh profile linked via user_id.
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  handle text not null unique,
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  intro text not null default '',
  time text not null default '',
  serves int not null default 1,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  tags text[] not null default '{}',
  rating numeric(2, 1),
  created_at timestamptz not null default now()
);

create table public.recipe_ingredient_sections (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  label text,
  position int not null default 0
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.recipe_ingredient_sections(id) on delete cascade,
  quantity text not null default '',
  name text not null,
  position int not null default 0
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position int not null default 0,
  title text not null,
  description text not null default '',
  timer_minutes int
);

create table public.recipe_notes (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  text text not null,
  position int not null default 0
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  likes int not null default 0,
  created_at timestamptz not null default now()
);

create table public.saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.made_it (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  caption text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  created_at timestamptz not null default now()
);

create table public.shelf_recipes (
  shelf_id uuid not null references public.shelves(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position int not null default 0,
  primary key (shelf_id, recipe_id)
);

-- Per-profile counts used by the profile header stats grid.
create view public.profile_stats as
select
  p.id,
  (select count(*) from public.recipes r where r.author_id = p.id) as recipe_count,
  (select count(*) from public.follows f where f.followee_id = p.id) as follower_count,
  (select count(*) from public.follows f where f.follower_id = p.id) as following_count
from public.profiles p;

-- Recipe count per shelf, for the count badge + "+N more" tag overflow.
create view public.shelf_stats as
select s.id, count(sr.recipe_id) as recipe_count
from public.shelves s
left join public.shelf_recipes sr on sr.shelf_id = s.id
group by s.id;

-- Feed activity is derived, not stored: a "new" entry per recipe, a
-- "madeit" entry per made_it row, a "saved" entry per save.
create view public.feed_activity as
select 'new' as kind, r.author_id as who_id, r.id as recipe_id, r.created_at as happened_at, null::text as caption
from public.recipes r
union all
select 'madeit' as kind, m.user_id as who_id, m.recipe_id, m.created_at as happened_at, m.caption
from public.made_it m
union all
select 'saved' as kind, s.user_id as who_id, s.recipe_id, s.created_at as happened_at, null::text as caption
from public.saves s;

-- ─────────────────────────────────────────────────────────────
-- New auth user -> new profile row, linked via user_id.
-- Pass { data: { name, handle } } to supabase.auth.signUp() to seed these;
-- falls back to deriving them from the email if omitted.
-- ─────────────────────────────────────────────────────────────
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name, handle, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'handle', lower(split_part(new.email, '@', 1))),
    ''
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Row Level Security — public read on everything (it's a public
-- cookbook app), writes scoped to the acting user via their profile.
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredient_sections enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_notes enable row level security;
alter table public.comments enable row level security;
alter table public.saves enable row level security;
alter table public.made_it enable row level security;
alter table public.shelves enable row level security;
alter table public.shelf_recipes enable row level security;

create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users update their own profile" on public.profiles for update using (user_id = auth.uid());

create policy "follows are publicly readable" on public.follows for select using (true);
create policy "users manage their own follows" on public.follows for all
  using (follower_id in (select id from public.profiles where user_id = auth.uid()))
  with check (follower_id in (select id from public.profiles where user_id = auth.uid()));

create policy "recipes are publicly readable" on public.recipes for select using (true);
create policy "authors manage their own recipes" on public.recipes for all
  using (author_id in (select id from public.profiles where user_id = auth.uid()))
  with check (author_id in (select id from public.profiles where user_id = auth.uid()));

create policy "ingredient sections are publicly readable" on public.recipe_ingredient_sections for select using (true);
create policy "authors manage their own ingredient sections" on public.recipe_ingredient_sections for all
  using (recipe_id in (
    select id from public.recipes where author_id in (select id from public.profiles where user_id = auth.uid())
  ));

create policy "ingredients are publicly readable" on public.recipe_ingredients for select using (true);
create policy "authors manage their own ingredients" on public.recipe_ingredients for all
  using (section_id in (
    select rs.id from public.recipe_ingredient_sections rs
    join public.recipes r on r.id = rs.recipe_id
    where r.author_id in (select id from public.profiles where user_id = auth.uid())
  ));

create policy "steps are publicly readable" on public.recipe_steps for select using (true);
create policy "authors manage their own steps" on public.recipe_steps for all
  using (recipe_id in (
    select id from public.recipes where author_id in (select id from public.profiles where user_id = auth.uid())
  ));

create policy "notes are publicly readable" on public.recipe_notes for select using (true);
create policy "authors manage their own notes" on public.recipe_notes for all
  using (recipe_id in (
    select id from public.recipes where author_id in (select id from public.profiles where user_id = auth.uid())
  ));

create policy "comments are publicly readable" on public.comments for select using (true);
create policy "signed-in users add comments" on public.comments for insert
  with check (author_id in (select id from public.profiles where user_id = auth.uid()));
create policy "users manage their own comments" on public.comments for update
  using (author_id in (select id from public.profiles where user_id = auth.uid()));
create policy "users delete their own comments" on public.comments for delete
  using (author_id in (select id from public.profiles where user_id = auth.uid()));

create policy "saves are publicly readable" on public.saves for select using (true);
create policy "users manage their own saves" on public.saves for all
  using (user_id in (select id from public.profiles where user_id = auth.uid()));

create policy "made_it entries are publicly readable" on public.made_it for select using (true);
create policy "users manage their own made_it entries" on public.made_it for all
  using (user_id in (select id from public.profiles where user_id = auth.uid()));

create policy "shelves are publicly readable" on public.shelves for select using (true);
create policy "owners manage their own shelves" on public.shelves for all
  using (owner_id in (select id from public.profiles where user_id = auth.uid()));

create policy "shelf_recipes are publicly readable" on public.shelf_recipes for select using (true);
create policy "owners manage their own shelf_recipes" on public.shelf_recipes for all
  using (shelf_id in (
    select id from public.shelves where owner_id in (select id from public.profiles where user_id = auth.uid())
  ));
