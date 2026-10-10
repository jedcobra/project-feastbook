import { formatRelativeTime, MAX_SERVINGS } from '@/lib/format';
import type { RecipeDraft } from '@/lib/recipe-draft';
import { supabase } from '@/lib/supabase/client';
import type { NotificationPrefs } from '@/lib/supabase/types';
import type {
  AppNotification,
  ConversationSummary,
  CookPhoto,
  CookPhotoComment,
  DirectMessage,
  FeedActivity,
  FeedItem,
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
  avatar_url: string | null;
}

function mapPerson(row: ProfileRow, stats?: ProfileStats): Person {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    bio: row.bio,
    avatarUrl: row.avatar_url ?? undefined,
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
  rating_avg: number | null;
  rating_count: number;
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
  cover_photo_url: string | null;
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
    rating: stats?.rating_avg ?? 0,
    ratingCount: stats?.rating_count ?? 0,
    coverPhotoUrl: row.cover_photo_url ?? undefined,
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
// Returns null on a real fetch failure — distinct from an empty array,
// which means the query succeeded and there's genuinely nothing yet. The
// two need different copy (an honest error vs. "no activity yet").
// One page of the feed, newest first: recipe activity (added / cooked /
// saved) merged with cooked-dish photos. Pass the previous page's
// `nextCursor` as `before` to load older posts; it's null once there's
// nothing older.
export async function fetchFeedPage(
  viewerId: string | null,
  before: string | null = null,
  limit = 15,
): Promise<{ items: FeedItem[]; nextCursor: string | null } | null> {
  let activityQuery = supabase
    .from('feed_activity')
    .select('*')
    .order('happened_at', { ascending: false })
    .limit(limit);
  let photoQuery = supabase
    .from('cook_photos')
    .select(COOK_PHOTO_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (before) {
    activityQuery = activityQuery.lt('happened_at', before);
    photoQuery = photoQuery.lt('created_at', before);
  }
  const [{ data: activity, error }, { data: photoRows, error: photoError }] = await Promise.all([
    activityQuery,
    photoQuery,
  ]);
  if (error || !activity) {
    console.error('fetchFeedPage', error);
    return null;
  }
  if (photoError) console.error('fetchFeedPage photos', photoError);

  // Merge both sources by time and keep the newest `limit`; the cursor is
  // the oldest kept timestamp, so the next page picks up strictly before it.
  type Raw =
    | { type: 'activity'; at: string; row: (typeof activity)[number] }
    | { type: 'photo'; at: string; row: CookPhotoRow };
  const merged: Raw[] = [
    ...activity.map((row): Raw => ({ type: 'activity', at: row.happened_at, row })),
    ...((photoRows ?? []) as CookPhotoRow[]).map((row): Raw => ({ type: 'photo', at: row.created_at, row })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, limit);
  const fetchedEnough = activity.length >= limit || (photoRows?.length ?? 0) >= limit;
  const nextCursor = merged.length > 0 && fetchedEnough ? merged[merged.length - 1].at : null;

  const activityRows = merged.flatMap((m) => (m.type === 'activity' ? [m.row] : []));
  const recipeIds = [...new Set(activityRows.map((a) => a.recipe_id))];
  const whoIds = [...new Set(activityRows.map((a) => a.who_id))];
  const [{ data: recipeRows }, { data: peopleRows }, peopleStats, photos] = await Promise.all([
    recipeIds.length ? supabase.from('recipes').select('*').in('id', recipeIds) : Promise.resolve({ data: [] }),
    whoIds.length
      ? supabase.from('profiles').select('id, name, handle, bio, avatar_url').in('id', whoIds)
      : Promise.resolve({ data: [] }),
    fetchProfileStatsByIds(whoIds),
    mapCookPhotoRows(
      merged.flatMap((m) => (m.type === 'photo' ? [m.row] : [])),
      viewerId,
    ),
  ]);
  const recipes = await mapRecipeRows((recipeRows ?? []) as RecipeRow[]);
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const personById = new Map(
    ((peopleRows ?? []) as ProfileRow[]).map((p) => [p.id, mapPerson(p, peopleStats.get(p.id))]),
  );
  const photoById = new Map(photos.map((p) => [p.id, p]));
  // A cook who posted a photo already shows up as that photo; their plain
  // "cooked" row for the same recipe would just repeat it.
  const photographed = new Set(photos.map((p) => `${p.userId}:${p.recipeId}`));

  const items = merged.flatMap((m): FeedItem[] => {
    if (m.type === 'photo') {
      const photo = photoById.get(m.row.id);
      return photo ? [{ type: 'photo', key: `photo:${photo.id}`, photo }] : [];
    }
    const a = m.row;
    const recipe = recipeById.get(a.recipe_id);
    const author = personById.get(a.who_id);
    if (!recipe || !author) return [];
    // "X saved their own recipe" isn't activity worth seeing — saving
    // your own recipe to a shelf is a filing action, not a cook finding it.
    if (a.kind === 'saved' && recipe.author === author.handle) return [];
    if (a.kind === 'madeit' && photographed.has(`${a.who_id}:${a.recipe_id}`)) return [];
    return [
      {
        type: 'activity',
        key: `${a.kind}:${a.who_id}:${a.recipe_id}:${a.happened_at}`,
        activity: {
          kind: a.kind,
          who: author.handle,
          recipe: recipe.id,
          when: formatRelativeTime(a.happened_at),
          caption: a.caption ?? '',
        },
        recipe,
        author,
      },
    ];
  });
  return { items, nextCursor };
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
    .select('id, name, handle, bio, avatar_url')
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

// People who follow this profile, most recently followed first.
export async function fetchFollowers(profileId: string): Promise<Person[]> {
  const { data: followRows, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('followee_id', profileId)
    .order('created_at', { ascending: false });
  if (error || !followRows) {
    console.error('fetchFollowers', error);
    return [];
  }
  return mapPeopleInOrder(followRows.map((f: { follower_id: string }) => f.follower_id));
}

// People this profile follows, most recently followed first.
export async function fetchFollowing(profileId: string): Promise<Person[]> {
  const { data: followRows, error } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', profileId)
    .order('created_at', { ascending: false });
  if (error || !followRows) {
    console.error('fetchFollowing', error);
    return [];
  }
  return mapPeopleInOrder(followRows.map((f: { followee_id: string }) => f.followee_id));
}

// Fetches profile rows + stats for a list of ids and maps them to Person[],
// preserving the given order — `.in()` doesn't guarantee it matches input order.
async function mapPeopleInOrder(ids: string[]): Promise<Person[]> {
  if (ids.length === 0) return [];
  const [{ data: rows }, stats] = await Promise.all([
    supabase.from('profiles').select('id, name, handle, bio, avatar_url').in('id', ids),
    fetchProfileStatsByIds(ids),
  ]);
  const byId = new Map((rows ?? []).map((r: ProfileRow) => [r.id, r]));
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is ProfileRow => !!r)
    .map((r) => mapPerson(r, stats.get(r.id)));
}

// Tags people are actually using, most-used first — not a curated list,
// since a hand-picked one drifts out of sync with what recipes are
// actually tagged the moment real content replaces seed data.
export async function fetchTrendingTags(limit = 8): Promise<string[]> {
  const { data, error } = await supabase.from('recipes').select('tags');
  if (error || !data) {
    console.error('fetchTrendingTags', error);
    return [];
  }
  const counts = new Map<string, number>();
  for (const r of data as { tags: string[] }[]) {
    for (const t of r.tags ?? []) {
      const tag = t.toLowerCase();
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

// Ranked by real engagement, not recency — saves and cooks count equally
// as direct signals, and a rating is weighted by how many people gave one
// (rating_avg * rating_count), so one 5-star vote doesn't outrank a recipe
// dozens of people actually saved or cooked. RLS already scopes the fetch
// to whatever this viewer is allowed to see (public, their own, or
// followers-only from someone they follow), same as any other recipe read.
// Recomputed from live recipe_stats on every call — nothing here is a
// fixed or cached list.
export async function fetchTrendingRecipes(limit = 5) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) {
    console.error('fetchTrendingRecipes', error);
    return [];
  }

  const rows = data as RecipeRow[];
  const statsById = await fetchRecipeStatsByIds(rows.map((r) => r.id));

  const scored = rows.map((row) => {
    const stats = statsById.get(row.id);
    const saves = stats?.save_count ?? 0;
    const cooked = stats?.made_it_count ?? 0;
    const ratingWeight = (stats?.rating_avg ?? 0) * (stats?.rating_count ?? 0);
    return { row, stats, score: saves + cooked + ratingWeight, hasPhoto: !!row.cover_photo_url };
  });

  // Ties (most often all-zero engagement) fall back to "has a photo" and
  // then, via the stable sort preserving the query's own order, recency.
  scored.sort((a, b) => b.score - a.score || Number(b.hasPhoto) - Number(a.hasPhoto));
  const top = scored.slice(0, limit);

  const authorIds = [...new Set(top.map((s) => s.row.author_id))];
  const { data: authors } = await supabase.from('profiles').select('id, handle').in('id', authorIds);
  const handleById = new Map((authors ?? []).map((a: { id: string; handle: string }) => [a.id, a.handle]));

  return top.map(({ row, stats }) => mapRecipeSummary(row, handleById.get(row.author_id) ?? '', stats));
}

// ─────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────
export interface SearchResults {
  recipes: Recipe[];
  people: Person[];
  shelves: Shelf[];
}

// One query across recipes (title, subtitle, tags, ingredient text), people
// (name, handle, bio), and shelves (title, subtitle). Runs as separate
// single-column ilike queries merged in JS rather than one combined `.or()`
// filter string — a raw search term can contain commas or parens, which
// PostgREST's or-filter syntax treats as structural unless quoted, so
// building one by hand from arbitrary user input isn't safe.
export async function searchAll(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return { recipes: [], people: [], shelves: [] };
  const pattern = `%${q}%`;
  const handlePattern = `%${q.replace(/^@/, '')}%`;

  const [
    { data: byTitle },
    { data: bySubtitle },
    { data: byTag },
    { data: ingredientHits },
    { data: byName },
    { data: byHandle },
    { data: byBio },
    { data: shelfByTitle },
    { data: shelfBySubtitle },
  ] = await Promise.all([
    supabase.from('recipes').select('id').ilike('title', pattern),
    supabase.from('recipes').select('id').ilike('subtitle', pattern),
    supabase.from('recipes').select('id').contains('tags', [q.toLowerCase()]),
    supabase.from('recipe_ingredients').select('recipe_ingredient_sections(recipe_id)').ilike('name', pattern),
    supabase.from('profiles').select('id, name, handle, bio, avatar_url').ilike('name', pattern).neq('handle', 'you'),
    supabase.from('profiles').select('id, name, handle, bio, avatar_url').ilike('handle', handlePattern).neq('handle', 'you'),
    supabase.from('profiles').select('id, name, handle, bio, avatar_url').ilike('bio', pattern).neq('handle', 'you'),
    supabase
      .from('shelves')
      .select('id, title, subtitle, visibility, shelf_recipes(recipe_id)')
      .ilike('title', pattern),
    supabase
      .from('shelves')
      .select('id, title, subtitle, visibility, shelf_recipes(recipe_id)')
      .ilike('subtitle', pattern),
  ]);

  const recipeIds = new Set<string>();
  for (const r of [...(byTitle ?? []), ...(bySubtitle ?? []), ...(byTag ?? [])] as { id: string }[]) {
    recipeIds.add(r.id);
  }
  for (const row of (ingredientHits ?? []) as {
    recipe_ingredient_sections: { recipe_id: string } | { recipe_id: string }[] | null;
  }[]) {
    const section = unwrapOne(row.recipe_ingredient_sections);
    if (section) recipeIds.add(section.recipe_id);
  }
  let recipes: Recipe[] = [];
  if (recipeIds.size > 0) {
    const { data: recipeRows } = await supabase.from('recipes').select('*').in('id', [...recipeIds]);
    recipes = await mapRecipeRows((recipeRows ?? []) as RecipeRow[]);
  }

  const peopleById = new Map<string, ProfileRow>();
  for (const p of [...(byName ?? []), ...(byHandle ?? []), ...(byBio ?? [])] as ProfileRow[]) {
    peopleById.set(p.id, p);
  }
  const peopleRows = [...peopleById.values()];
  const peopleStats = await fetchProfileStatsByIds(peopleRows.map((p) => p.id));
  const people = peopleRows.map((p) => mapPerson(p, peopleStats.get(p.id)));

  const shelvesById = new Map<
    string,
    { id: string; title: string; subtitle: string; visibility: ShelfVisibility; shelf_recipes: unknown[] }
  >();
  for (const s of [...(shelfByTitle ?? []), ...(shelfBySubtitle ?? [])] as {
    id: string;
    title: string;
    subtitle: string;
    visibility: ShelfVisibility;
    shelf_recipes: unknown[];
  }[]) {
    shelvesById.set(s.id, s);
  }
  const shelves: Shelf[] = [...shelvesById.values()].map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    visibility: s.visibility,
    count: s.shelf_recipes.length,
    recipes: [],
  }));

  return { recipes, people, shelves };
}

// ─────────────────────────────────────────────────────────────
// Auth / onboarding
// ─────────────────────────────────────────────────────────────
export async function checkHandleAvailable(handle: string, excludeProfileId?: string): Promise<boolean> {
  let query = supabase.from('profiles').select('id').eq('handle', handle.trim().toLowerCase());
  if (excludeProfileId) query = query.neq('id', excludeProfileId);
  const { data, error } = await query.maybeSingle();
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
// Settings
// ─────────────────────────────────────────────────────────────
export async function updateProfile(
  profileId: string,
  fields: { name: string; handle: string; bio: string; link: string; avatarUrl?: string },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      name: fields.name.trim(),
      handle: fields.handle.trim().toLowerCase(),
      bio: fields.bio.trim(),
      link: fields.link.trim(),
      ...(fields.avatarUrl !== undefined ? { avatar_url: fields.avatarUrl || null } : {}),
    })
    .eq('id', profileId);
  if (error) {
    console.error('updateProfile', error);
    return { error: error.message };
  }
  return { error: null };
}

export async function updateNotificationPrefs(profileId: string, prefs: NotificationPrefs) {
  const { error } = await supabase.from('profiles').update({ notification_prefs: prefs }).eq('id', profileId);
  if (error) console.error('updateNotificationPrefs', error);
}

// null means "ask each time" — Publish still shows all three options and
// still lets this be overridden per recipe either way.
export async function updateDefaultVisibility(profileId: string, visibility: Visibility | null) {
  const { error } = await supabase.from('profiles').update({ default_visibility: visibility }).eq('id', profileId);
  if (error) console.error('updateDefaultVisibility', error);
}

// 'no_one' only stops new follows — RLS enforces it on the follows insert
// itself (see 0022_who_can_follow.sql), existing followers aren't removed.
export async function updateWhoCanFollow(profileId: string, value: 'anyone' | 'no_one') {
  const { error } = await supabase.from('profiles').update({ who_can_follow: value }).eq('id', profileId);
  if (error) console.error('updateWhoCanFollow', error);
}

// ─────────────────────────────────────────────────────────────
// Profile (own + friend)
// ─────────────────────────────────────────────────────────────
export async function fetchProfileByHandle(handle: string) {
  const { data: profileRow, error } = await supabase
    .from('profiles')
    .select('id, name, handle, bio, avatar_url')
    .eq('handle', handle.trim().toLowerCase())
    .maybeSingle();

  if (error || !profileRow) {
    if (error) console.error('fetchProfileByHandle', error);
    return null;
  }

  const [stats, { data: recipeRows }, { data: shelfRows }] = await Promise.all([
    fetchProfileStatsByIds([profileRow.id]),
    supabase.from('recipes').select('*').eq('author_id', profileRow.id).order('created_at', { ascending: false }),
    supabase
      .from('shelves')
      .select('id, title, subtitle, visibility, shelf_recipes(recipe_id, position, recipes(title))')
      .eq('owner_id', profileRow.id)
      .is('archived_at', null)
      .order('position', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false }),
  ]);

  const person = mapPerson(profileRow, stats.get(profileRow.id));
  const recipes = await mapRecipeRows((recipeRows ?? []) as RecipeRow[]);
  const shelves = mapShelfRows(shelfRows ?? []);

  return { person, recipes, shelves };
}

