// Hand-written row types matching supabase/migrations/0001_init.sql.

export interface ProfileRow {
  id: string;
  user_id: string | null;
  name: string;
  handle: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
}

export interface ProfileStatsRow {
  id: string;
  recipe_count: number;
  follower_count: number;
  following_count: number;
}

export type DifficultyRow = 'Easy' | 'Medium' | 'Hard';

export interface RecipeRow {
  id: string;
  author_id: string;
  title: string;
  subtitle: string;
  intro: string;
  time: string;
  serves: number;
  difficulty: DifficultyRow;
  tags: string[];
  rating: number | null;
  created_at: string;
}

export interface RecipeIngredientSectionRow {
  id: string;
  recipe_id: string;
  label: string | null;
  position: number;
}

export interface RecipeIngredientRow {
  id: string;
  section_id: string;
  quantity: string;
  name: string;
  position: number;
}

export interface RecipeStepRow {
  id: string;
  recipe_id: string;
  position: number;
  title: string;
  description: string;
  timer_minutes: number | null;
}

export interface RecipeNoteRow {
  id: string;
  recipe_id: string;
  text: string;
  position: number;
}

export interface CommentRow {
  id: string;
  recipe_id: string;
  author_id: string;
  text: string;
  likes: number;
  created_at: string;
}

export interface FollowRow {
  follower_id: string;
  followee_id: string;
  created_at: string;
}

export interface SaveRow {
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface MadeItRow {
  id: string;
  user_id: string;
  recipe_id: string;
  caption: string;
  photo_url: string | null;
  created_at: string;
}

export interface ShelfRow {
  id: string;
  owner_id: string;
  title: string;
  subtitle: string;
  created_at: string;
}

export interface ShelfStatsRow {
  id: string;
  recipe_count: number;
}

export interface ShelfRecipeRow {
  shelf_id: string;
  recipe_id: string;
  position: number;
}

export interface FeedActivityRow {
  kind: 'new' | 'madeit' | 'saved';
  who_id: string;
  recipe_id: string;
  happened_at: string;
  caption: string | null;
}
