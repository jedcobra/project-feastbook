// Content model types — mirrors design_handoff_special_spoon/README.md
// "Core Concept & User Model" and prototype/ss-data.jsx.

export interface Person {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl?: string;
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
  photoUrl?: string;
}

export interface RecipeNote {
  by: string;
  text: string;
}

export interface RecipeComment {
  id: string;
  authorId: string;
  handle: string;
  at: string;
  text: string;
  likes: number;
  likedByMe: boolean;
  cooked: boolean;
  isQuestion: boolean;
  photoUrl?: string;
  edited: boolean;
  replies: RecipeComment[];
}

export type NotificationKind = 'note' | 'reply' | 'follow' | 'cooked' | 'digest' | 'message' | 'kiss' | 'photo_comment';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  actorHandle: string | null;
  recipeId: string | null;
  recipeTitle: string | null;
  conversationId: string | null;
  cookPhotoId: string | null;
  excerpt: string | null;
  createdAt: string;
  read: boolean;
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
  ratingCount: number;
  coverPhotoUrl?: string;
  intro: string;
  visibility: Visibility;
  ingredients: IngredientSection[];
  steps: RecipeStep[];
  notes: RecipeNote[];
  comments: RecipeComment[];
}

// A recipe in the profile's "Cooked" tab — same shape as Recipe, plus when
// *this* viewer last marked it cooked (made_it is one row per user+recipe,
// so this is always the most recent cook, not just the first).
// A photo of someone's own version of a dish — the profile's "Cooked" grid.
export interface CookPhoto {
  id: string;
  userId: string;
  handle: string;
  recipeId: string;
  recipeTitle: string;
  photoUrl: string;
  at: string;
  kisses: number;
  kissedByMe: boolean;
}

export interface CookPhotoComment {
  id: string;
  authorId: string;
  handle: string;
  text: string;
  at: string;
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

export interface SharedRecipeRef {
  id: string;
  title: string;
  coverPhotoUrl?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  photoUrl?: string;
  sharedRecipe?: SharedRecipeRef;
  createdAt: string;
  read: boolean;
}

export interface ConversationSummary {
  id: string;
  person: Person;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}
