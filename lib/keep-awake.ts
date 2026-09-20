// Whether Cooking Mode should request a screen wake lock — per-browser
// only, same pattern as search-history.ts. Defaults on: the design's
// stated default for "Keep screen awake while cooking" is On.

const KEY = 'ss-keep-awake';

export function getKeepAwake(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function setKeepAwake(on: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // Ignore — worst case the preference just doesn't persist.
  }
}
