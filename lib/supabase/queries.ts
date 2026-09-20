import { formatRelativeTime } from '@/lib/format';
import type { RecipeDraft } from '@/lib/recipe-draft';
import { supabase } from '@/lib/supabase/client';
import type {
  AppNotification,
  FeedActivity,
  NotificationKind,
  Person,
  Recipe,
  RecipeComment,
  Shelf,
  ShelfVisibility,
  Visibility,
} from '@/lib/types';

// The client isn't given a generated Database type, so supabase-js can't
// always tell a to-one embed from a to-many one and defaults to arrays.
// This normalizes either shape.
function unwrapOne<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

interface ProfileStats {
  recipe_count: number;
  follower_count: number;
  following_count: number;
}

interface ProfileRow {
  id: string;
  name: string;
  handle: string;
  bio: string;
}

function mapPerson(row: ProfileRow, stats?: ProfileStats): Person {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    bio: row.bio,
    recipes: stats?.recipe_count ?? 0,
    followers: stats?.follower_count ?? 0,
    following: stats?.following_count ?? 0,
    seed: 0,
  };
}

async function fetchProfileStatsByIds(ids: string[]): Promise<Map<string, ProfileStats>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from('profile_stats').select('*').in('id', ids);
  if (error) console.error('fetchProfileStatsByIds', error);
  return new Map((data ?? []).map((s: ProfileStats & { id: string }) => [s.id, s]));
}

interface RecipeStats {
  made_it_count: number;
  save_count: number;
}

interface RecipeRow {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  time: string;
  serves: number;
  difficulty: Recipe['difficulty'];
  tags: string[];
  rating: number | null;
  author_id: string;
  visibility: Visibility;
}

async function fetchRecipeStatsByIds(ids: string[]): Promise<Map<string, RecipeStats>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from('recipe_stats').select('*').in('id', ids);
  if (error) console.error('fetchRecipeStatsByIds', error);
  return new Map((data ?? []).map((s: RecipeStats & { id: string }) => [s.id, s]));
}

function mapRecipeSummary(row: RecipeRow, authorHandle: string, stats?: RecipeStats): Recipe {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    author: authorHandle,
    seed: 0,
    time: row.time,
    serves: row.serves,
    difficulty: row.difficulty,
    tags: row.tags,
    madeIt: stats?.made_it_count ?? 0,
    saves: stats?.save_count ?? 0,
    rating: row.rating ?? 0,
    intro: row.intro,
    visibility: row.visibility,
    ingredients: [],
    steps: [],
    notes: [],
    comments: [],
  };
}

// Fetches recipe rows + their author handles + their stats, and maps to Recipe[].
async function mapRecipeRows(rows: RecipeRow[]): Promise<Recipe[]> {
  if (rows.length === 0) return [];
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const [{ data: authors }, statsById] = await Promise.all([
    supabase.from('profiles').select('id, handle').in('id', authorIds),
    fetchRecipeStatsByIds(rows.map((r) => r.id)),
  ]);
  const handleById = new Map((authors ?? []).map((a: { id: string; handle: string }) => [a.id, a.handle]));
  return rows.map((r) => mapRecipeSummary(r, handleById.get(r.author_id) ?? '', statsById.get(r.id)));
}

// ─────────────────────────────────────────────────────────────
// Feed
// ─────────────────────────────────────────────────────────────
export async function fetchFeed(limit = 20) {
  const { data: activity, error } = await supabase
    .from('feed_activity')
    .select('*')
    .order('happened_at', { ascending: false })
    .limit(limit);

  if (error || !activity) {
    console.error('fetchFeed', error);
    return [];
  }

  const recipeIds = [...new Set(activity.map((a) => a.recipe_id))];
  const whoIds = [...new Set(activity.map((a) => a.who_id))];

  const [{ data: recipeRows }, { data: peopleRows }] = await Promise.all([
    supabase.from('recipes').select('*').in('id', recipeIds),
    supabase.from('profiles').select('id, name, handle, bio').in('id', whoIds),
  ]);

  const [recipes, peopleStats] = await Promise.all([
    mapRecipeRows((recipeRows ?? []) as RecipeRow[]),
    fetchProfileStatsByIds(whoIds),
  ]);

  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const personById = new Map(
    (peopleRows ?? []).map((p: ProfileRow) => [p.id, mapPerson(p, peopleStats.get(p.id))]),
  );

  return activity
    .map((a): { activity: FeedActivity; recipe: Recipe; author: Person } | null => {
      const recipe = recipeById.get(a.recipe_id);
      const author = personById.get(a.who_id);
      if (!recipe || !author) return null;
      return {
        activity: {
          kind: a.kind,
          who: author.handle,
          recipe: recipe.id,
          when: formatRelativeTime(a.happened_at),
          caption: a.caption ?? '',
        },
        recipe,
        author,
      };
    })
    .filter((x): x is { activity: FeedActivity; recipe: Recipe; author: Person } => x !== null);
}

