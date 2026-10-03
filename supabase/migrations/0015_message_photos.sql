-- Special Spoon — photos in direct messages.
-- Run after 0014_photos.sql, in the Supabase SQL Editor.

-- Reuses the public `photos` Storage bucket and its RLS policies from
-- 0014_photos.sql (upload under <your own profile id>/...) — nothing new
-- needed there. A message can now carry a photo with or without text;
-- `text` stays `not null` (an image-only message just stores '').
alter table public.messages add column photo_url text;
