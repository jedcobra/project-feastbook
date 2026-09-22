'use client';

import { BackIcon } from '@/components/icons';
import { outlineBoxClasses } from '@/components/outline-box';
import { useBackNav } from '@/lib/back-nav';

// Pops one level of browser history — mirrors the prototype's per-tab stack
// (real router history stands in for the localStorage stack). Falls back to
// a fixed route when there's nowhere to pop back to (e.g. a deep link).
// `onBack`, when given, replaces that entirely — for screens like the guided
// wizard where "back" means the previous in-page step, not history.
export function BackButton({ fallbackHref, onBack }: { fallbackHref: string; onBack?: () => void }) {
  const goBack = useBackNav();
  const handleClick = () => (onBack ? onBack() : goBack(fallbackHref));

  return (
    <button type="button" onClick={handleClick} aria-label="Back" className={outlineBoxClasses(true)}>
      <BackIcon size={14} weight={1.8} />
    </button>
  );
}