interface ShelfRow {
  id: string;
  title: string;
  subtitle: string;
  visibility: ShelfVisibility;
  shelf_recipes: { recipe_id: string; position: number; recipes: { title: string } | { title: string }[] | null }[];
}

function mapShelfRows(rows: ShelfRow[]): Shelf[] {
  return rows.map((s) => {
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
  });
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

// The owner's own arrangement of their cookbook's Recipes list, as recipe
// ids in order. Recipes they haven't placed yet aren't in it — see
// sortByCookbookOrder for where those land.
export async function fetchCookbookOrder(ownerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('cookbook_order')
    .select('recipe_id')
    .eq('owner_id', ownerId)
    .order('position', { ascending: true });
  if (error || !data) {
    if (error) console.error('fetchCookbookOrder', error);
    return [];
  }
  return data.map((r: { recipe_id: string }) => r.recipe_id);
}

export async function saveCookbookOrder(ownerId: string, recipeIds: string[]): Promise<boolean> {
  const { error } = await supabase
    .from('cookbook_order')
    .upsert(
      recipeIds.map((recipeId, position) => ({ owner_id: ownerId, recipe_id: recipeId, position })),
      { onConflict: 'owner_id,recipe_id' },
    );
  if (error) {
    console.error('saveCookbookOrder', error);
    return false;
  }
  return true;
}

export async function saveShelfOrder(ownerId: string, shelfIds: string[]): Promise<boolean> {
  const results = await Promise.all(
    shelfIds.map((id, position) =>
      supabase.from('shelves').update({ position }).eq('id', id).eq('owner_id', ownerId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed) {
    console.error('saveShelfOrder', failed.error);
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
// Cook photos — the profile's "Cooked" grid
// ─────────────────────────────────────────────────────────────
// RLS only returns photos whose recipe the viewer can see (0026), so a
// photo of a private recipe never shows up for someone who can't open it.
const COOK_PHOTO_SELECT =
  'id, user_id, recipe_id, photo_url, created_at, recipe:recipes(title), owner:profiles!cook_photos_user_id_fkey(handle, avatar_url)';

type CookPhotoRow = {
  id: string;
  user_id: string;
  recipe_id: string;
  photo_url: string;
  created_at: string;
  recipe: { title: string } | { title: string }[] | null;
  owner: { handle: string; avatar_url: string | null } | { handle: string; avatar_url: string | null }[] | null;
};

async function mapCookPhotoRows(rows: CookPhotoRow[], viewerId: string | null): Promise<CookPhoto[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [{ data: kissRows }, { data: commentRows }] = await Promise.all([
    supabase.from('cook_photo_kisses').select('photo_id, user_id').in('photo_id', ids),
    supabase.from('cook_photo_comments').select('photo_id').in('photo_id', ids),
  ]);
  const commentCounts = new Map<string, number>();
  for (const c of (commentRows ?? []) as { photo_id: string }[]) {
    commentCounts.set(c.photo_id, (commentCounts.get(c.photo_id) ?? 0) + 1);
  }
  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const k of (kissRows ?? []) as { photo_id: string; user_id: string }[]) {
    counts.set(k.photo_id, (counts.get(k.photo_id) ?? 0) + 1);
    if (viewerId && k.user_id === viewerId) mine.add(k.photo_id);
  }
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    handle: unwrapOne(r.owner)?.handle ?? '',
    avatarUrl: unwrapOne(r.owner)?.avatar_url ?? undefined,
    recipeId: r.recipe_id,
    recipeTitle: unwrapOne(r.recipe)?.title ?? '',
    photoUrl: r.photo_url,
    at: formatRelativeTime(r.created_at),
    kisses: counts.get(r.id) ?? 0,
    kissedByMe: mine.has(r.id),
    commentCount: commentCounts.get(r.id) ?? 0,
  }));
}

// Newest first.
export async function fetchCookPhotos(userId: string, viewerId: string | null): Promise<CookPhoto[]> {
  const { data, error } = await supabase
    .from('cook_photos')
    .select(COOK_PHOTO_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) {
    console.error('fetchCookPhotos', error);
    return [];
  }
  return mapCookPhotoRows(data as CookPhotoRow[], viewerId);
}

export async function fetchCookPhoto(photoId: string, viewerId: string | null): Promise<CookPhoto | null> {
  const { data, error } = await supabase.from('cook_photos').select(COOK_PHOTO_SELECT).eq('id', photoId).maybeSingle();
  if (error || !data) {
    if (error) console.error('fetchCookPhoto', error);
    return null;
  }
  return (await mapCookPhotoRows([data as CookPhotoRow], viewerId))[0] ?? null;
}

// The id is minted here and the insert isn't read back, so it never
// depends on the recipe's SELECT policy (see notify()).
export async function addCookPhoto(userId: string, recipeId: string, photoUrl: string): Promise<string | null> {
  const id = crypto.randomUUID();
  const { error } = await supabase
    .from('cook_photos')
    .insert({ id, user_id: userId, recipe_id: recipeId, photo_url: photoUrl });
  if (error) {
    console.error('addCookPhoto', error);
    return null;
  }
  return id;
}

export async function deleteCookPhoto(photoId: string): Promise<boolean> {
  const { error } = await supabase.from('cook_photos').delete().eq('id', photoId);
  if (error) console.error('deleteCookPhoto', error);
  return !error;
}

export async function setCookPhotoKiss(photo: CookPhoto, userId: string, kissed: boolean): Promise<boolean> {
  if (kissed) {
    const { error } = await supabase.from('cook_photo_kisses').insert({ photo_id: photo.id, user_id: userId });
    if (error) {
      console.error('setCookPhotoKiss insert', error);
      return false;
    }
    await notify(photo.userId, userId, 'kiss', { recipeId: photo.recipeId, cookPhotoId: photo.id });
    return true;
  }
  const { error } = await supabase.from('cook_photo_kisses').delete().eq('photo_id', photo.id).eq('user_id', userId);
  if (error) console.error('setCookPhotoKiss delete', error);
  return !error;
}

export async function fetchCookPhotoComments(photoId: string): Promise<CookPhotoComment[]> {
  const { data, error } = await supabase
    .from('cook_photo_comments')
    .select('id, author_id, text, created_at, author:profiles!cook_photo_comments_author_id_fkey(handle)')
    .eq('photo_id', photoId)
    .order('created_at');
  if (error || !data) {
    console.error('fetchCookPhotoComments', error);
    return [];
  }
  return (
    data as {
      id: string;
      author_id: string;
      text: string;
      created_at: string;
      author: { handle: string } | { handle: string }[] | null;
    }[]
  ).map((c) => ({
    id: c.id,
    authorId: c.author_id,
    handle: unwrapOne(c.author)?.handle ?? '',
    text: c.text,
    at: formatRelativeTime(c.created_at),
  }));
}

export async function postCookPhotoComment(
  photo: CookPhoto,
  author: { id: string; handle: string },
  text: string,
): Promise<CookPhotoComment | null> {
  const id = crypto.randomUUID();
  const { error } = await supabase.from('cook_photo_comments').insert({ id, photo_id: photo.id, author_id: author.id, text });
  if (error) {
    console.error('postCookPhotoComment', error);
    return null;
  }
  await notify(photo.userId, author.id, 'photo_comment', {
    recipeId: photo.recipeId,
    cookPhotoId: photo.id,
    excerpt: text,
  });
  return { id, authorId: author.id, handle: author.handle, text, at: formatRelativeTime(new Date().toISOString()) };
}

export async function deleteCookPhotoComment(commentId: string): Promise<boolean> {
  const { error } = await supabase.from('cook_photo_comments').delete().eq('id', commentId);
  if (error) console.error('deleteCookPhotoComment', error);
  return !error;
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
    photo_url: string | null;
    created_at: string;
    edited_at?: string | null;
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
      handle: a?.handle ?? '',
      at: formatRelativeTime(r.created_at),
      text: r.text,
      likes: likeCounts.get(r.id) ?? 0,
      likedByMe: likedByViewer.has(r.id),
      cooked: r.cooked,
      isQuestion: r.text.trim().endsWith('?'),
      photoUrl: r.photo_url ?? undefined,
      edited: !!r.edited_at,
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
        .select('id, parent_id, text, cooked, photo_url, created_at, edited_at, author:profiles!comments_author_id_fkey(id, name, handle)')
        .eq('recipe_id', id)
        .order('created_at'),
      supabase.from('profiles').select('id, name, handle, bio, avatar_url').eq('id', recipeRow.author_id).maybeSingle(),
      fetchProfileStatsByIds([recipeRow.author_id]),
    ]);

  const author = mapPerson(
    (authorRow as ProfileRow | null) ?? { id: recipeRow.author_id, name: '', handle: '', bio: '', avatar_url: null },
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
  recipe.steps = (steps ?? []).map(
    (s: { title: string; description: string; timer_minutes: number | null; photo_url: string | null }) => ({
      t: s.title,
      d: s.description,
      timer: s.timer_minutes ?? undefined,
      photoUrl: s.photo_url ?? undefined,
    }),
  );
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
// Whether a viewer can actually see a recipe, given its visibility — the
// column has existed since the visibility migration but nothing ever
// enforced it beyond the owner sheet's display label. The owner can always
// see their own; a followers-only recipe also needs a real follow row.
export async function checkRecipeAccess(
  visibility: Visibility,
  authorId: string,
  viewerId: string | null,
): Promise<boolean> {
  if (visibility === 'public') return true;
  if (viewerId && viewerId === authorId) return true;
  if (visibility === 'followers' && viewerId) return isFollowing(viewerId, authorId);
  return false;
}

export async function isFollowing(followerId: string, followeeId: string) {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .maybeSingle();
  return !!data;
}

// Which notification_prefs key gates each kind — a reply lands in the same
// note thread as a top-level note, so it's gated by the same "notes" toggle
// rather than a separate one nobody was asked about.
const PREF_KEY: Record<NotificationKind, keyof NotificationPrefs> = {
  note: 'notes',
  reply: 'notes',
  follow: 'follows',
  cooked: 'cooked',
  digest: 'digest',
  message: 'messages',
  kiss: 'notes',
  photo_comment: 'notes',
};

// Writes a notification for someone else's inbox. Never for your own —
// nobody needs to be told about their own action — and never when the
// recipient has turned this kind off in Settings.
async function notify(
  recipientId: string,
  actorId: string,
  kind: NotificationKind,
  extra: { recipeId?: string; commentId?: string; conversationId?: string; cookPhotoId?: string; excerpt?: string } = {},
) {
  if (recipientId === actorId) return;
  const { data: recipient } = await supabase
    .from('profiles')
    .select('notification_prefs')
    .eq('id', recipientId)
    .maybeSingle();
  const prefs = recipient?.notification_prefs as NotificationPrefs | undefined;
  if (prefs && !prefs[PREF_KEY[kind]]) return;

  // The id is minted here rather than read back with .select(): the row
  // belongs to the recipient, and RLS only lets the recipient SELECT it,
  // so an insert-returning from the actor's session fails and rolls back.
  const id = crypto.randomUUID();
  const { error } = await supabase.from('notifications').insert({
    id,
    recipient_id: recipientId,
    actor_id: actorId,
    kind,
    recipe_id: extra.recipeId ?? null,
    comment_id: extra.commentId ?? null,
    conversation_id: extra.conversationId ?? null,
    cook_photo_id: extra.cookPhotoId ?? null,
    excerpt: extra.excerpt ?? null,
  });
  if (error) {
    console.error('notify', error);
    return;
  }
  // Best-effort and fire-and-forget — a push notification is a bonus on
  // top of the in-app one just written above, never something the
  // triggering action (following someone, posting a note, ...) should
  // wait on or fail over.
  void triggerPush(id);
}

async function triggerPush(notificationId: string) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notificationId }),
    });
  } catch (err) {
    console.error('triggerPush', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Push subscriptions
// ─────────────────────────────────────────────────────────────
export async function savePushSubscription(
  profileId: string,
  subscription: { endpoint: string; p256dh: string; auth: string },
): Promise<boolean> {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: profileId, endpoint: subscription.endpoint, p256dh: subscription.p256dh, auth: subscription.auth },
      { onConflict: 'endpoint' },
    );
  if (error) {
    console.error('savePushSubscription', error);
    return false;
  }
  return true;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  if (error) console.error('deletePushSubscription', error);
}

