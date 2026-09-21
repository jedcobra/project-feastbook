// Default unit system for a recipe's ingredient list — per-browser only,
// same pattern as keep-awake.ts. A recipe page can still override it for
// that viewing; this is just what it starts on.

import type { UnitSystem } from '@/lib/ingredient-scaling';

const KEY = 'ss-units-preference';

export function getUnitsPreference(): UnitSystem {
  if (typeof window === 'undefined') return 'original';
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === 'metric' || raw === 'imperial' ? raw : 'original';
  } catch {
    return 'original';
  }
}

export function setUnitsPreference(system: UnitSystem) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, system);
  } catch {
    // Ignore — worst case the preference just doesn't persist.
  }
}
