// Typed fixtures ported from design_handoff_special_spoon/prototype/ss-data.jsx.
// Seed data for development — swap for real reads once the data layer exists.

import type { FeedActivity, Person, Recipe, Shelf } from './types';

export const PEOPLE: Person[] = [
  { id: 'me', name: 'You', handle: 'you', bio: 'Sunday bread baker. Loose leaf teas.', recipes: 34, followers: 241, following: 112, seed: 0 },
  { id: 'maya', name: 'Maya Osei', handle: 'mayacooks', bio: 'West London by way of Accra. Stews, flatbreads, and the occasional cake.', recipes: 87, followers: 4210, following: 230, seed: 3 },
  { id: 'ren', name: 'Ren Takeda', handle: 'rensmallkitchen', bio: 'One-pot everything. Tokyo → Brooklyn.', recipes: 52, followers: 1820, following: 340, seed: 5 },
  { id: 'cora', name: 'Cora Linden', handle: 'coral', bio: 'Chef at Linden + Co. Home cook at heart.', recipes: 141, followers: 12400, following: 89, seed: 2 },
  { id: 'dev', name: 'Devi Iyer', handle: 'dev.iyer', bio: 'South Indian grandma recipes, modernised.', recipes: 68, followers: 3100, following: 412, seed: 7 },
  { id: 'sam', name: 'Sam Beaufort', handle: 'sambeau', bio: 'Fermenting, pickling, preserving.', recipes: 29, followers: 720, following: 180, seed: 4 },
  { id: 'lu', name: 'Lu Tiang', handle: 'luminous', bio: 'Weeknight dinners. 30 min or less.', recipes: 96, followers: 2600, following: 301, seed: 1 },
];

export const byHandle = (handle: string): Person => {
  const person = PEOPLE.find((p) => p.handle === handle);
  if (!person) throw new Error(`No person with handle "${handle}"`);
  return person;
};

