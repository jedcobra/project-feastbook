// A single in-progress recipe draft, persisted to localStorage so the
// composer (/new/edit) and publish sheet (/new/publish) share state across
// navigation. There's no drafts list or multi-draft support yet (7g) — one
// slot is enough for now.

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

export function emptyDraft(sourceUrl?: string): RecipeDraft {
  return {
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

const KEY = 'ss-recipe-draft';

export function loadDraft(): RecipeDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: RecipeDraft) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Ignore — worst case the draft just isn't persisted across a refresh.
  }
}

export function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}

export function draftCounts(draft: RecipeDraft) {
  const ingredientCount = draft.sections.reduce(
    (n, s) => n + s.items.filter((it) => it.i.trim()).length,
    0,
  );
  const stepCount = draft.steps.filter((s) => s.t.trim()).length;
  return { ingredientCount, stepCount };
}