// Returns whether the write actually landed — an insert can be rejected by
// RLS (the followee set "who can follow you" to no one, or either side
// blocked the other), and the caller needs to know so it can roll back its
// optimistic UI update rather than show "Following" for a follow that
// didn't happen.
export async function setFollowing(followerId: string, followeeId: string, follow: boolean): Promise<boolean> {
  if (follow) {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, followee_id: followeeId });
    if (error) {
      console.error('setFollowing insert', error);
      return false;
    }
    await notify(followeeId, followerId, 'follow');
    return true;
  }
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId);
  if (error) {
    console.error('setFollowing delete', error);
    return false;
  }
  return true;
}

export async function hasCooked(userId: string, recipeId: string): Promise<boolean> {
  const { data } = await supabase
    .from('made_it')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  return !!data;
}

// Marks (or unmarks) a recipe as cooked — the same made_it row postComment's
// "I cooked it" checkbox writes to, so a one-tap mark on the recipe page and
// a cooked note are the same underlying action. Idempotent: cooking the
// same recipe again doesn't add a second row or a second notification.
export async function setCooked(
  userId: string,
  recipeId: string,
  cooked: boolean,
  recipeAuthorId?: string,
): Promise<boolean> {
  if (cooked) {
    if (await hasCooked(userId, recipeId)) return true;
    const { error } = await supabase.from('made_it').insert({ user_id: userId, recipe_id: recipeId });
    if (error) {
      console.error('setCooked insert', error);
      return false;
    }
    if (recipeAuthorId) await notify(recipeAuthorId, userId, 'cooked', { recipeId });
    return true;
  }
  const { error } = await supabase.from('made_it').delete().eq('user_id', userId).eq('recipe_id', recipeId);
  if (error) {
    console.error('setCooked delete', error);
    return false;
  }
  return true;
}