export const RECIPES: Recipe[] = [
  {
    id: 'brown-butter-miso',
    title: 'Brown Butter Miso Pasta',
    subtitle: 'A 20-minute dinner that tastes like a two-hour one.',
    author: 'rensmallkitchen',
    seed: 0,
    time: '25 min',
    serves: 2,
    difficulty: 'Easy',
    tags: ['pasta', 'weeknight', 'umami'],
    madeIt: 142,
    saves: 1240,
    rating: 4.8,
    intro:
      'The first time I made this I used up the end of a tub of white miso and half a stick of butter. I have been chasing that exact meal ever since. The trick is to push the butter past golden into a deep, nutty amber — the miso then tips it into something strange and wonderful.',
    ingredients: [
      {
        section: 'For the pasta',
        items: [
          { q: '200g', i: 'bucatini or spaghetti' },
          { q: '1 tbsp', i: 'sea salt, for the water' },
        ],
      },
      {
        section: 'For the sauce',
        items: [
          { q: '80g', i: 'unsalted butter' },
          { q: '2 tbsp', i: 'white miso paste' },
          { q: '1 tsp', i: 'soy sauce' },
          { q: '1', i: 'lemon, zested' },
          { q: '½ tsp', i: 'black pepper, freshly cracked' },
        ],
      },
      {
        section: 'To finish',
        items: [
          { q: '30g', i: 'Parmesan, finely grated' },
          { q: 'handful', i: 'parsley, chopped' },
        ],
      },
    ],
    steps: [
      { t: 'Boil a large pot of water', d: 'Salt it generously — it should taste like the sea. Drop the pasta in when it hits a rolling boil.', timer: 10 },
      { t: 'Brown the butter', d: 'Melt butter in a wide pan over medium heat. Swirl as it foams. When the milk solids at the bottom turn deep amber and smell nutty (about 4 minutes), kill the heat.', timer: 4 },
      { t: 'Build the sauce', d: 'Whisk in miso and soy. Add a ladle of pasta water — the sauce will split, then come back together glossy. Keep warm.' },
      { t: 'Combine', d: 'Drain pasta just before al dente. Toss into the pan with another splash of pasta water. Shower with Parm, parsley, lemon zest, pepper.' },
    ],
    notes: [
      { by: 'Ren', text: 'If you only have salted butter, skip the soy.' },
      { by: 'Ren', text: 'Good cold, straight from the fridge, at midnight.' },
    ],
    comments: [
      { by: 'mayacooks', text: 'Made this for dinner last night. Added a soft egg on top. 10/10.', likes: 12, replies: 2 },
      { by: 'luminous', text: 'My kids asked for seconds. Thirds, even. Adding to the rotation.', likes: 8 },
      { by: 'sambeau', text: 'Tried with red miso and it was deeply savoury — almost too much. Stick to white!', likes: 3 },
    ],
  },
  {
    id: 'jollof',
    title: 'Mum’s Jollof Rice',
    subtitle: 'The way my mum makes it, written down for the first time.',
    author: 'mayacooks',
    seed: 6,
    time: '1 hr 10 min',
    serves: 6,
    difficulty: 'Medium',
    tags: ['rice', 'west african', 'family'],
    madeIt: 312,
    saves: 2180,
    rating: 4.9,
    intro:
      'I watched my mum make this a hundred times before I tried to write it down. She measures everything by feel — “a proper spoon,” “enough water.” This is my attempt to pin that down without losing the soul of it.',
    ingredients: [
      {
        section: 'Base',
        items: [
          { q: '4', i: 'large plum tomatoes' },
          { q: '2', i: 'red bell peppers' },
          { q: '2', i: 'scotch bonnets (to taste)' },
          { q: '1', i: 'large onion' },
        ],
      },
      {
        section: 'Rice',
        items: [
          { q: '500g', i: 'long-grain rice, rinsed well' },
          { q: '60ml', i: 'neutral oil' },
          { q: '2 tbsp', i: 'tomato paste' },
          { q: '2', i: 'bay leaves' },
          { q: '1 tsp', i: 'curry powder' },
          { q: '1 tsp', i: 'thyme' },
          { q: '1', i: 'stock cube' },
        ],
      },
    ],
    steps: [
      { t: 'Blend the base', d: 'Roughly chop tomatoes, peppers, scotch bonnets, and half the onion. Blend smooth.' },
      { t: 'Fry the onions', d: 'Dice the other onion half. Fry in oil over medium until deeply golden.', timer: 8 },
      { t: 'Build the stew', d: 'Stir in tomato paste; fry 2 min. Pour in blended base. Simmer hard, stirring, until oil separates and it darkens to a brick red.', timer: 20 },
      { t: 'Season + rice', d: 'Add bay, thyme, curry, stock cube, 500ml water. Taste. Stir in rice, cover tight. Reduce to lowest heat.' },
      { t: 'Steam it out', d: 'Do not lift the lid for 25 minutes. Then fluff from the bottom — the smoky layer at the base is the prize.', timer: 25 },
    ],
    notes: [
      { by: 'Maya', text: 'The pot matters. A thick-bottomed one will save you from burning.' },
      { by: 'Maya', text: 'For party jollof: move to a low oven (150C) for the last 20 min instead of stovetop.' },
    ],
    comments: [
      { by: 'dev.iyer', text: 'The party jollof note is a game-changer. Thank you!', likes: 18 },
      { by: 'coral', text: 'Tell your mum a chef is stealing her recipe. xx', likes: 22, replies: 1 },
    ],
  },
  {
    id: 'sourdough-focaccia',
    title: 'Lazy Sourdough Focaccia',
    subtitle: 'No kneading. Mostly waiting.',
    author: 'you',
    seed: 4,
    time: '18 hrs (mostly waiting)',
    serves: 8,
    difficulty: 'Easy',
    tags: ['bread', 'sourdough', 'slow'],
    madeIt: 48,
    saves: 320,
    rating: 4.7,
    intro:
      'I make this every other Saturday. Mix the night before, fridge overnight, bake in the morning. The hands-on time is maybe fifteen minutes, spread across two days.',
    ingredients: [
      {
        section: null,
        items: [
          { q: '500g', i: 'strong white flour' },
          { q: '400g', i: 'water, cool' },
          { q: '100g', i: 'active sourdough starter' },
          { q: '10g', i: 'fine salt' },
          { q: '4 tbsp', i: 'good olive oil, divided' },
          { q: 'flaky salt + rosemary', i: 'to finish' },
        ],
      },
    ],
    steps: [
      { t: 'Evening: mix', d: 'Whisk flour, water, starter, salt in a bowl. It will look shaggy. Cover, rest 30 min.' },
      { t: 'Fold', d: 'Wet hands. Four stretch-and-folds, 30 min apart. Then fridge overnight.' },
      { t: 'Morning: pan', d: 'Oil a 9x13 tray generously. Tip dough in. Let it relax, 2 hours at room temp.' },
      { t: 'Dimple', d: 'Oiled fingers. Press down firmly, making deep dimples across the surface.' },
      { t: 'Bake', d: 'Scatter rosemary + flaky salt. Bake at 230C/450F for 22–25 minutes until deeply golden.', timer: 23 },
    ],
    notes: [{ by: 'You', text: 'Works with 100% whole wheat if you up the water to 440g.' }],
    comments: [{ by: 'rensmallkitchen', text: 'Made three in a row. Now obsessed.', likes: 4 }],
  },
  {
    id: 'preserved-lemons',
    title: 'Preserved Lemons, Slowly',
    subtitle: 'One jar, one month, endless meals.',
    author: 'sambeau',
    seed: 2,
    time: '30 days',
    serves: 1,
    difficulty: 'Easy',
    tags: ['preserves', 'pantry'],
    madeIt: 19,
    saves: 410,
    rating: 4.6,
    intro: '',
    ingredients: [],
    steps: [],
    notes: [],
    comments: [],
  },
  {
    id: 'lentil-soup',
    title: 'Red Lentil + Coconut Soup',
    subtitle: 'The one you want when it rains.',
    author: 'dev.iyer',
    seed: 7,
    time: '35 min',
    serves: 4,
    difficulty: 'Easy',
    tags: ['soup', 'vegan', 'weeknight'],
    madeIt: 208,
    saves: 1580,
    rating: 4.8,
    intro: '',
    ingredients: [],
    steps: [],
    notes: [],
    comments: [],
  },
  {
    id: 'tarte-tatin',
    title: 'Upside-Down Plum Tatin',
    subtitle: 'Caramel, pastry, patience.',
    author: 'coral',
    seed: 3,
    time: '1 hr',
    serves: 6,
    difficulty: 'Medium',
    tags: ['dessert', 'french'],
    madeIt: 64,
    saves: 980,
    rating: 4.7,
    intro: '',
    ingredients: [],
    steps: [],
    notes: [],
    comments: [],
  },
  {
    id: 'greens',
    title: 'Braised Greens with Garlic and Chili',
    subtitle: '15 minutes. Any green in the fridge.',
    author: 'luminous',
    seed: 1,
    time: '15 min',
    serves: 2,
    difficulty: 'Easy',
    tags: ['side', 'weeknight', 'vegan'],
    madeIt: 92,
    saves: 640,
    rating: 4.5,
    intro: '',
    ingredients: [],
    steps: [],
    notes: [],
    comments: [],
  },
];

