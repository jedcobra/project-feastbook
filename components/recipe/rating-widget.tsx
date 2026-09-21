'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchMyRating, rateRecipe } from '@/lib/supabase/queries';

// The star row in RecipeMeta only ever showed the aggregate — there was no
// way to actually rate a recipe. This is the one-tap action that writes a
// real per-person rating, same optimistic-update shape as CookedMarker.
export function RatingWidget({ recipeId, ratingCount }: { recipeId: string; ratingCount: number }) {
  const { profile } = useAuth();
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) fetchMyRating(profile.id, recipeId).then(setMyRating);
    else setMyRating(0);
  }, [profile, recipeId]);

  if (!profile) return null;

  const rate = async (stars: number) => {
    if (busy || stars === myRating) return;
    const prev = myRating;
    setBusy(true);
    setMyRating(stars);
    const ok = await rateRecipe(profile.id, recipeId, stars);
    setBusy(false);
    if (!ok) setMyRating(prev);
  };

  const filled = hover || myRating;

  return (
    <div className="mb-4 flex items-center gap-2.5 border-b border-dashed border-rule pb-2.5">
      <span className="flex-1 font-mono text-[11px] text-ink-mute">
        {myRating
          ? `You rated this ${myRating} star${myRating === 1 ? '' : 's'}`
          : ratingCount > 0
            ? `${ratingCount} rating${ratingCount === 1 ? '' : 's'} — add yours`
            : 'Be the first to rate this'}
      </span>
      <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => rate(n)}
            className={`font-mono text-[16px] leading-none ${filled >= n ? 'text-ink' : 'text-rule'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
