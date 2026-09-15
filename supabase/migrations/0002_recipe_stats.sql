-- Special Spoon — recipe stats view.
-- Run after 0001_init.sql, in the Supabase SQL Editor.

create view public.recipe_stats as
select
  r.id,
  (select count(*) from public.made_it m where m.recipe_id = r.id) as made_it_count,
  (select count(*) from public.saves s where s.recipe_id = r.id) as save_count
from public.recipes r;
