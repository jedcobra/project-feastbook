-- Special Spoon — seed data, ported from prototype/ss-data.jsx.
-- Run after 0001_init.sql, once, in the Supabase SQL Editor.
--
-- Seeds all fixture people (including "You") as unclaimed demo profiles
-- (profiles.user_id stays null for these). A real signup gets its own
-- fresh profile via the handle_new_user trigger — it does not reuse or
-- collide with this "you" demo profile, which is just seed content.

do $$
declare
  v_recipe uuid;
  v_section uuid;
begin

-- ─────────────────────────────────────────────────────────────
-- People
-- ─────────────────────────────────────────────────────────────
insert into public.profiles (name, handle, bio) values
  ('You', 'you', 'Sunday bread baker. Loose leaf teas.'),
  ('Maya Osei', 'mayacooks', 'West London by way of Accra. Stews, flatbreads, and the occasional cake.'),
  ('Ren Takeda', 'rensmallkitchen', 'One-pot everything. Tokyo → Brooklyn.'),
  ('Cora Linden', 'coral', 'Chef at Linden + Co. Home cook at heart.'),
  ('Devi Iyer', 'dev.iyer', 'South Indian grandma recipes, modernised.'),
  ('Sam Beaufort', 'sambeau', 'Fermenting, pickling, preserving.'),
  ('Lu Tiang', 'luminous', 'Weeknight dinners. 30 min or less.');

-- "You" follows everyone else, for a populated feed out of the box.
insert into public.follows (follower_id, followee_id)
select (select id from public.profiles where handle = 'you'), id
from public.profiles
where handle <> 'you';

-- ─────────────────────────────────────────────────────────────
-- Recipe: Brown Butter Miso Pasta
-- ─────────────────────────────────────────────────────────────
insert into public.recipes (author_id, title, subtitle, intro, time, serves, difficulty, tags, rating, created_at)
values (
  (select id from public.profiles where handle = 'rensmallkitchen'),
  'Brown Butter Miso Pasta',
  'A 20-minute dinner that tastes like a two-hour one.',
  'The first time I made this I used up the end of a tub of white miso and half a stick of butter. I have been chasing that exact meal ever since. The trick is to push the butter past golden into a deep, nutty amber — the miso then tips it into something strange and wonderful.',
  '25 min', 2, 'Easy', array['pasta', 'weeknight', 'umami'], 4.8, now() - interval '2 hours'
) returning id into v_recipe;

insert into public.recipe_ingredient_sections (recipe_id, label, position) values (v_recipe, 'For the pasta', 0) returning id into v_section;
insert into public.recipe_ingredients (section_id, quantity, name, position) values
  (v_section, '200g', 'bucatini or spaghetti', 0),
  (v_section, '1 tbsp', 'sea salt, for the water', 1);

insert into public.recipe_ingredient_sections (recipe_id, label, position) values (v_recipe, 'For the sauce', 1) returning id into v_section;
insert into public.recipe_ingredients (section_id, quantity, name, position) values
  (v_section, '80g', 'unsalted butter', 0),
  (v_section, '2 tbsp', 'white miso paste', 1),
  (v_section, '1 tsp', 'soy sauce', 2),
  (v_section, '1', 'lemon, zested', 3),
  (v_section, '½ tsp', 'black pepper, freshly cracked', 4);

insert into public.recipe_ingredient_sections (recipe_id, label, position) values (v_recipe, 'To finish', 2) returning id into v_section;
insert into public.recipe_ingredients (section_id, quantity, name, position) values
  (v_section, '30g', 'Parmesan, finely grated', 0),
  (v_section, 'handful', 'parsley, chopped', 1);

