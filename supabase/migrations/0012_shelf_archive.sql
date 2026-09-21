-- Special Spoon — shelf archiving. Run after 0011_conversation_state.sql,
-- in the Supabase SQL Editor.

-- Null means active (shown in the Cookbook's Shelves tab and the
-- add-to-shelf picker); a timestamp means archived (hidden from both,
-- visible only in the "Archived" list, restorable from there). No new RLS
-- policy is needed — "owners manage their own shelves" already covers
-- update, since it's declared `for all`.
alter table public.shelves add column archived_at timestamptz;
