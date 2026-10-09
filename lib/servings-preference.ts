// Default serving count a recipe's ingredient list scales to on open —
// per-browser only, same pattern as units-preference.ts. A recipe page can
// still override it for that viewing; this is just what it starts on.
// null means "as written" — use the recipe's own serving count.

const KEY = 'ss-servings-preference';

export function getServingsPreference(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isInteger(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function setServingsPreference(servings: number | null) {
  if (typeof window === 'undefined') return;
  try {
    if (servings === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, String(servings));
  } catch {
    // Ignore — worst case the preference just doesn't persist.
  }
}