// The viewer's own star rating for a recipe, or 0 if they haven't rated it.
export async function fetchMyRating(userId: string, recipeId: string): Promise<number> {
  const { data } = await supabase
    .from('recipe_ratings')
    .select('stars')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  return data?.stars ?? 0;
}

// Sets (or changes) the viewer's own rating — one row per person per
// recipe, so rating again just overwrites the old value rather than
// stacking up duplicate ratings.
export async function rateRecipe(userId: string, recipeId: string, stars: number): Promise<boolean> {
  const { error } = await supabase
    .from('recipe_ratings')
    .upsert(
      { user_id: userId, recipe_id: recipeId, stars, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,recipe_id' },
    );
  if (error) {
    console.error('rateRecipe', error);
    return false;
  }
  return true;
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
  opts: { parentId?: string; cooked?: boolean; recipeAuthorId?: string; photoUrl?: string } = {},
): Promise<RecipeComment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      author_id: authorId,
      recipe_id: recipeId,
      text,
      parent_id: opts.parentId ?? null,
      cooked: !!opts.cooked,
      photo_url: opts.photoUrl ?? null,
    })
    .select('*, author:profiles!comments_author_id_fkey(id, name, handle)')
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
    await setCooked(authorId, recipeId, true, opts.recipeAuthorId);
  }

  return {
    id: data.id,
    authorId,
    handle: author?.handle ?? '',
    at: formatRelativeTime(data.created_at),
    text: data.text,
    likes: 0,
    likedByMe: false,
    cooked: data.cooked,
    isQuestion: text.trim().endsWith('?'),
    photoUrl: data.photo_url ?? undefined,
    edited: false,
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

// Edits the text and/or photo of one of your own notes. The DB trigger
// (0025) stamps edited_at and keeps everything else about the note as it
// was. Returns false if nothing was saved — an RLS-filtered update errors
// silently as zero rows, hence the select.
export async function updateComment(commentId: string, text: string, photoUrl: string | null): Promise<boolean> {
  const { data, error } = await supabase
    .from('comments')
    .update({ text, photo_url: photoUrl })
    .eq('id', commentId)
    .select('id');
  if (error) console.error('updateComment', error);
  return !error && (data?.length ?? 0) > 0;
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
    .is('archived_at', null)
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

// Archived shelves — hidden from the Cookbook's Shelves tab and the
// add-to-shelf picker, visible only here, restorable from here.
export async function fetchArchivedShelves(ownerId: string): Promise<Shelf[]> {
  const { data, error } = await supabase
    .from('shelves')
    .select('id, title, subtitle, visibility, shelf_recipes(recipe_id, position, recipes(title))')
    .eq('owner_id', ownerId)
    .not('archived_at', 'is', null);
  if (error || !data) {
    console.error('fetchArchivedShelves', error);
    return [];
  }
  return mapShelfRows(data);
}

export async function updateShelf(
  shelfId: string,
  values: { title: string; subtitle: string; visibility: ShelfVisibility },
): Promise<boolean> {
  const { error } = await supabase.from('shelves').update(values).eq('id', shelfId);
  if (error) {
    console.error('updateShelf', error);
    return false;
  }
  return true;
}

export async function setShelfArchived(shelfId: string, archived: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('shelves')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', shelfId);
  if (error) {
    console.error('setShelfArchived', error);
    return false;
  }
  return true;
}

// Replaces which of the user's own shelves a recipe sits on in one go, and
// keeps the plain `saves` signal (recipe_stats, feed activity, the Saved
// tab) in sync with it — filed on any shelf counts as saved, filed on none
// doesn't. This is what the "manage shelves" sheet writes once a recipe's
// already saved and you're moving it around.
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

// Finds the caller's "Saved" shelf, creating it on first use — and
// un-archiving it if a past session archived it, since bookmarking
// something is a fresh use of it. Title match is scoped to this owner
// only, so it can never collide with anyone else's shelf of the same name.
async function ensureDefaultShelf(ownerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('shelves')
    .select('id, archived_at')
    .eq('owner_id', ownerId)
    .eq('title', 'Saved')
    .order('created_at', { ascending: true })
    .limit(1);
  if (error) {
    console.error('ensureDefaultShelf: lookup', error);
    return null;
  }
  const existing = data?.[0];
  if (existing) {
    if (existing.archived_at) await setShelfArchived(existing.id, false);
    return existing.id as string;
  }
  const created = await createShelf(ownerId, 'Saved');
  return created?.id ?? null;
}

// The heart button's one-tap default: files the recipe on the caller's
// "Saved" shelf without opening the shelf picker, on top of whatever
// shelves it's already on (so it never undoes a deliberate choice made
// via "manage shelves"). Picking a different shelf instead is still one
// tap away — once saved, the same button opens the shelf picker.
export async function quickSaveRecipe(ownerId: string, recipeId: string): Promise<boolean> {
  const defaultShelfId = await ensureDefaultShelf(ownerId);
  if (!defaultShelfId) return false;

  const [ownShelves, shelfIdsWithRecipe] = await Promise.all([
    fetchShelvesForOwner(ownerId),
    fetchShelfIdsForRecipe(recipeId),
  ]);
  const current = ownShelves.map((s) => s.id).filter((sid) => shelfIdsWithRecipe.has(sid));

  await setRecipeShelves(ownerId, recipeId, [...new Set([...current, defaultShelfId])]);
  return true;
}

// Files recipes already in the caller's cookbook (their own, or saved)
// onto a shelf, on top of whatever other shelves each one is already on —
// same "union, don't replace" rule quickSaveRecipe uses for the heart
// button. Intersecting with the caller's own shelves before the union
// matters here: fetchShelfIdsForRecipe can include another owner's shelf
// if that recipe happens to be saved there too, and setRecipeShelves'
// insert must never be handed a shelf id that isn't the caller's own.
export async function addRecipesToShelf(ownerId: string, shelfId: string, recipeIds: string[]): Promise<void> {
  const ownShelfIds = new Set((await fetchShelvesForOwner(ownerId)).map((s) => s.id));
  await Promise.all(
    recipeIds.map(async (recipeId) => {
      const shelfIdsWithRecipe = await fetchShelfIdsForRecipe(recipeId);
      const current = [...shelfIdsWithRecipe].filter((sid) => ownShelfIds.has(sid));
      await setRecipeShelves(ownerId, recipeId, [...new Set([...current, shelfId])]);
    }),
  );
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

// Deletes the shelf itself — shelf_recipes links cascade via their FK, but
// the recipes on it are untouched, just no longer filed here (same as
// removeRecipeFromShelf, this doesn't re-sync the separate `saves` table).
export async function deleteShelf(shelfId: string): Promise<boolean> {
  const { error } = await supabase.from('shelves').delete().eq('id', shelfId);
  if (error) {
    console.error('deleteShelf', error);
    return false;
  }
  return true;
}

function recipeFields(draft: RecipeDraft, visibility: Visibility) {
  return {
    title: draft.title.trim() || 'Untitled recipe',
    subtitle: draft.subtitle.trim(),
    intro: draft.intro.trim(),
    time: draft.time.trim(),
    serves: Math.min(MAX_SERVINGS, Math.max(1, parseInt(draft.serves, 10) || 1)),
    difficulty: draft.level,
    tags: draft.tags,
    cover_photo_url: draft.coverPhotoUrl.trim() || null,
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
        description: s.d.trim().slice(0, 300),
        timer_minutes: s.timer.trim() ? parseInt(s.timer, 10) || null : null,
        photo_url: s.photoUrl.trim() || null,
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
  coverPhotoUrl?: string;
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
    coverPhotoUrl: recipe.coverPhotoUrl,
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
    steps: snapshot.steps.map((s) => ({
      t: s.t,
      d: s.d,
      timer: s.timer != null ? String(s.timer) : '',
      photoUrl: s.photoUrl ?? '',
    })),
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
      cover_photo_url: snapshot.coverPhotoUrl ?? null,
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
// Message rows are still written — they're what triggers a message's push
// notification — but the in-app list and badge leave them out, since the
// Messages tab already carries its own unread dot.
export async function fetchNotifications(recipientId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    // `notifications` has two FKs into `profiles` (recipient_id, actor_id),
    // so the embed must name which column to join on — otherwise it's
    // ambiguous to PostgREST and silently resolves to nothing.
    .select(
      'id, kind, excerpt, conversation_id, cook_photo_id, created_at, read_at, actor:profiles!actor_id(name, handle), recipe:recipes(id, title)',
    )
    .eq('recipient_id', recipientId)
    .neq('kind', 'message')
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
      conversation_id: string | null;
      cook_photo_id: string | null;
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
        actorHandle: actor?.handle ?? null,
        recipeId: recipe?.id ?? null,
        recipeTitle: recipe?.title ?? null,
        conversationId: n.conversation_id,
        cookPhotoId: n.cook_photo_id,
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
    .neq('kind', 'message')
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

export async function markNotificationsRead(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids)
    .is('read_at', null);
  if (error) console.error('markNotificationsRead', error);
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('markNotificationRead', error);
}

// ─────────────────────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────────────────────
interface ConversationRow {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string;
}

// Every conversation this person is part of — queried as two separate
// eq() lookups (one per side of the pair) rather than a combined or()
// filter, same reasoning as searchAll: keeps the query string free of
// interpolated values entirely.
async function fetchMyConversationRows(myId: string): Promise<ConversationRow[]> {
  const [{ data: asA, error: errA }, { data: asB, error: errB }] = await Promise.all([
    supabase.from('conversations').select('id, user_a_id, user_b_id, last_message_at').eq('user_a_id', myId),
    supabase.from('conversations').select('id, user_a_id, user_b_id, last_message_at').eq('user_b_id', myId),
  ]);
  if (errA) console.error('fetchMyConversationRows a', errA);
  if (errB) console.error('fetchMyConversationRows b', errB);
  return [...((asA ?? []) as ConversationRow[]), ...((asB ?? []) as ConversationRow[])];
}

async function fetchLastMessageByConversation(conversationIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (conversationIds.length === 0) return map;
  const { data } = await supabase
    .from('messages')
    .select('conversation_id, text, photo_url, recipe:recipes(title), created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });
  for (const m of (data ?? []) as unknown as {
    conversation_id: string;
    text: string;
    photo_url: string | null;
    recipe: { title: string } | null;
  }[]) {
    if (!map.has(m.conversation_id)) {
      map.set(m.conversation_id, m.text || (m.photo_url ? '📷 Photo' : m.recipe ? `📖 ${m.recipe.title}` : ''));
    }
  }
  return map;
}

async function fetchUnreadCountByConversation(conversationIds: string[], myId: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (conversationIds.length === 0) return map;
  const { data } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .neq('sender_id', myId)
    .is('read_at', null);
  for (const m of (data ?? []) as { conversation_id: string }[]) {
    map.set(m.conversation_id, (map.get(m.conversation_id) ?? 0) + 1);
  }
  return map;
}

// Finds the one conversation between two people, or starts it — user_a_id
// is always the lexicographically smaller id, so there's exactly one
// conversation per pair regardless of who messages whom first.
export async function getOrCreateConversation(myId: string, otherId: string): Promise<string | null> {
  const [userA, userB] = myId < otherId ? [myId, otherId] : [otherId, myId];
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_a_id', userA)
    .eq('user_b_id', userB)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_a_id: userA, user_b_id: userB })
    .select('id')
    .single();
  if (error || !data) {
    console.error('getOrCreateConversation', error);
    return null;
  }
  return data.id;
}

interface ConversationStateRow {
  conversation_id: string;
  archived: boolean;
  deleted_at: string | null;
}

async function fetchMyConversationStates(myId: string): Promise<Map<string, ConversationStateRow>> {
  const { data, error } = await supabase
    .from('conversation_participant_state')
    .select('conversation_id, archived, deleted_at')
    .eq('profile_id', myId);
  if (error) console.error('fetchMyConversationStates', error);
  return new Map((data ?? []).map((r: ConversationStateRow) => [r.conversation_id, r]));
}

async function fetchConversationSummaries(myId: string, which: 'active' | 'archived'): Promise<ConversationSummary[]> {
  const [rows, states] = await Promise.all([fetchMyConversationRows(myId), fetchMyConversationStates(myId)]);
  const rowsInView = rows
    .filter((r) => {
      const state = states.get(r.id);
      if (state?.deleted_at) return false;
      return which === 'archived' ? !!state?.archived : !state?.archived;
    })
    .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  if (rowsInView.length === 0) return [];

  const otherIds = rowsInView.map((r) => (r.user_a_id === myId ? r.user_b_id : r.user_a_id));
  const [{ data: peopleRows }, stats, lastMessages, unreadCounts] = await Promise.all([
    supabase.from('profiles').select('id, name, handle, bio, avatar_url').in('id', otherIds),
    fetchProfileStatsByIds(otherIds),
    fetchLastMessageByConversation(rowsInView.map((r) => r.id)),
    fetchUnreadCountByConversation(rowsInView.map((r) => r.id), myId),
  ]);
  const peopleById = new Map((peopleRows ?? []).map((p: ProfileRow) => [p.id, p]));

  return rowsInView.map((r) => {
    const otherId = r.user_a_id === myId ? r.user_b_id : r.user_a_id;
    const personRow = peopleById.get(otherId);
    return {
      id: r.id,
      person: personRow
        ? mapPerson(personRow, stats.get(otherId))
        : { id: otherId, name: 'Someone', handle: '', bio: '', recipes: 0, followers: 0, following: 0, seed: 0 },
      lastMessage: lastMessages.get(r.id) ?? '',
      lastMessageAt: r.last_message_at,
      unread: unreadCounts.get(r.id) ?? 0,
    };
  });
}

export async function fetchConversations(myId: string): Promise<ConversationSummary[]> {
  return fetchConversationSummaries(myId, 'active');
}

export async function fetchArchivedConversations(myId: string): Promise<ConversationSummary[]> {
  return fetchConversationSummaries(myId, 'archived');
}

// Archiving and deleting are both just this participant's own view of the
// conversation — see conversation_participant_state. A new message clears
// both (via a trigger, since RLS wouldn't let this client-side write
// reach the *other* participant's row).
export async function setConversationArchived(
  conversationId: string,
  myId: string,
  archived: boolean,
): Promise<boolean> {
  const { error } = await supabase
    .from('conversation_participant_state')
    .upsert(
      { conversation_id: conversationId, profile_id: myId, archived },
      { onConflict: 'conversation_id,profile_id' },
    );
  if (error) {
    console.error('setConversationArchived', error);
    return false;
  }
  return true;
}

export async function deleteConversationForMe(conversationId: string, myId: string): Promise<boolean> {
  const { error } = await supabase.from('conversation_participant_state').upsert(
    { conversation_id: conversationId, profile_id: myId, deleted_at: new Date().toISOString() },
    { onConflict: 'conversation_id,profile_id' },
  );
  if (error) {
    console.error('deleteConversationForMe', error);
    return false;
  }
  return true;
}

export async function fetchConversationPeer(conversationId: string, myId: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('user_a_id, user_b_id')
    .eq('id', conversationId)
    .maybeSingle();
  if (error || !data) {
    console.error('fetchConversationPeer', error);
    return null;
  }
  const otherId = data.user_a_id === myId ? data.user_b_id : data.user_a_id;
  const [{ data: personRow }, stats] = await Promise.all([
    supabase.from('profiles').select('id, name, handle, bio, avatar_url').eq('id', otherId).maybeSingle(),
    fetchProfileStatsByIds([otherId]),
  ]);
  if (!personRow) return null;
  return mapPerson(personRow as ProfileRow, stats.get(otherId));
}

interface MessageSelectRow {
  id: string;
  sender_id: string;
  text: string;
  photo_url: string | null;
  recipe: { id: string; title: string; cover_photo_url: string | null } | null;
  created_at: string;
  read_at: string | null;
}

function mapMessageRow(m: MessageSelectRow): DirectMessage {
  return {
    id: m.id,
    senderId: m.sender_id,
    text: m.text,
    photoUrl: m.photo_url ?? undefined,
    sharedRecipe: m.recipe
      ? { id: m.recipe.id, title: m.recipe.title, coverPhotoUrl: m.recipe.cover_photo_url ?? undefined }
      : undefined,
    createdAt: m.created_at,
    read: !!m.read_at,
  };
}

const MESSAGE_SELECT = 'id, sender_id, text, photo_url, recipe:recipes(id, title, cover_photo_url), created_at, read_at';

export async function fetchMessages(conversationId: string): Promise<DirectMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error || !data) {
    console.error('fetchMessages', error);
    return [];
  }
  return (data as unknown as MessageSelectRow[]).map(mapMessageRow);
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  text: string,
  photoUrl?: string,
  recipeId?: string,
): Promise<DirectMessage | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, text, photo_url: photoUrl ?? null, recipe_id: recipeId ?? null })
    .select(MESSAGE_SELECT)
    .single();
  if (error || !data) {
    console.error('sendMessage', error);
    return null;
  }
  const row = data as unknown as MessageSelectRow;
  const { error: convError } = await supabase
    .from('conversations')
    .update({ last_message_at: row.created_at })
    .eq('id', conversationId);
  if (convError) console.error('sendMessage: conversation update', convError);

  await notify(recipientId, senderId, 'message', {
    conversationId,
    excerpt: text || (photoUrl ? '📷 Photo' : row.recipe ? `📖 ${row.recipe.title}` : ''),
  });

  return mapMessageRow(row);
}

