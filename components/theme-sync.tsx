'use client';

import { useEffect } from 'react';
import { applyTheme, getThemePreference } from '@/lib/theme';

// Keeps "Match phone" in step when the phone switches between light and
// dark while the app is open.
export function ThemeSync() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (getThemePreference() === 'system') applyTheme('system');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return null;
}
