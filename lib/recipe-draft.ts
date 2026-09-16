// In-progress recipe drafts, persisted to localStorage keyed by id — no
// drafts table in Supabase yet, so these are per-browser only. A draft with
// no real content typed into it is never persisted, so the drafts list
// (7g) only ever shows things someone actually started.

export type DraftSource = 'manual' | 'link' | 'photo';

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
  return !hasText && !hasIngredient && !hasStep && draft.tags.length === 0;
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
