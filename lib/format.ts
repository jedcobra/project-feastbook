export function formatCount(n: number): string {
  return n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export const MAX_SERVINGS = 20;

// Clamps a servings text-field value to [1, MAX_SERVINGS] once it parses to
// a whole number — left alone while it's empty or not yet a number (e.g.
// mid-keystroke) so typing isn't fought.
export function clampServingsInput(v: string): string {
  const trimmed = v.trim();
  if (trimmed === '') return trimmed;
  const n = parseInt(trimmed, 10);
  if (!Number.isFinite(n)) return trimmed;
  return String(Math.min(MAX_SERVINGS, Math.max(1, n)));
}

// Hours+minutes -> the same "25 min" / "1 hr" / "1 hr 30 min" display text
// used throughout the app (recipe cards, meta rows, imported recipes).
export function formatDuration(hours: number, minutes: number): string {
  const h = Math.max(0, Math.floor(hours) || 0);
  const m = Math.max(0, Math.floor(minutes) || 0);
  if (h === 0 && m === 0) return '';
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

// The inverse, lenient enough to read back a value this app wrote itself
// (see above) as well as older free-typed drafts/imports — a bare number
// with no unit is read as minutes.
export function parseDuration(time: string): { hours: number; minutes: number } {
  const hMatch = time.match(/(\d+)\s*h/i);
  const mMatch = time.match(/(\d+)\s*m/i);
  if (hMatch || mMatch) {
    return { hours: parseInt(hMatch?.[1] ?? '0', 10), minutes: parseInt(mMatch?.[1] ?? '0', 10) };
  }
  const bare = parseInt(time, 10);
  return Number.isFinite(bare) && bare > 0 ? { hours: 0, minutes: bare } : { hours: 0, minutes: 0 };
}

// Total minutes for sorting/filtering by time — a plain parseInt on "1 hr
// 30 min" reads as 1, which is wrong the moment an hour is involved.
export function parseDurationMinutes(time: string): number {
  const { hours, minutes } = parseDuration(time);
  return hours * 60 + minutes;
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
