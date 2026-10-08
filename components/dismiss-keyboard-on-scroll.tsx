'use client';

import { useEffect } from 'react';

// Mounted once at the root. Swiping the screen anywhere outside the
// focused field closes the on-screen keyboard, same as iMessage et al —
// scrolling inside the field itself (e.g. a long note) doesn't count,
// only a swipe on the surrounding page.
export function DismissKeyboardOnScroll() {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      const active = document.activeElement;
      if (!(active instanceof HTMLInputElement) && !(active instanceof HTMLTextAreaElement)) return;
      if (e.target instanceof Node && active.contains(e.target)) return;
      active.blur();
    };
    document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true });
    return () => document.removeEventListener('touchmove', handleTouchMove, { capture: true });
  }, []);

  return null;
}