insert into public.recipe_steps (recipe_id, position, title, description, timer_minutes) values
  (v_recipe, 0, 'Boil a large pot of water', 'Salt it generously — it should taste like the sea. Drop the pasta in when it hits a rolling boil.', 10),
  (v_recipe, 1, 'Brown the butter', 'Melt butter in a wide pan over medium heat. Swirl as it foams. When the milk solids at the bottom turn deep amber and smell nutty (about 4 minutes), kill the heat.', 4),
  (v_recipe, 2, 'Build the sauce', 'Whisk in miso and soy. Add a ladle of pasta water — the sauce will split, then come back together glossy. Keep warm.', null),
  (v_recipe, 3, 'Combine', 'Drain pasta just before al dente. Toss into the pan with another splash of pasta water. Shower with Parm, parsley, lemon zest, pepper.', null);

insert into public.recipe_notes (recipe_id, text, position) values
  (v_recipe, 'If you only have salted butter, skip the soy.', 0),
  (v_recipe, 'Good cold, straight from the fridge, at midnight.', 1);

insert into public.comments (recipe_id, author_id, text, likes) values
  (v_recipe, (select id from public.profiles where handle = 'mayacooks'), 'Made this for dinner last night. Added a soft egg on top. 10/10.', 12),
  (v_recipe, (select id from public.profiles where handle = 'luminous'), 'My kids asked for seconds. Thirds, even. Adding to the rotation.', 8),
  (v_recipe, (select id from public.profiles where handle = 'sambeau'), 'Tried with red miso and it was deeply savoury — almost too much. Stick to white!', 3);

insert into public.made_it (user_id, recipe_id, caption, created_at) values
  ((select id from public.profiles where handle = 'mayacooks'), v_recipe, 'Soft egg + chili crisp on top. Don''t @ me.', now() - interval '4 hours');

-- ─────────────────────────────────────────────────────────────
-- Recipe: Mum's Jollof Rice
-- ─────────────────────────────────────────────────────────────
insert into public.recipes (author_id, title, subtitle, intro, time, serves, difficulty, tags, rating, created_at)
values (
  (select id from public.profiles where handle = 'mayacooks'),
  'Mum''s Jollof Rice',
  'The way my mum makes it, written down for the first time.',
  'I watched my mum make this a hundred times before I tried to write it down. She measures everything by feel — "a proper spoon," "enough water." This is my attempt to pin that down without losing the soul of it.',
  '1 hr 10 min', 6, 'Medium', array['rice', 'west african', 'family'], 4.9, now() - interval '3 days'
) returning id into v_recipe;

insert into public.recipe_ingredient_sections (recipe_id, label, position) values (v_recipe, 'Base', 0) returning id into v_section;
insert into public.recipe_ingredients (section_id, quantity, name, position) values
  (v_section, '4', 'large plum tomatoes', 0),
  (v_section, '2', 'red bell peppers', 1),
  (v_section, '2', 'scotch bonnets (to taste)', 2),
  (v_section, '1', 'large onion', 3);

insert into public.recipe_ingredient_sections (recipe_id, label, position) values (v_recipe, 'Rice', 1) returning id into v_section;
insert into public.recipe_ingredients (section_id, quantity, name, position) values
  (v_section, '500g', 'long-grain rice, rinsed well', 0),
  (v_section, '60ml', 'neutral oil', 1),
  (v_section, '2 tbsp', 'tomato paste', 2),
  (v_section, '2', 'bay leaves', 3),
  (v_section, '1 tsp', 'curry powder', 4),
  (v_section, '1 tsp', 'thyme', 5),
  (v_section, '1', 'stock cube', 6);

insert into public.recipe_steps (recipe_id, position, title, description, timer_minutes) values
  (v_recipe, 0, 'Blend the base', 'Roughly chop tomatoes, peppers, scotch bonnets, and half the onion. Blend smooth.', null),
  (v_recipe, 1, 'Fry the onions', 'Dice the other onion half. Fry in oil over medium until deeply golden.', 8),
  (v_recipe, 2, 'Build the stew', 'Stir in tomato paste; fry 2 min. Pour in blended base. Simmer hard, stirring, until oil separates and it darkens to a brick red.', 20),
  (v_recipe, 3, 'Season + rice', 'Add bay, thyme, curry, stock cube, 500ml water. Taste. Stir in rice, cover tight. Reduce to lowest heat.', null),
  (v_recipe, 4, 'Steam it out', 'Do not lift the lid for 25 minutes. Then fluff from the bottom — the smoky layer at the base is the prize.', 25);

