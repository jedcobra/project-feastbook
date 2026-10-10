'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/checkbox';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { addRecipesToShelf, fetchMyRecipesFull, fetchSavedRecipes } from '@/lib/supabase/queries';
import type { Recipe } from '@/lib/types';

interface AddRecipesToShelfSheetProps {
  ownerId: string;
  shelfId: string;
  existingRecipeIds: Set<string>;
  onAdded: (recipes: Recipe[]) => void;
  onClose: () => void;
}

// The empty shelf's "Add recipes": everything already in the cookbook —
// the owner's own recipes plus whatever they've saved — minus whatever's
// already filed here. No new-recipe flow here; that's /new.
export function AddRecipesToShelfSheet({
  ownerId,
  shelfId,
  existingRecipeIds,
  onAdded,
  onClose,
}: AddRecipesToShelfSheetProps) {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchMyRecipesFull(ownerId), fetchSavedRecipes(ownerId)]).then(([mine, saved]) => {
      const seen = new Set<string>();
      const list: Recipe[] = [];
      for (const r of [...mine, ...saved]) {
        if (seen.has(r.id) || existingRecipeIds.has(r.id)) continue;
        seen.add(r.id);
        list.push(r);
      }
      setRecipes(list);
    });
  }, [ownerId, existingRecipeIds]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAdd = async () => {
    if (selected.size === 0 || !recipes) return;
    setSaving(true);
    await addRecipesToShelf(ownerId, shelfId, [...selected]);
    setSaving(false);
    onAdded(recipes.filter((r) => selected.has(r.id)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-night/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] flex-col rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
      >
        <h3 className="mb-3 flex-shrink-0 font-display text-[19px] font-bold text-ink">Add recipes</h3>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {recipes === null ? (
            <div className="py-4 text-center font-mono text-[14px] text-ink-mute">Loading…</div>
          ) : recipes.length === 0 ? (
            <div className="py-4 text-center font-mono text-[14px] leading-[1.55] text-ink-mute">
              Nothing left to add — every recipe in your cookbook is already here.
            </div>
          ) : (
            recipes.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => toggle(r.id)}
                className={`flex w-full items-center gap-2.5 py-2.5 text-left ${i === 0 ? '' : 'border-t border-dotted border-rule'}`}
              >
                <Checkbox checked={selected.has(r.id)} />
                {r.coverPhotoUrl && <RecipeThumbnail src={r.coverPhotoUrl} alt={r.title} />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[14px] font-bold text-ink">{r.title}</span>
                  <span className="block font-mono text-[12px] text-ink-mute">
                    @{r.author} · {r.time}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>

        {recipes !== null && recipes.length > 0 && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || selected.size === 0}
            className="mt-3.5 w-full flex-shrink-0 rounded-button border border-ink bg-ink py-3 font-mono text-[14px] font-semibold text-cream disabled:opacity-60"
          >
            {saving ? 'Adding…' : `Add ${selected.size || ''} recipe${selected.size === 1 ? '' : 's'}`}
          </button>
        )}
      </div>
    </div>
  );
}