// ─────────────────────────────────────────────────────────────
// Discover
// ─────────────────────────────────────────────────────────────
export async function fetchDiscoverPeople(excludeProfileId: string | null, limit = 4) {
  // "you" is an unclaimed demo profile seeded as a pre-auth stand-in for the
  // viewer — a leftover from before real signup existed, not a real person
  // to suggest following.
  let query = supabase
    .from('profiles')
    .select('id, name, handle, bio')
    .neq('handle', 'you')
    .order('created_at', { ascending: true })
    .limit(limit + 1);
  if (excludeProfileId) query = query.neq('id', excludeProfileId);

  const { data, error } = await query;
  if (error || !data) {
    console.error('fetchDiscoverPeople', error);
    return [];
  }
  const rows = data.slice(0, limit) as ProfileRow[];
  const stats = await fetchProfileStatsByIds(rows.map((r) => r.id));
  return rows.map((r) => mapPerson(r, stats.get(r.id)));
}

export async function fetchEditorsPicks(limit = 5) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) {
    console.error('fetchEditorsPicks', error);
    return [];
  }
  return mapRecipeRows(data as RecipeRow[]);
}

// ─────────────────────────────────────────────────────────────
// Auth / onboarding
// ─────────────────────────────────────────────────────────────
export async function checkHandleAvailable(handle: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('handle', handle)
    .maybeSingle();
  if (error) {
    console.error('checkHandleAvailable', error);
    return true;
  }
  return !data;
}

// Marks the four-step post-signup onboarding flow as done and persists the
// taste tags picked in step 1 for future Discover-ranking use.
export async function completeOnboarding(profileId: string, tasteTags: string[]) {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarded_at: new Date().toISOString(), taste_tags: tasteTags })
    .eq('id', profileId);
  if (error) console.error('completeOnboarding', error);
}

// ─────────────────────────────────────────────────────────────
// Profile (own + friend)
// ─────────────────────────────────────────────────────────────
export async function fetchProfileByHandle(handle: string) {
  const { data: profileRow, error } = await supabase
    .from('profiles')
    .select('id, name, handle, bio')
    .eq('handle', handle)
    .maybeSingle();

  if (error || !profileRow) {
    if (error) console.error('fetchProfileByHandle', error);
    return null;
  }

  const [stats, { data: recipeRows }, { data: shelfRows }] = await Promise.all([
    fetchProfileStatsByIds([profileRow.id]),
    supabase.from('recipes').select('*').eq('author_id', profileRow.id),
    supabase
      .from('shelves')
      .select('id, title, subtitle, visibility, shelf_recipes(recipe_id, position, recipes(title))')
      .eq('owner_id', profileRow.id),
  ]);

  const person = mapPerson(profileRow, stats.get(profileRow.id));
  const recipes = await mapRecipeRows((recipeRows ?? []) as RecipeRow[]);

  const shelves: Shelf[] = (shelfRows ?? []).map(
    (s: {
      id: string;
      title: string;
      subtitle: string;
      visibility: ShelfVisibility;
      shelf_recipes: { recipe_id: string; position: number; recipes: { title: string } | { title: string }[] | null }[];
    }) => {
      const sorted = [...s.shelf_recipes].sort((a, b) => a.position - b.position);
      return {
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        visibility: s.visibility,
        count: sorted.length,
        recipes: sorted.map((sr) => ({
          id: sr.recipe_id,
          title: unwrapOne(sr.recipes)?.title ?? '',
        })),
      };
    },
  );

  return { person, recipes, shelves };
}