insert into public.recipe_notes (recipe_id, text, position) values
  (v_recipe, 'The pot matters. A thick-bottomed one will save you from burning.', 0),
  (v_recipe, 'For party jollof: move to a low oven (150C) for the last 20 min instead of stovetop.', 1);

insert into public.comments (recipe_id, author_id, text, likes) values
  (v_recipe, (select id from public.profiles where handle = 'dev.iyer'), 'The party jollof note is a game-changer. Thank you!', 18),
  (v_recipe, (select id from public.profiles where handle = 'coral'), 'Tell your mum a chef is stealing her recipe. xx', 22);

insert into public.made_it (user_id, recipe_id, caption, created_at) values
  ((select id from public.profiles where handle = 'luminous'), v_recipe, 'Party jollof method for the win.', now() - interval '1 day');

-- ─────────────────────────────────────────────────────────────
-- Recipe: Lazy Sourdough Focaccia
-- ─────────────────────────────────────────────────────────────
insert into public.recipes (author_id, title, subtitle, intro, time, serves, difficulty, tags, rating, created_at)
values (
  (select id from public.profiles where handle = 'you'),
  'Lazy Sourdough Focaccia',
  'No kneading. Mostly waiting.',
  'I make this every other Saturday. Mix the night before, fridge overnight, bake in the morning. The hands-on time is maybe fifteen minutes, spread across two days.',
  '18 hrs (mostly waiting)', 8, 'Easy', array['bread', 'sourdough', 'slow'], 4.7, now() - interval '4 days'
) returning id into v_recipe;

insert into public.recipe_ingredient_sections (recipe_id, label, position) values (v_recipe, null, 0) returning id into v_section;
insert into public.recipe_ingredients (section_id, quantity, name, position) values
  (v_section, '500g', 'strong white flour', 0),
  (v_section, '400g', 'water, cool', 1),
  (v_section, '100g', 'active sourdough starter', 2),
  (v_section, '10g', 'fine salt', 3),
  (v_section, '4 tbsp', 'good olive oil, divided', 4),
  (v_section, 'flaky salt + rosemary', 'to finish', 5);

insert into public.recipe_steps (recipe_id, position, title, description, timer_minutes) values
  (v_recipe, 0, 'Evening: mix', 'Whisk flour, water, starter, salt in a bowl. It will look shaggy. Cover, rest 30 min.', null),
  (v_recipe, 1, 'Fold', 'Wet hands. Four stretch-and-folds, 30 min apart. Then fridge overnight.', null),
  (v_recipe, 2, 'Morning: pan', 'Oil a 9x13 tray generously. Tip dough in. Let it relax, 2 hours at room temp.', null),
  (v_recipe, 3, 'Dimple', 'Oiled fingers. Press down firmly, making deep dimples across the surface.', null),
  (v_recipe, 4, 'Bake', 'Scatter rosemary + flaky salt. Bake at 230C/450F for 22–25 minutes until deeply golden.', 23);

insert into public.recipe_notes (recipe_id, text, position) values
  (v_recipe, 'Works with 100% whole wheat if you up the water to 440g.', 0);

insert into public.comments (recipe_id, author_id, text, likes) values
  (v_recipe, (select id from public.profiles where handle = 'rensmallkitchen'), 'Made three in a row. Now obsessed.', 4);

insert into public.saves (user_id, recipe_id, created_at) values
  ((select id from public.profiles where handle = 'coral'), v_recipe, now() - interval '1 day');

