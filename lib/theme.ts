// Light / dark appearance — per-browser, same pattern as units-preference.ts.
// 'system' follows the phone's own setting and keeps following it if that
// changes. The `dark` class on <html> swaps the palette (globals.css); an
// inline script in the root layout applies it before first paint so there's
// no flash of the light theme.

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_KEY = 'ss-theme';

// The browser bar / status bar tint for each theme — the page background.
const THEME_COLOR = { light: '#F4EEDD', dark: '#16162B' };

export function getThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return raw === 'dark' || raw === 'system' ? raw : 'light';
  } catch {
    return 'light';
  }
}

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(pref: ThemePreference = getThemePreference()) {
  if (typeof document === 'undefined') return;
  const dark = pref === 'dark' || (pref === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = dark ? THEME_COLOR.dark : THEME_COLOR.light;
}

export function setThemePreference(pref: ThemePreference) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_KEY, pref);
  } catch {
    // Ignore — worst case the preference just doesn't persist.
  }
  applyTheme(pref);
}

// Runs inline in <head> before the page paints (see app/layout.tsx), so it
// can't import anything — it repeats the logic above in plain JS.
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('${THEME_KEY}');var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');var m=document.createElement('meta');m.name='theme-color';m.content=d?'${THEME_COLOR.dark}':'${THEME_COLOR.light}';document.head.appendChild(m);}catch(e){}})();`;