// Recipes a user has bookmarked, most recently saved first — these aren't
// in `fetchProfileByHandle`'s `recipes` (that's what they've authored).
export async function fetchSavedRecipes(userId: string): Promise<Recipe[]> {
  const { data: saveRows, error } = await supabase
    .from('saves')
    .select('recipe_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !saveRows) {
    console.error('fetchSavedRecipes', error);
    return [];
  }

  const { data: recipeRows } = await supabase
    .from('recipes')
    .select('*')
    .in('id', saveRows.map((s) => s.recipe_id));
  const recipeById = new Map((await mapRecipeRows((recipeRows ?? []) as RecipeRow[])).map((r) => [r.id, r]));
  return saveRows.map((s) => recipeById.get(s.recipe_id)).filter((r): r is Recipe => !!r);
}

// ─────────────────────────────────────────────────────────────
// Recipe detail
// ─────────────────────────────────────────────────────────────
// Threads flat comment rows into one level of replies, and folds in real
// per-user like counts from comment_likes (the old `comments.likes` column
// can't be toggled or de-duped per person).
async function mapCommentRows(
  rows: {
    id: string;
    parent_id: string | null;
    text: string;
    cooked: boolean;
    created_at: string;
    author: { id: string; name: string; handle: string } | { id: string; name: string; handle: string }[] | null;
  }[],
  viewerId: string | null,
): Promise<RecipeComment[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const { data: likeRows } = await supabase.from('comment_likes').select('comment_id, user_id').in('comment_id', ids);
  const likeCounts = new Map<string, number>();
  const likedByViewer = new Set<string>();
  for (const l of (likeRows ?? []) as { comment_id: string; user_id: string }[]) {
    likeCounts.set(l.comment_id, (likeCounts.get(l.comment_id) ?? 0) + 1);
    if (viewerId && l.user_id === viewerId) likedByViewer.add(l.comment_id);
  }

  const byId = new Map<string, RecipeComment>();
  for (const r of rows) {
    const a = unwrapOne(r.author) as { id: string; name: string; handle: string } | undefined;
    byId.set(r.id, {
      id: r.id,
      authorId: a?.id ?? '',
      by: a?.name ?? 'Someone',
      handle: a?.handle ?? '',
      at: formatRelativeTime(r.created_at),
      text: r.text,
      likes: likeCounts.get(r.id) ?? 0,
      likedByMe: likedByViewer.has(r.id),
      cooked: r.cooked,
      isQuestion: r.text.trim().endsWith('?'),
      replies: [],
    });
  }

  const roots: RecipeComment[] = [];
  for (const r of rows) {
    const comment = byId.get(r.id)!;
    if (r.parent_id && byId.has(r.parent_id)) {
      byId.get(r.parent_id)!.replies.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}

export async function fetchRecipeFull(id: string, viewerId: string | null = null) {
  const { data: recipeRow, error } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle();

  if (error || !recipeRow) {
    if (error) console.error('fetchRecipeFull', error);
    return null;
  }

  const [{ data: sections }, { data: steps }, { data: notes }, { data: commentRows }, { data: authorRow }, authorStats] =
    await Promise.all([
      supabase
        .from('recipe_ingredient_sections')
        .select('*, recipe_ingredients(*)')
        .eq('recipe_id', id)
        .order('position'),
      supabase.from('recipe_steps').select('*').eq('recipe_id', id).order('position'),
      supabase.from('recipe_notes').select('*').eq('recipe_id', id).order('position'),
      supabase
        .from('comments')
        .select('id, parent_id, text, cooked, created_at, author:profiles(id, name, handle)')
        .eq('recipe_id', id)
        .order('created_at'),
      supabase.from('profiles').select('id, name, handle, bio').eq('id', recipeRow.author_id).maybeSingle(),
      fetchProfileStatsByIds([recipeRow.author_id]),
    ]);

  const author = mapPerson(
    (authorRow as ProfileRow | null) ?? { id: recipeRow.author_id, name: '', handle: '', bio: '' },
    authorStats.get(recipeRow.author_id),
  );
  const recipe = mapRecipeSummary(recipeRow as RecipeRow, author.handle, (await fetchRecipeStatsByIds([id])).get(id));

  recipe.ingredients = (sections ?? []).map(
    (s: { label: string | null; recipe_ingredients: { quantity: string; name: string; position: number }[] }) => ({
      section: s.label,
      items: [...s.recipe_ingredients]
        .sort((a, b) => a.position - b.position)
        .map((i) => ({ q: i.quantity, i: i.name })),
    }),
  );
  recipe.steps = (steps ?? []).map((s: { title: string; description: string; timer_minutes: number | null }) => ({
    t: s.title,
    d: s.description,
    timer: s.timer_minutes ?? undefined,
  }));
  recipe.notes = (notes ?? []).map((n: { text: string }) => ({ by: '', text: n.text }));
  recipe.comments = await mapCommentRows(
    (commentRows ?? []) as Parameters<typeof mapCommentRows>[0],
    viewerId,
  );

  return { recipe, author };
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────
export async function isFollowing(followerId: string, followeeId: string) {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .maybeSingle();
  return !!data;
}

// Writes a notification for someone else's inbox. Never for your own —
// nobody needs to be told about their own action.
async function notify(
  recipientId: string,
  actorId: string,
  kind: NotificationKind,
  extra: { recipeId?: string; commentId?: string; excerpt?: string } = {},
) {
  if (recipientId === actorId) return;
  const { error } = await supabase.from('notifications').insert({
    recipient_id: recipientId,
    actor_id: actorId,
    kind,
    recipe_id: extra.recipeId ?? null,
    comment_id: extra.commentId ?? null,
    excerpt: extra.excerpt ?? null,
  });
  if (error) console.error('notify', error);
}

export async function setFollowing(followerId: string, followeeId: string, follow: boolean) {
  if (follow) {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, followee_id: followeeId });
    if (error) console.error('setFollowing insert', error);
    else await notify(followeeId, followerId, 'follow');
  } else {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('followee_id', followeeId);
    if (error) console.error('setFollowing delete', error);
  }
}

export async function isSaved(userId: string, recipeId: string) {
  const { data } = await supabase
    .from('saves')
    .select('user_id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  return !!data;
}

export async function setSaved(userId: string, recipeId: string, saved: boolean) {
  if (saved) {
    const { error } = await supabase.from('saves').insert({ user_id: userId, recipe_id: recipeId });
    if (error) console.error('setSaved insert', error);
  } else {
    const { error } = await supabase.from('saves').delete().eq('user_id', userId).eq('recipe_id', recipeId);
    if (error) console.error('setSaved delete', error);
  }
}

// Posts a note or a reply (when parentId is given), optionally marked as
// "I cooked it" — which also records a made_it row the first time (so
// recipe_stats.made_it_count and the feed's "cooked" activity, previously
// unwritten, finally get real data) — and notifies whoever should hear
// about it: the recipe's author for a fresh top-level note or a cook mark,
// or the parent note's author for a reply. Nobody is notified about their
// own action.
export async function postComment(
  authorId: string,
  recipeId: string,
  text: string,
  opts: { parentId?: string; cooked?: boolean; recipeAuthorId?: string } = {},
): Promise<RecipeComment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      author_id: authorId,
      recipe_id: recipeId,
      text,
      parent_id: opts.parentId ?? null,
      cooked: !!opts.cooked,
    })
    .select('*, author:profiles(id, name, handle)')
    .single();
  if (error || !data) {
    console.error('postComment', error);
    return null;
  }
  const author = unwrapOne(data.author) as { id: string; name: string; handle: string } | undefined;

  if (opts.parentId) {
    const { data: parent } = await supabase.from('comments').select('author_id').eq('id', opts.parentId).maybeSingle();
    if (parent) await notify(parent.author_id, authorId, 'reply', { recipeId, commentId: data.id, excerpt: text });
  } else if (opts.recipeAuthorId) {
    await notify(opts.recipeAuthorId, authorId, 'note', { recipeId, commentId: data.id, excerpt: text });
  }

  if (opts.cooked) {
    const { data: existingMadeIt } = await supabase
      .from('made_it')
      .select('id')
      .eq('user_id', authorId)
      .eq('recipe_id', recipeId)
      .maybeSingle();
    if (!existingMadeIt) {
      const { error: madeItError } = await supabase.from('made_it').insert({ user_id: authorId, recipe_id: recipeId });
      if (madeItError) console.error('postComment: made_it insert', madeItError);
    }
    if (opts.recipeAuthorId) await notify(opts.recipeAuthorId, authorId, 'cooked', { recipeId });
  }

  return {
    id: data.id,
    authorId,
    by: author?.name ?? 'Someone',
    handle: author?.handle ?? '',
    at: formatRelativeTime(data.created_at),
    text: data.text,
    likes: 0,
    likedByMe: false,
    cooked: data.cooked,
    isQuestion: text.trim().endsWith('?'),
    replies: [],
  };
}

