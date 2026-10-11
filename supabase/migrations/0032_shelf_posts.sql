-- Special Spoon — posting a shelf to the feed.
-- Run after 0031_shelf_sticker.sql, in the Supabase SQL Editor.

-- When the owner chose "Tell my followers": the shelf shows in the feed
-- from then on, to whoever can see the shelf. Null means it was never
-- posted. Set once (a shelf is only ever posted once). Writing it needs no
-- new policy — "owners manage their own shelves" already covers updates.
alter table public.shelves add column posted_at timestamptz;

create index shelves_posted_at_idx on public.shelves (posted_at desc) where posted_at is not null;