-- ─────────────────────────────────────────────────────────────
-- Recipe: Preserved Lemons, Slowly (index-only, no full write-up yet)
-- ─────────────────────────────────────────────────────────────
insert into public.recipes (author_id, title, subtitle, time, serves, difficulty, tags, rating, created_at)
values (
  (select id from public.profiles where handle = 'sambeau'),
  'Preserved Lemons, Slowly',
  'One jar, one month, endless meals.',
  '30 days', 1, 'Easy', array['preserves', 'pantry'], 4.6, now() - interval '6 days'
);

-- ─────────────────────────────────────────────────────────────
-- Recipe: Red Lentil + Coconut Soup (index-only, no full write-up yet)
-- ─────────────────────────────────────────────────────────────
insert into public.recipes (author_id, title, subtitle, time, serves, difficulty, tags, rating, created_at)
values (
  (select id from public.profiles where handle = 'dev.iyer'),
  'Red Lentil + Coconut Soup',
  'The one you want when it rains.',
  '35 min', 4, 'Easy', array['soup', 'vegan', 'weeknight'], 4.8, now() - interval '6 hours'
);

-- ─────────────────────────────────────────────────────────────
-- Recipe: Upside-Down Plum Tatin (index-only, no full write-up yet)
-- ─────────────────────────────────────────────────────────────
insert into public.recipes (author_id, title, subtitle, time, serves, difficulty, tags, rating, created_at)
values (
  (select id from public.profiles where handle = 'coral'),
  'Upside-Down Plum Tatin',
  'Caramel, pastry, patience.',
  '1 hr', 6, 'Medium', array['dessert', 'french'], 4.7, now() - interval '2 days'
);

-- ─────────────────────────────────────────────────────────────
-- Recipe: Braised Greens with Garlic and Chili (index-only, no full write-up yet)
-- ─────────────────────────────────────────────────────────────
insert into public.recipes (author_id, title, subtitle, time, serves, difficulty, tags, rating, created_at)
values (
  (select id from public.profiles where handle = 'luminous'),
  'Braised Greens with Garlic and Chili',
  '15 minutes. Any green in the fridge.',
  '15 min', 2, 'Easy', array['side', 'weeknight', 'vegan'], 4.5, now() - interval '7 days'
);

-- ─────────────────────────────────────────────────────────────
-- Shelves (all owned by "You", per the current profile screen)
-- ─────────────────────────────────────────────────────────────
insert into public.shelves (owner_id, title, subtitle) values
  ((select id from public.profiles where handle = 'you'), 'Weeknight', '30 minutes or less'),
  ((select id from public.profiles where handle = 'you'), 'Sunday Projects', 'When I have time'),
  ((select id from public.profiles where handle = 'you'), 'Home Bakery', 'Breads, pastries, all the flour'),
  ((select id from public.profiles where handle = 'you'), 'Pantry + Preserves', 'Keeps for weeks');

insert into public.shelf_recipes (shelf_id, recipe_id, position)
select (select id from public.shelves where title = 'Weeknight'), r.id, row_number() over () - 1
from public.recipes r where r.title in ('Brown Butter Miso Pasta', 'Braised Greens with Garlic and Chili', 'Red Lentil + Coconut Soup');

insert into public.shelf_recipes (shelf_id, recipe_id, position)
select (select id from public.shelves where title = 'Sunday Projects'), r.id, row_number() over () - 1
from public.recipes r where r.title in ('Lazy Sourdough Focaccia', 'Mum''s Jollof Rice', 'Upside-Down Plum Tatin');

insert into public.shelf_recipes (shelf_id, recipe_id, position)
select (select id from public.shelves where title = 'Home Bakery'), r.id, row_number() over () - 1
from public.recipes r where r.title in ('Lazy Sourdough Focaccia', 'Upside-Down Plum Tatin');

insert into public.shelf_recipes (shelf_id, recipe_id, position)
select (select id from public.shelves where title = 'Pantry + Preserves'), r.id, 0
from public.recipes r where r.title = 'Preserved Lemons, Slowly';

end $$;