export async function toggleCommentLike(commentId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
    if (error) console.error('toggleCommentLike insert', error);
  } else {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    if (error) console.error('toggleCommentLike delete', error);
  }
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) console.error('deleteComment', error);
}

export async function createShelf(
  ownerId: string,
  title: string,
  subtitle = '',
  visibility: ShelfVisibility = 'private',
) {
  const { data, error } = await supabase
    .from('shelves')
    .insert({ owner_id: ownerId, title, subtitle, visibility })
    .select('id, title')
    .single();
  if (error || !data) {
    console.error('createShelf', error);
    return null;
  }
  return { id: data.id as string, title: data.title as string };
}

// Just the current user's own shelves — the add-to-shelf sheet's list and
// the Cookbook's Shelves tab both need this without the rest of the
// profile bundle fetchProfileByHandle pulls in.
export async function fetchShelvesForOwner(ownerId: string): Promise<Shelf[]> {
  const { data, error } = await supabase
    .from('shelves')
    .select('id, title, subtitle, visibility, shelf_recipes(recipe_id)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true });
  if (error || !data) {
    console.error('fetchShelvesForOwner', error);
    return [];
  }
  return data.map(
    (s: { id: string; title: string; subtitle: string; visibility: ShelfVisibility; shelf_recipes: unknown[] }) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      visibility: s.visibility,
      count: s.shelf_recipes.length,
      recipes: [],
    }),
  );
}

