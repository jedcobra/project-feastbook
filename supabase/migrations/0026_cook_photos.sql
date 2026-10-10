-- Special Spoon — photos of your version of a dish, shown as the "Cooked"
-- grid on profiles, with comments and chef's kisses (likes) on each.
-- Run after 0025_comment_edits.sql, in the Supabase SQL Editor.

create table public.cook_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);
create index cook_photos_user_idx on public.cook_photos (user_id, created_at desc);

create table public.cook_photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.cook_photos(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  created_at timestamptz not null default now()
);
create index cook_photo_comments_photo_idx on public.cook_photo_comments (photo_id, created_at);

create table public.cook_photo_kisses (
  photo_id uuid not null references public.cook_photos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (photo_id, user_id)
);

alter table public.cook_photos enable row level security;
alter table public.cook_photo_comments enable row level security;
alter table public.cook_photo_kisses enable row level security;

-- A photo is visible exactly when its recipe is visible to the viewer: the
-- subquery runs under the viewer's own recipes RLS, so a photo of a private
-- or followers-only recipe doesn't leak it to people who can't see it.
create policy "cook photos follow their recipe's visibility" on public.cook_photos for select
  using (exists (select 1 from public.recipes r where r.id = recipe_id));
create policy "users add their own cook photos" on public.cook_photos for insert
  with check (user_id in (select id from public.profiles where user_id = auth.uid()));
create policy "users delete their own cook photos" on public.cook_photos for delete
  using (user_id in (select id from public.profiles where user_id = auth.uid()));

-- Comments and kisses are visible (and can be added) wherever the photo is.
create policy "cook photo comments follow their photo" on public.cook_photo_comments for select
  using (exists (select 1 from public.cook_photos p where p.id = photo_id));
create policy "users comment on visible cook photos" on public.cook_photo_comments for insert
  with check (
    author_id in (select id from public.profiles where user_id = auth.uid())
    and exists (select 1 from public.cook_photos p where p.id = photo_id)
  );
-- Your own comments, or any comment on your own photo.
create policy "users delete their own or their photo's comments" on public.cook_photo_comments for delete
  using (
    author_id in (select id from public.profiles where user_id = auth.uid())
    or exists (
      select 1 from public.cook_photos p
      where p.id = photo_id and p.user_id in (select id from public.profiles where user_id = auth.uid())
    )
  );

create policy "cook photo kisses follow their photo" on public.cook_photo_kisses for select
  using (exists (select 1 from public.cook_photos p where p.id = photo_id));
create policy "users kiss visible cook photos" on public.cook_photo_kisses for insert
  with check (
    user_id in (select id from public.profiles where user_id = auth.uid())
    and exists (select 1 from public.cook_photos p where p.id = photo_id)
  );
create policy "users take back their own kisses" on public.cook_photo_kisses for delete
  using (user_id in (select id from public.profiles where user_id = auth.uid()));

-- Notifications for kisses and comments on your photos, linking to the photo.
alter table public.notifications
  add column if not exists cook_photo_id uuid references public.cook_photos(id) on delete cascade;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('note', 'reply', 'follow', 'cooked', 'digest', 'message', 'kiss', 'photo_comment'));
