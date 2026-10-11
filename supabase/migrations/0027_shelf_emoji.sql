-- Special Spoon — an optional food emoji as a shelf's icon.
-- Run after 0026_cook_photos.sql, in the Supabase SQL Editor.

-- Null means no icon: the shelf shows its recipe count instead. The length
-- cap allows multi-codepoint emoji (variation selectors, ZWJ sequences)
-- while keeping the column from holding arbitrary text. Writing it needs no
-- new policy — "owners manage their own shelves" already covers updates.
alter table public.shelves
  add column emoji text check (emoji is null or char_length(emoji) <= 16);