// Replaces which of the user's own shelves a recipe sits on in one go, and
// keeps the plain `saves` signal (recipe_stats, feed activity, the Saved
// tab) in sync with it — filed on any shelf counts as saved, filed on none
// doesn't. This is what the bookmark button opens now instead of a silent
// toggle.
export async function setRecipeShelves(userId: string, recipeId: string, shelfIds: string[]) {
  // RLS scopes this delete to shelves the caller owns, so it can't touch
  // other people's placements of the same recipe.
  const { error: deleteError } = await supabase.from('shelf_recipes').delete().eq('recipe_id', recipeId);
  if (deleteError) console.error('setRecipeShelves: delete', deleteError);

  if (shelfIds.length > 0) {
    const { error: insertError } = await supabase
      .from('shelf_recipes')
      .insert(shelfIds.map((shelf_id) => ({ shelf_id, recipe_id: recipeId })));
    if (insertError) console.error('setRecipeShelves: insert', insertError);
  }

  await setSaved(userId, recipeId, shelfIds.length > 0);
}

export interface ShelfDetail {
  id: string;
  title: string;
  subtitle: string;
  visibility: ShelfVisibility;
  ownerId: string;
  recipes: Recipe[];
}

export async function fetchShelfDetail(shelfId: string): Promise<ShelfDetail | null> {
  const { data: shelfRow, error } = await supabase
    .from('shelves')
    .select('id, title, subtitle, visibility, owner_id')
    .eq('id', shelfId)
    .maybeSingle();
  if (error || !shelfRow) {
    if (error) console.error('fetchShelfDetail', error);
    return null;
  }

  const { data: shelfRecipeRows } = await supabase
    .from('shelf_recipes')
    .select('recipe_id, created_at')
    .eq('shelf_id', shelfId)
    .order('created_at', { ascending: false });

  const { data: recipeRows } = await supabase
    .from('recipes')
    .select('*')
    .in('id', (shelfRecipeRows ?? []).map((r: { recipe_id: string }) => r.recipe_id));
  const recipeById = new Map((await mapRecipeRows((recipeRows ?? []) as RecipeRow[])).map((r) => [r.id, r]));
  const recipes = (shelfRecipeRows ?? [])
    .map((r: { recipe_id: string }) => recipeById.get(r.recipe_id))
    .filter((r): r is Recipe => !!r);

  return {
    id: shelfRow.id,
    title: shelfRow.title,
    subtitle: shelfRow.subtitle,
    visibility: shelfRow.visibility,
    ownerId: shelfRow.owner_id,
    recipes,
  };
}

