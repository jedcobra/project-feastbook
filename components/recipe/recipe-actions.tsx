'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { HeartIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { AddToShelfSheet } from '@/components/shelves/add-to-shelf-sheet';
import {
  fetchMyRating,
  hasCooked,
  isSaved,
  quickSaveRecipe,
  rateRecipe,
  setCooked,
} from '@/lib/supabase/queries';
import type { Recipe } from '@/lib/types';

// The recipe's three one-tap actions in one row — cooked it, rate it, save
// it — each with its own count sitting directly above it. One grid holds
// both rows so every stat stays centered over its own control.
export function RecipeActions({ recipe, authorId }: { recipe: Recipe; authorId: string }) {
  const { profile } = useAuth();

  const [cooked, setCookedState] = useState(false);
  const [cookedCount, setCookedCount] = useState(recipe.madeIt);
  const [cookBusy, setCookBusy] = useState(false);

  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [rateBusy, setRateBusy] = useState(false);
  // Kept as a running total rather than the average itself, so a new or
  // changed rating can update the shown average without a refetch.
  const [ratingSum, setRatingSum] = useState(recipe.rating * recipe.ratingCount);
  const [ratingCount, setRatingCount] = useState(recipe.ratingCount);

  const [saved, setSavedState] = useState(false);
  const [saveCount, setSaveCount] = useState(recipe.saves);
  const [saveBusy, setSaveBusy] = useState(false);
  const [shelfSheetOpen, setShelfSheetOpen] = useState(false);

  useEffect(() => {
    if (!profile) {
      setCookedState(false);
      setMyRating(0);
      setSavedState(false);
      return;
    }
    hasCooked(profile.id, recipe.id).then(setCookedState);
    fetchMyRating(profile.id, recipe.id).then(setMyRating);
    isSaved(profile.id, recipe.id).then(setSavedState);
  }, [profile, recipe.id]);

  if (!profile) return null;

  const isOwner = profile.id === authorId;

  const toggleCooked = async () => {
    if (cookBusy) return;
    const next = !cooked;
    setCookBusy(true);
    setCookedState(next);
    setCookedCount((c) => Math.max(0, c + (next ? 1 : -1)));
    const ok = await setCooked(profile.id, recipe.id, next, authorId);
    setCookBusy(false);
    if (!ok) {
      setCookedState(!next);
      setCookedCount((c) => Math.max(0, c + (next ? -1 : 1)));
    }
  };

  const rate = async (stars: number) => {
    if (rateBusy || stars === myRating) return;
    const prev = myRating;
    setRateBusy(true);
    setMyRating(stars);
    setRatingSum((s) => s - prev + stars);
    if (!prev) setRatingCount((c) => c + 1);
    const ok = await rateRecipe(profile.id, recipe.id, stars);
    setRateBusy(false);
    if (!ok) {
      setMyRating(prev);
      setRatingSum((s) => s - stars + prev);
      if (!prev) setRatingCount((c) => c - 1);
    }
  };

  // Unsaved: one tap files it on "Saved". Saved: the same tap opens the
  // shelf picker, where a different shelf (or removing it) is one tap away.
  const tapHeart = async () => {
    if (saved) {
      setShelfSheetOpen(true);
      return;
    }
    if (saveBusy) return;
    setSaveBusy(true);
    setSavedState(true);
    setSaveCount((c) => c + 1);
    const ok = await quickSaveRecipe(profile.id, recipe.id);
    setSaveBusy(false);
    if (!ok) {
      setSavedState(false);
      setSaveCount((c) => Math.max(0, c - 1));
    }
  };

  const onShelvesSaved = (shelved: boolean) => {
    if (shelved !== saved) setSaveCount((c) => Math.max(0, c + (shelved ? 1 : -1)));
    setSavedState(shelved);
  };

  const filled = hover || myRating;
  const average = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null;
  const stat = 'font-mono text-[11px] text-ink-mute';

  return (
    <>
      <div className="my-3.5 grid grid-cols-[auto_1fr_auto] items-center justify-items-center gap-x-3 gap-y-1.5 border-y border-dashed border-rule py-3">
        <span className={stat}>{cookedCount} cooked</span>
        <span className={stat}>
          {average ? `${average} ★ · ${ratingCount} rating${ratingCount === 1 ? '' : 's'}` : 'No ratings yet'}
        </span>
        <span className={stat}>
          {saveCount} save{saveCount === 1 ? '' : 's'}
        </span>

        {/* Sized for the wider "✓ Cooked it" so toggling never shifts the stars. */}
        <OutlineBox compact filled={cooked} onClick={toggleCooked} className="min-w-[96px] justify-center">
          {cooked ? '✓ Cooked it' : 'Cooked it'}
        </OutlineBox>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => rate(n)}
              className={`font-mono text-[32px] leading-none ${filled >= n ? 'text-ink' : 'text-rule'}`}
            >
              ★
            </button>
          ))}
        </div>
        {isOwner ? (
          // Your own recipe is already in your cookbook — nothing to save,
          // but the count stays so the row reads the same either way.
          <span aria-hidden className="text-rule">
            <HeartIcon size={22} />
          </span>
        ) : (
          <button
            type="button"
            aria-label={saved ? 'Manage shelves' : 'Save'}
            aria-pressed={saved}
            onClick={tapHeart}
            className={saved ? 'text-accent' : 'text-ink'}
          >
            <HeartIcon size={22} filled={saved} />
          </button>
        )}
      </div>

      {shelfSheetOpen && (
        <AddToShelfSheet
          ownerId={profile.id}
          recipeId={recipe.id}
          recipeTitle={recipe.title}
          onSaved={onShelvesSaved}
          onClose={() => setShelfSheetOpen(false)}
        />
      )}
    </>
  );
}
