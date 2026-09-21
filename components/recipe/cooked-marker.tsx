'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { OutlineBox } from '@/components/outline-box';
import { hasCooked, setCooked } from '@/lib/supabase/queries';

// A one-tap "I cooked it" right on the recipe itself — previously the only
// way to mark a recipe cooked was to also write a note, which buried the
// action and made it easy to tap "I cooked it" in the composer, not
// actually post anything, and have nothing recorded. This writes the same
// made_it row on its own, no note required.
export function CookedMarker({
  recipeId,
  authorId,
  madeIt,
}: {
  recipeId: string;
  authorId: string;
  madeIt: number;
}) {
  const { profile } = useAuth();
  const [cooked, setCookedState] = useState(false);
  const [count, setCount] = useState(madeIt);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) hasCooked(profile.id, recipeId).then(setCookedState);
    else setCookedState(false);
  }, [profile, recipeId]);

  if (!profile) return null;

  const toggle = async () => {
    if (busy) return;
    const next = !cooked;
    setBusy(true);
    setCookedState(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    const ok = await setCooked(profile.id, recipeId, next, authorId);
    setBusy(false);
    if (!ok) {
      // Roll back the optimistic update — the write didn't actually land.
      setCookedState(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    }
  };

  return (
    <div className="mb-4 flex items-center gap-2.5 border-y border-dashed border-rule py-2.5">
      <span className="flex-1 font-mono text-[11px] text-ink-mute">
        {count} {count === 1 ? 'person has' : 'people have'} cooked this
      </span>
      <OutlineBox compact filled={cooked} onClick={toggle}>
        {cooked ? '✓ Cooked it' : 'I cooked it'}
      </OutlineBox>
    </div>
  );
}