export async function removeRecipeFromShelf(shelfId: string, recipeId: string) {
  const { error } = await supabase.from('shelf_recipes').delete().eq('shelf_id', shelfId).eq('recipe_id', recipeId);
  if (error) console.error('removeRecipeFromShelf', error);
}

function recipeFields(draft: RecipeDraft, visibility: Visibility) {
  return {
    title: draft.title.trim() || 'Untitled recipe',
    subtitle: draft.subtitle.trim(),
    intro: draft.intro.trim(),
    time: draft.time.trim(),
    serves: parseInt(draft.serves, 10) || 1,
    difficulty: draft.level,
    tags: draft.tags,
    visibility,
  };
}

// Writes a draft's ingredient sections/items, steps, and notes for a recipe
// row that already exists. Skips blank rows (an empty ingredient line, a
// stepless step) rather than saving placeholder junk. Shelf membership is
// handled separately by linkShelves — a revision restore touches content
// only and must leave shelves untouched.
async function insertRecipeContent(recipeId: string, draft: Pick<RecipeDraft, 'sections' | 'steps' | 'notes'>) {
  for (const [position, section] of draft.sections.entries()) {
    const items = section.items.filter((it) => it.i.trim());
    if (items.length === 0) continue;

    const { data: sectionRow, error: sectionError } = await supabase
      .from('recipe_ingredient_sections')
      .insert({ recipe_id: recipeId, label: section.section.trim() || null, position })
      .select('id')
      .single();
    if (sectionError || !sectionRow) {
      console.error('insertRecipeContents: section insert', sectionError);
      continue;
    }

    const { error: itemsError } = await supabase.from('recipe_ingredients').insert(
      items.map((it, i) => ({
        section_id: sectionRow.id,
        quantity: it.q.trim(),
        name: it.i.trim(),
        position: i,
      })),
    );
    if (itemsError) console.error('insertRecipeContents: ingredients insert', itemsError);
  }

  const steps = draft.steps.filter((s) => s.t.trim());
  if (steps.length > 0) {
    const { error: stepsError } = await supabase.from('recipe_steps').insert(
      steps.map((s, i) => ({
        recipe_id: recipeId,
        position: i,
        title: s.t.trim(),
        description: s.d.trim(),
        timer_minutes: s.timer.trim() ? parseInt(s.timer, 10) || null : null,
      })),
    );
    if (stepsError) console.error('insertRecipeContents: steps insert', stepsError);
  }

  const notes = draft.notes
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);
  if (notes.length > 0) {
    const { error: notesError } = await supabase
      .from('recipe_notes')
      .insert(notes.map((text, position) => ({ recipe_id: recipeId, text, position })));
    if (notesError) console.error('insertRecipeContent: notes insert', notesError);
  }
}

async function linkShelves(recipeId: string, shelfIds: string[]) {
  if (shelfIds.length === 0) return;
  const { error } = await supabase
    .from('shelf_recipes')
    .insert(shelfIds.map((shelf_id) => ({ shelf_id, recipe_id: recipeId })));
  if (error) console.error('linkShelves', error);
}

// Writes a composer draft as a brand-new recipe. Returns the new recipe id,
// or null on failure.
export async function publishRecipe(
  authorId: string,
  draft: RecipeDraft,
  visibility: Visibility,
  shelfIds: string[],
) {
  const { data: recipeRow, error: recipeError } = await supabase
    .from('recipes')
    .insert({ author_id: authorId, ...recipeFields(draft, visibility) })
    .select('id')
    .single();

  if (recipeError || !recipeRow) {
    console.error('publishRecipe: recipes insert', recipeError);
    return null;
  }
  const recipeId = recipeRow.id as string;
  await insertRecipeContent(recipeId, draft);
  await linkShelves(recipeId, shelfIds);
  return recipeId;
}

