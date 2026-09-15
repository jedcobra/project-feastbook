import { formatRelativeTime } from '@/lib/format';
import type { RecipeDraft } from '@/lib/recipe-draft';
import { supabase } from '@/lib/supabase/client';
import type { FeedActivity, Person, Recipe, Shelf } from '@/lib/types';

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
  let query = supabase
    .from('profiles')
    .select('id, name, handle, bio')
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
      .select('id, title, subtitle, shelf_recipes(recipe_id, position, recipes(title))')
      .eq('owner_id', profileRow.id),
  ]);

  const person = mapPerson(profileRow, stats.get(profileRow.id));
  const recipes = await mapRecipeRows((recipeRows ?? []) as RecipeRow[]);

  const shelves: Shelf[] = (shelfRows ?? []).map(
    (s: {
      id: string;
      title: string;
      subtitle: string;
      shelf_recipes: { recipe_id: string; position: number; recipes: { title: string } | { title: string }[] | null }[];
    }) => {
      const sorted = [...s.shelf_recipes].sort((a, b) => a.position - b.position);
      return {
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
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

// ─────────────────────────────────────────────────────────────
// Recipe detail
// ─────────────────────────────────────────────────────────────
export async function fetchRecipeFull(id: string) {
  const { data: recipeRow, error } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle();

  if (error || !recipeRow) {
    if (error) console.error('fetchRecipeFull', error);
    return null;
  }

  const [{ data: sections }, { data: steps }, { data: notes }, { data: comments }, { data: authorRow }, authorStats] =
    await Promise.all([
      supabase
        .from('recipe_ingredient_sections')
        .select('*, recipe_ingredients(*)')
        .eq('recipe_id', id)
        .order('position'),
      supabase.from('recipe_steps').select('*').eq('recipe_id', id).order('position'),
      supabase.from('recipe_notes').select('*').eq('recipe_id', id).order('position'),
      supabase.from('comments').select('*, author:profiles(name)').eq('recipe_id', id).order('created_at'),
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
  recipe.comments = (comments ?? []).map(
    (c: { text: string; likes: number; author: { name: string } | { name: string }[] | null }) => ({
      by: unwrapOne(c.author)?.name ?? 'Someone',
      text: c.text,
      likes: c.likes,
    }),
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

export async function setFollowing(followerId: string, followeeId: string, follow: boolean) {
  if (follow) {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, followee_id: followeeId });
    if (error) console.error('setFollowing insert', error);
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

export async function postComment(authorId: string, recipeId: string, text: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ author_id: authorId, recipe_id: recipeId, text })
    .select('*, author:profiles(name)')
    .single();
  if (error || !data) {
    console.error('postComment', error);
    return null;
  }
  return { by: unwrapOne(data.author)?.name ?? 'Someone', text: data.text, likes: data.likes };
}

export async function createShelf(ownerId: string, title: string) {
  const { data, error } = await supabase
    .from('shelves')
    .insert({ owner_id: ownerId, title, subtitle: '' })
    .select('id, title')
    .single();
  if (error || !data) {
    console.error('createShelf', error);
    return null;
  }
  return { id: data.id as string, title: data.title as string };
}

// Writes a composer draft as a real recipe: the recipe row, its ingredient
// sections/items, steps, and notes, plus links to any chosen shelves.
// Skips blank rows (an empty ingredient line, a stepless step) rather than
// saving placeholder junk. Returns the new recipe id, or null on failure.
export async function publishRecipe(
  authorId: string,
  draft: RecipeDraft,
  visibility: 'public' | 'followers' | 'private',
  shelfIds: string[],
) {
  const { data: recipeRow, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      author_id: authorId,
      title: draft.title.trim() || 'Untitled recipe',
      subtitle: draft.subtitle.trim(),
      intro: draft.intro.trim(),
      time: draft.time.trim(),
      serves: parseInt(draft.serves, 10) || 1,
      difficulty: draft.level,
      tags: draft.tags,
      visibility,
    })
    .select('id')
    .single();

  if (recipeError || !recipeRow) {
    console.error('publishRecipe: recipes insert', recipeError);
    return null;
  }
  const recipeId = recipeRow.id as string;

  for (const [position, section] of draft.sections.entries()) {
    const items = section.items.filter((it) => it.i.trim());
    if (items.length === 0) continue;

    const { data: sectionRow, error: sectionError } = await supabase
      .from('recipe_ingredient_sections')
      .insert({ recipe_id: recipeId, label: section.section.trim() || null, position })
      .select('id')
      .single();
    if (sectionError || !sectionRow) {
      console.error('publishRecipe: section insert', sectionError);
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
    if (itemsError) console.error('publishRecipe: ingredients insert', itemsError);
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
    if (stepsError) console.error('publishRecipe: steps insert', stepsError);
  }

  const notes = draft.notes
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);
  if (notes.length > 0) {
    const { error: notesError } = await supabase
      .from('recipe_notes')
      .insert(notes.map((text, position) => ({ recipe_id: recipeId, text, position })));
    if (notesError) console.error('publishRecipe: notes insert', notesError);
  }

  if (shelfIds.length > 0) {
    const { error: shelfError } = await supabase
      .from('shelf_recipes')
      .insert(shelfIds.map((shelf_id) => ({ shelf_id, recipe_id: recipeId })));
    if (shelfError) console.error('publishRecipe: shelf_recipes insert', shelfError);
  }

  return recipeId;
}
