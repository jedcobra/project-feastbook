-- Special Spoon — a sticker (a cut-out with a see-through background) as
-- a shelf's cover, shown loose like an emoji rather than cropped square.
-- Run after 0030_shelf_audience.sql, in the Supabase SQL Editor.

-- Uploaded by the owner to their own folder in the photos bucket. The app
-- keeps emoji, cover_url and sticker_url mutually exclusive (choosing one
-- clears the others). Writing it needs no new policy — "owners manage
-- their own shelves" already covers updates.
alter table public.shelves
  add column sticker_url text check (sticker_url is null or (sticker_url ~ '^https://' and char_length(sticker_url) <= 2048));