// The editorial content of a recipe, snapshotted into recipe_revisions on
// every edit — deliberately excludes visibility and shelf membership,
// which aren't "content" in the revision-history sense (see MERGE.md:
// ownership/privacy is a separate row from revisions in the owner sheet).
interface RevisionSnapshot {
  title: string;
  subtitle: string;
  intro: string;
  time: string;
  serves: number;
  difficulty: Recipe['difficulty'];
  tags: string[];
  ingredients: Recipe['ingredients'];
  steps: Recipe['steps'];
  notes: Recipe['notes'];
}

async function saveRevisionSnapshot(recipeId: string) {
  const data = await fetchRecipeFull(recipeId);
  if (!data) return;
  const { recipe } = data;
  const snapshot: RevisionSnapshot = {
    title: recipe.title,
    subtitle: recipe.subtitle,
    intro: recipe.intro,
    time: recipe.time,
    serves: recipe.serves,
    difficulty: recipe.difficulty,
    tags: recipe.tags,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    notes: recipe.notes,
  };
  const { error } = await supabase.from('recipe_revisions').insert({ recipe_id: recipeId, snapshot });
  if (error) console.error('saveRevisionSnapshot', error);
}

function draftFromSnapshot(snapshot: RevisionSnapshot): Pick<RecipeDraft, 'sections' | 'steps' | 'notes'> {
  return {
    sections: snapshot.ingredients.map((s) => ({ section: s.section ?? '', items: s.items })),
    steps: snapshot.steps.map((s) => ({ t: s.t, d: s.d, timer: s.timer != null ? String(s.timer) : '' })),
    notes: snapshot.notes.map((n) => n.text).join('\n'),
  };
}

// Overwrites an existing recipe with a draft's edited content (7i). Snapshots
// the pre-edit state into recipe_revisions first — "every save writes a
// version row" — then replaces ingredient sections/steps/notes/shelf links
// wholesale rather than diffing them, the simplest correct approach for a
// form that edits everything at once.
export async function updateRecipe(recipeId: string, draft: RecipeDraft, visibility: Visibility, shelfIds: string[]) {
  await saveRevisionSnapshot(recipeId);

  const { error: recipeError } = await supabase.from('recipes').update(recipeFields(draft, visibility)).eq('id', recipeId);
  if (recipeError) {
    console.error('updateRecipe: recipes update', recipeError);
    return null;
  }

  const [{ error: sectionsError }, { error: stepsError }, { error: notesError }, { error: shelfError }] =
    await Promise.all([
      supabase.from('recipe_ingredient_sections').delete().eq('recipe_id', recipeId),
      supabase.from('recipe_steps').delete().eq('recipe_id', recipeId),
      supabase.from('recipe_notes').delete().eq('recipe_id', recipeId),
      supabase.from('shelf_recipes').delete().eq('recipe_id', recipeId),
    ]);
  if (sectionsError) console.error('updateRecipe: sections delete', sectionsError);
  if (stepsError) console.error('updateRecipe: steps delete', stepsError);
  if (notesError) console.error('updateRecipe: notes delete', notesError);
  if (shelfError) console.error('updateRecipe: shelf_recipes delete', shelfError);

  await insertRecipeContent(recipeId, draft);
  await linkShelves(recipeId, shelfIds);
  return recipeId;
}

// Just the visibility column — the owner sheet's "change who can see it"
// row doesn't need the full edit flow, and doesn't touch revision history.
export async function updateRecipeVisibility(recipeId: string, visibility: Visibility): Promise<boolean> {
  const { error } = await supabase.from('recipes').update({ visibility }).eq('id', recipeId);
  if (error) {
    console.error('updateRecipeVisibility', error);
    return false;
  }
  return true;
}

export interface RevisionEntry {
  id: string;
  createdAt: string;
  snapshot: RevisionSnapshot;
}

// Oldest-last (most recent edit first) — the "current" live document is
// always the newest state and isn't itself a row here.
export async function fetchRevisions(recipeId: string): Promise<RevisionEntry[]> {
  const { data, error } = await supabase
    .from('recipe_revisions')
    .select('id, created_at, snapshot')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });
  if (error || !data) {
    console.error('fetchRevisions', error);
    return [];
  }
  return data.map((r: { id: string; created_at: string; snapshot: RevisionSnapshot }) => ({
    id: r.id,
    createdAt: r.created_at,
    snapshot: r.snapshot,
  }));
}

