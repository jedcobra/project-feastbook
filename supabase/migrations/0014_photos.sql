-- Special Spoon — photos on recipes (cover + per-step) and on "I cooked it" comments.
-- Run after 0013_recipe_ratings.sql, in the Supabase SQL Editor.

alter table public.recipes add column cover_photo_url text;
alter table public.recipe_steps add column photo_url text;
alter table public.comments add column photo_url text;

-- made_it.photo_url was schema from the original v1 design and never wired
-- up to anything. Comments.photo_url above is the real version of it — a
-- photo belongs to the specific "I cooked it" post someone wrote, not a
-- single slot shared across every time they've ever cooked the recipe.
alter table public.made_it drop column photo_url;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Public read (the bucket itself is public, but RLS still gates writes).
-- Uploads are written to `<uploader's profile id>/...`, so "own your
-- folder" is the same ownership rule as every other table here.
create policy "photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "users manage their own photo uploads"
  on storage.objects for all
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid())
  )
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid())
  );
