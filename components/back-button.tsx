'use client';

import { useRouter } from 'next/navigation';
import { BackIcon } from '@/components/icons';
import { outlineBoxClasses } from '@/components/outline-box';

// Pops one level of browser history — mirrors the prototype's per-tab stack
// (real router history stands in for the localStorage stack). Falls back to
// a fixed route when there's nowhere to pop back to (e.g. a deep link).
export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button type="button" onClick={handleClick} aria-label="Back" className={outlineBoxClasses(true)}>
      <BackIcon size={14} weight={1.8} />
    </button>
  );
}
