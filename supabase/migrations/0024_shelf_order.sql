-- Special Spoon — a person's own ordering of the shelves in their cookbook.
-- Run after 0023_cookbook_order.sql, in the Supabase SQL Editor.

-- Null until the owner first rearranges; unplaced shelves (including any
-- made since) list ahead of placed ones, newest first. Writing it needs no
-- new policy — "owners manage their own shelves" already covers updates.
alter table public.shelves add column position integer;
