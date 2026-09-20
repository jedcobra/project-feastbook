// Content model types — mirrors design_handoff_special_spoon/README.md
// "Core Concept & User Model" and prototype/ss-data.jsx.

export interface Person {
  id: string;
  name: string;
  handle: string;
  bio: string;
  recipes: number;
  followers: number;
  following: number;
  seed: number;
}

export interface IngredientItem {
  q: string;
  i: string;
}

export interface IngredientSection {
  section: string | null;
  items: IngredientItem[];
}

export interface RecipeStep {
  t: string;
  d: string;
  timer?: number; // minutes
}

export interface RecipeNote {
  by: string;
  text: string;
}

export interface RecipeComment {
  by: string;
  text: string;
  likes: number;
  replies?: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Visibility = 'public' | 'followers' | 'private';

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  author: string; // handle
  seed: number;
  time: string;
  serves: number;
  difficulty: Difficulty;
  tags: string[];
  madeIt: number;
  saves: number;
  rating: number;
  intro: string;
  visibility: Visibility;
  ingredients: IngredientSection[];
  steps: RecipeStep[];
  notes: RecipeNote[];
  comments: RecipeComment[];
}

export type ActivityKind = 'new' | 'madeit' | 'saved';

export interface FeedActivity {
  kind: ActivityKind;
  who: string; // handle
  recipe: string; // recipe id
  when: string;
  caption: string;
}

export interface ShelfRecipeRef {
  id: string;
  title: string;
}

export type ShelfVisibility = 'private' | 'followers' | 'link';

export interface Shelf {
  id: string;
  title: string;
  subtitle: string;
  visibility: ShelfVisibility;
  count: number;
  recipes: ShelfRecipeRef[];
}
