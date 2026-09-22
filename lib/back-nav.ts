'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Returns to wherever the visitor actually came from (real browser history)
// instead of pushing a fresh entry for a page they were just on. Pushing a
// "closed" screen's own caller is what breaks the physical back button
// afterwards: e.g. recipe -> cooking mode -> "X" (push recipe again) ->
// recipe -> back now pops to cooking mode instead of whatever was open
// before the recipe, since the push left a duplicate entry in the stack.
// Falls back to a fixed route only when there's genuinely no history to
// pop to (a deep link) — same rule BackButton uses for the same reason.
export function useBackNav() {
  const router = useRouter();
  return useCallback(
    (fallbackHref: string) => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackHref);
      }
    },
    [router],
  );
}
