-- Special Spoon — a shelf cover photo, as an alternative to an emoji.
-- Run after 0027_shelf_emoji.sql, in the Supabase SQL Editor.

-- Either one of the shelf's recipes' cover photos or one the owner
-- uploaded to their own folder in the photos bucket; null means no photo.
-- The app keeps it and `emoji` mutually exclusive (choosing one clears the
-- other). Writing it needs no new policy — "owners manage their own
-- shelves" already covers updates.
alter table public.shelves
  add column cover_url text check (cover_url is null or (cover_url ~ '^https://' and char_length(cover_url) <= 2048));