// Restores a past revision's content. Snapshots the current state first —
// same "every save keeps the version before it" guarantee, so restoring is
// itself undoable — and leaves visibility and shelf membership alone.
export async function restoreRevision(recipeId: string, revisionId: string): Promise<boolean> {
  const { data: revRow, error: revError } = await supabase
    .from('recipe_revisions')
    .select('snapshot')
    .eq('id', revisionId)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  if (revError || !revRow) {
    console.error('restoreRevision: fetch', revError);
    return false;
  }
  const snapshot = revRow.snapshot as RevisionSnapshot;

  await saveRevisionSnapshot(recipeId);

  const { error: recipeError } = await supabase
    .from('recipes')
    .update({
      title: snapshot.title,
      subtitle: snapshot.subtitle,
      intro: snapshot.intro,
      time: snapshot.time,
      serves: snapshot.serves,
      difficulty: snapshot.difficulty,
      tags: snapshot.tags,
    })
    .eq('id', recipeId);
  if (recipeError) {
    console.error('restoreRevision: recipes update', recipeError);
    return false;
  }

  await Promise.all([
    supabase.from('recipe_ingredient_sections').delete().eq('recipe_id', recipeId),
    supabase.from('recipe_steps').delete().eq('recipe_id', recipeId),
    supabase.from('recipe_notes').delete().eq('recipe_id', recipeId),
  ]);
  await insertRecipeContent(recipeId, draftFromSnapshot(snapshot));
  return true;
}

// Consequence counts for the owner sheet's delete confirmation copy.
export async function fetchRecipeDeleteImpact(recipeId: string): Promise<{ comments: number; saves: number }> {
  const [{ count: comments }, { count: saves }] = await Promise.all([
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('recipe_id', recipeId),
    supabase.from('saves').select('*', { count: 'exact', head: true }).eq('recipe_id', recipeId),
  ]);
  return { comments: comments ?? 0, saves: saves ?? 0 };
}

// Deletes a recipe outright. Every child row (ingredients, steps, notes,
// comments, saves, made_it entries, shelf links) cascades via its FK, so
// this is the only statement needed. Returns whether it succeeded.
export async function deleteRecipe(recipeId: string): Promise<boolean> {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
  if (error) {
    console.error('deleteRecipe', error);
    return false;
  }
  return true;
}

// Which of the author's shelves a recipe currently sits on, for pre-checking
// the "Add to shelves" list when editing (7i).
export async function fetchShelfIdsForRecipe(recipeId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('shelf_recipes').select('shelf_id').eq('recipe_id', recipeId);
  if (error) {
    console.error('fetchShelfIdsForRecipe', error);
    return new Set();
  }
  return new Set((data ?? []).map((r: { shelf_id: string }) => r.shelf_id));
}

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────
export async function fetchNotifications(recipientId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, kind, excerpt, created_at, read_at, actor:profiles(name, handle), recipe:recipes(id, title)')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) {
    console.error('fetchNotifications', error);
    return [];
  }
  return data.map(
    (n: {
      id: string;
      kind: AppNotification['kind'];
      excerpt: string | null;
      created_at: string;
      read_at: string | null;
      actor: { name: string; handle: string } | { name: string; handle: string }[] | null;
      recipe: { id: string; title: string } | { id: string; title: string }[] | null;
    }) => {
      const actor = unwrapOne(n.actor);
      const recipe = unwrapOne(n.recipe);
      return {
        id: n.id,
        kind: n.kind,
        actorName: actor?.name ?? null,
        actorHandle: actor?.handle ?? null,
        recipeId: recipe?.id ?? null,
        recipeTitle: recipe?.title ?? null,
        excerpt: n.excerpt,
        createdAt: n.created_at,
        read: !!n.read_at,
      };
    },
  );
}

export async function countUnreadNotifications(recipientId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .is('read_at', null);
  if (error) {
    console.error('countUnreadNotifications', error);
    return 0;
  }
  return count ?? 0;
}

export async function markAllNotificationsRead(recipientId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', recipientId)
    .is('read_at', null);
  if (error) console.error('markAllNotificationsRead', error);
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('markNotificationRead', error);
}
