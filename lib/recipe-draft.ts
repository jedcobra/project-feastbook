// In-progress recipe drafts, persisted to localStorage keyed by id — no
// drafts table in Supabase yet, so these are per-browser only. A draft with
// no real content typed into it is never persisted, so the drafts list
// (7g) only ever shows things someone actually started.

import { splitIngredientLine } from '@/lib/ingredient-scaling';
import type { ImportedRecipe } from '@/lib/recipe-import';
import type { Recipe, Visibility } from '@/lib/types';

export type DraftSource = 'manual' | 'link' | 'photo' | 'paste';

export interface DraftIngredientItem {
  q: string;
  i: string;
}

export interface DraftIngredientSection {
  section: string;
  items: DraftIngredientItem[];
}

export interface DraftStep {
  t: string;
  d: string;
  timer: string;
}

export interface RecipeDraft {
  id: string;
  source: DraftSource;
  updatedAt: string;
  title: string;
  subtitle: string;
  intro: string;
  time: string;
  serves: string;
  level: 'Easy' | 'Medium' | 'Hard';
  sections: DraftIngredientSection[];
  steps: DraftStep[];
  notes: string;
  tags: string[];
  sourceUrl?: string;
  // Set when this draft is editing an already-published recipe (7i) rather
  // than composing a new one — Publish updates that recipe instead of
  // inserting, and the Drafts list (7g) hides these since the recipe isn't
  // actually unpublished.
  editId?: string;
  visibility?: Visibility;
}

export function createDraft(source: DraftSource = 'manual', sourceUrl?: string): RecipeDraft {
  return {
    id: crypto.randomUUID(),
    source,
    updatedAt: new Date().toISOString(),
    title: '',
    subtitle: '',
    intro: '',
    time: '',
    serves: '',
    level: 'Easy',
    sections: [{ section: '', items: [{ q: '', i: '' }] }],
    steps: [{ t: '', d: '', timer: '' }],
    notes: '',
    tags: [],
    sourceUrl,
  };
}

// Seeds a composer draft from an already-published recipe, for editing (7i).
export function draftFromRecipe(recipe: Recipe): RecipeDraft {
  return {
    id: crypto.randomUUID(),
    source: 'manual',
    updatedAt: new Date().toISOString(),
    title: recipe.title,
    subtitle: recipe.subtitle,
    intro: recipe.intro,
    time: recipe.time,
    serves: String(recipe.serves),
    level: recipe.difficulty,
    sections:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((s) => ({
            section: s.section ?? '',
            items: s.items.length > 0 ? s.items.map((it) => ({ q: it.q, i: it.i })) : [{ q: '', i: '' }],
          }))
        : [{ section: '', items: [{ q: '', i: '' }] }],
    steps:
      recipe.steps.length > 0
        ? recipe.steps.map((s) => ({ t: s.t, d: s.d, timer: s.timer != null ? String(s.timer) : '' }))
        : [{ t: '', d: '', timer: '' }],
    notes: recipe.notes.map((n) => n.text).join('\n'),
    tags: recipe.tags,
    editId: recipe.id,
    visibility: recipe.visibility,
  };
}

// Seeds a composer draft from a parsed import — a URL fetch or a pasted
// block of text — or, when parsing found nothing, from just whatever
// partial title/description got recovered (every field can be empty
// except sourceUrl, which is enough on its own to count as "something
// worth keeping" — see isDraftEmpty below). `source` records which path
// it came from; `sourceUrl` only applies to the link path.
export function draftFromImport(
  parsed: Partial<ImportedRecipe>,
  source: DraftSource,
  sourceUrl?: string,
): RecipeDraft {
  const ingredients = parsed.ingredients ?? [];
  const steps = parsed.steps ?? [];
  return {
    id: crypto.randomUUID(),
    source,
    updatedAt: new Date().toISOString(),
    title: parsed.title ?? '',
    subtitle: parsed.subtitle ?? '',
    intro: parsed.intro ?? '',
    time: parsed.time ?? '',
    serves: parsed.serves ?? '',
    level: 'Easy',
    sections: [
      {
        section: '',
        items:
          ingredients.length > 0
            ? ingredients.map((line) => {
                const { quantity, name } = splitIngredientLine(line);
                return { q: quantity, i: name };
              })
            : [{ q: '', i: '' }],
      },
    ],
    steps:
      steps.length > 0
        ? steps.map((d, i) => ({ t: `Step ${i + 1}`, d, timer: '' }))
        : [{ t: '', d: '', timer: '' }],
    notes: '',
    tags: parsed.tags ?? [],
    sourceUrl,
  };
}

const KEY = 'ss-recipe-drafts';

function loadAll(): Record<string, RecipeDraft> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(drafts: Record<string, RecipeDraft>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(drafts));
  } catch {
    // Ignore — worst case a draft just isn't persisted.
  }
}

export function listDrafts(): RecipeDraft[] {
  return Object.values(loadAll()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// Drafts that represent an actual unfinished new recipe (7g) — excludes
// edit-in-progress drafts of an already-published recipe (7i), which are
// drafts under the hood but shouldn't show up or count as "unfinished".
export function listUnstartedDrafts(): RecipeDraft[] {
  return listDrafts().filter((d) => !d.editId);
}

export function loadDraft(id: string): RecipeDraft | null {
  return loadAll()[id] ?? null;
}

// No-op for an empty draft (nothing worth keeping) — deletes it if it was
// previously persisted, e.g. someone typed something then cleared it again.
export function saveDraft(draft: RecipeDraft) {
  if (isDraftEmpty(draft)) {
    deleteDraft(draft.id);
    return;
  }
  const all = loadAll();
  all[draft.id] = { ...draft, updatedAt: new Date().toISOString() };
  saveAll(all);
}

export function deleteDraft(id: string) {
  const all = loadAll();
  if (!(id in all)) return;
  delete all[id];
  saveAll(all);
}

function isDraftEmpty(draft: RecipeDraft): boolean {
  const hasText = [draft.title, draft.subtitle, draft.intro, draft.notes].some((v) => v.trim());
  const hasIngredient = draft.sections.some(
    (s) => s.section.trim() || s.items.some((it) => it.q.trim() || it.i.trim()),
  );
  const hasStep = draft.steps.some((s) => s.t.trim() || s.d.trim() || s.timer.trim());
  // A saved source link is content worth keeping on its own — a "just save
  // the link" import with nothing else recovered shouldn't vanish.
  return !hasText && !hasIngredient && !hasStep && draft.tags.length === 0 && !draft.sourceUrl;
}

export function draftCounts(draft: RecipeDraft) {
  const ingredientCount = draft.sections.reduce(
    (n, s) => n + s.items.filter((it) => it.i.trim()).length,
    0,
  );
  const stepCount = draft.steps.filter((s) => s.t.trim()).length;
  return { ingredientCount, stepCount };
}

export function draftProgress(draft: RecipeDraft): number {
  const filled = [draft.title, draft.sections[0]?.items[0]?.i, draft.steps[0]?.t].filter((v) => v?.trim()).length;
  return Math.round((filled / 3) * 100);
}
