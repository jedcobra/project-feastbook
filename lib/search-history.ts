// Recent searches, persisted to localStorage — per-browser only, same
// pattern as recipe-draft.ts. Nothing server-side needs this.

const KEY = 'ss-recent-searches';
const MAX = 8;

export function listRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  const q = query.trim();
  if (!q) return;
  try {
    const next = [q, ...listRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Ignore — worst case recent searches just don't persist.
  }
}

export function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const next = listRecentSearches().filter((s) => s.toLowerCase() !== query.toLowerCase());
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Ignore.
  }
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}
