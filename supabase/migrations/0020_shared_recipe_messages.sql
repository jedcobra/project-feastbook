-- Special Spoon — share a recipe into a DM.
-- Run after 0019_repair_comments_schema.sql, in the Supabase SQL Editor.

-- Nullable, and set null (not cascaded) on delete — losing the recipe
-- shouldn't take the rest of the conversation down with it.
alter table public.messages add column if not exists recipe_id uuid references public.recipes(id) on delete set null;