export async function markConversationRead(conversationId: string, myId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', myId)
    .is('read_at', null);
  if (error) console.error('markConversationRead', error);
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  const { error } = await supabase.from('messages').delete().eq('id', messageId);
  if (error) {
    console.error('deleteMessage', error);
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
// Blocking
// ─────────────────────────────────────────────────────────────
export async function isBlockedByMe(myId: string, otherId: string): Promise<boolean> {
  const { data } = await supabase
    .from('blocked_users')
    .select('blocker_id')
    .eq('blocker_id', myId)
    .eq('blocked_id', otherId)
    .maybeSingle();
  return !!data;
}

// Blocking also drops any existing follow between the two of you — RLS
// only lets each side delete the follow row they can already touch, so
// this is two deletes, not a mutual "delete anything" grant.
export async function blockUser(myId: string, otherId: string): Promise<boolean> {
  const { error } = await supabase
    .from('blocked_users')
    .upsert({ blocker_id: myId, blocked_id: otherId }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true });
  if (error) {
    console.error('blockUser', error);
    return false;
  }
  await Promise.all([
    supabase.from('follows').delete().eq('follower_id', myId).eq('followee_id', otherId),
    supabase.from('follows').delete().eq('follower_id', otherId).eq('followee_id', myId),
  ]);
  return true;
}

export async function unblockUser(myId: string, otherId: string): Promise<boolean> {
  const { error } = await supabase.from('blocked_users').delete().eq('blocker_id', myId).eq('blocked_id', otherId);
  if (error) {
    console.error('unblockUser', error);
    return false;
  }
  return true;
}

export async function countUnreadMessages(myId: string): Promise<number> {
  const rows = await fetchMyConversationRows(myId);
  if (rows.length === 0) return 0;
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in(
      'conversation_id',
      rows.map((r) => r.id),
    )
    .neq('sender_id', myId)
    .is('read_at', null);
  if (error) {
    console.error('countUnreadMessages', error);
    return 0;
  }
  return count ?? 0;
}

// ─────────────────────────────────────────────────────────────
// Account
// ─────────────────────────────────────────────────────────────
// Consequence counts for the account-deletion confirmation copy.
export async function fetchAccountDeleteImpact(
  profileId: string,
): Promise<{ recipes: number; shelves: number; comments: number; saves: number }> {
  const [{ data: recipeRows }, { count: shelves }, { count: comments }] = await Promise.all([
    supabase.from('recipes').select('id').eq('author_id', profileId),
    supabase.from('shelves').select('*', { count: 'exact', head: true }).eq('owner_id', profileId),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('author_id', profileId),
  ]);
  const recipeIds = (recipeRows ?? []).map((r: { id: string }) => r.id);
  let saves = 0;
  if (recipeIds.length > 0) {
    const { count } = await supabase.from('saves').select('*', { count: 'exact', head: true }).in('recipe_id', recipeIds);
    saves = count ?? 0;
  }
  return { recipes: recipeIds.length, shelves: shelves ?? 0, comments: comments ?? 0, saves };
}

// Deletes the profile row outright — every recipe, shelf, comment, save,
// made_it entry, follow, and notification cascades from profiles.id, so
// this one delete is what actually erases someone's content. Deleting the
// underlying auth.users row (which is what actually frees up the email
// for a fresh signup) needs the service-role key, so that part happens
// server-side via /api/account/delete — grab the access token before the
// profile goes away, since that's what proves to that route who's asking.
export async function deleteAccount(profileId: string): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { error } = await supabase.from('profiles').delete().eq('id', profileId);
  if (error) {
    console.error('deleteAccount: profile delete', error);
    return false;
  }

  if (session?.access_token) {
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) console.error('deleteAccount: auth user delete failed', await res.text());
    } catch (err) {
      console.error('deleteAccount: auth user delete request failed', err);
    }
  }

  // The profile and everything it owns is already gone either way — that's
  // the part the person actually asked for and can see. A failure past
  // this point (no session, the route erroring) leaves a stray auth.users
  // row behind but shouldn't make the UI report the deletion as failed.
  return true;
}

// Every recipe a user has authored, fully assembled (ingredients, steps,
// notes) — for "export everything" and "print your cookbook", which both
// need the full document rather than the summary fetchProfileByHandle uses.
export async function fetchMyRecipesFull(authorId: string): Promise<Recipe[]> {
  const { data: rows, error } = await supabase
    .from('recipes')
    .select('id')
    .eq('author_id', authorId)
    .order('created_at', { ascending: true });
  if (error || !rows) {
    console.error('fetchMyRecipesFull', error);
    return [];
  }
  const full = await Promise.all(rows.map((r: { id: string }) => fetchRecipeFull(r.id)));
  return full.filter((f): f is { recipe: Recipe; author: Person } => !!f).map((f) => f.recipe);
}