export const recipeById = (id: string): Recipe => {
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) throw new Error(`No recipe with id "${id}"`);
  return recipe;
};

export const FEED: FeedActivity[] = [
  { kind: 'new', who: 'rensmallkitchen', recipe: 'brown-butter-miso', when: '2h', caption: 'Tested this 9 times this week. Finally happy with it.' },
  { kind: 'madeit', who: 'mayacooks', recipe: 'brown-butter-miso', when: '4h', caption: 'Soft egg + chili crisp on top. Don’t @ me.' },
  { kind: 'new', who: 'dev.iyer', recipe: 'lentil-soup', when: '6h', caption: '' },
  { kind: 'saved', who: 'coral', recipe: 'sourdough-focaccia', when: '1d', caption: '' },
  { kind: 'madeit', who: 'luminous', recipe: 'jollof', when: '1d', caption: 'Party jollof method for the win.' },
  { kind: 'new', who: 'coral', recipe: 'tarte-tatin', when: '2d', caption: '' },
];

export const SHELVES: Shelf[] = [
  { id: 'weeknight', title: 'Weeknight', subtitle: '30 minutes or less', count: 12, recipes: ['brown-butter-miso', 'greens', 'lentil-soup'] },
  { id: 'sunday', title: 'Sunday Projects', subtitle: 'When I have time', count: 6, recipes: ['sourdough-focaccia', 'jollof', 'tarte-tatin'] },
  { id: 'bakery', title: 'Home Bakery', subtitle: 'Breads, pastries, all the flour', count: 9, recipes: ['sourdough-focaccia', 'tarte-tatin'] },
  { id: 'pantry', title: 'Pantry + Preserves', subtitle: 'Keeps for weeks', count: 4, recipes: ['preserved-lemons'] },
];
