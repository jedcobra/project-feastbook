'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/checkbox';
import { PlusIcon } from '@/components/icons';
import { NewShelfSheet, ShelfSheet } from '@/components/shelves/edit-shelf-sheet';
import { fetchShelfIdsForRecipe, fetchShelvesForOwner, setRecipeShelves } from '@/lib/supabase/queries';
import type { Shelf } from '@/lib/types';
import { EMOJI_FONT_CLASS } from '@/lib/shelf-emoji';

interface AddToShelfSheetProps {
  ownerId: string;
  recipeId: string;
  recipeTitle: string;
  onClose: () => void;
  onSaved: (shelved: boolean) => void;
}

// What the heart button opens once a recipe's already saved (a first
// save is a one-tap default to the "Saved" shelf instead — see
// quickSaveRecipe). A recipe can sit on 0..n of the viewer's own shelves;
// picking any at all is what keeps it "saved" (recipe_stats, feed
// activity, the Saved tab) — unchecking everything unsaves it.
export function AddToShelfSheet({ ownerId, recipeId, recipeTitle, onClose, onSaved }: AddToShelfSheetProps) {
  const [view, setView] = useState<'shelves' | 'newShelf'>('shelves');
  const [shelves, setShelves] = useState<Shelf[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchShelvesForOwner(ownerId), fetchShelfIdsForRecipe(recipeId)]).then(([own, onRecipe]) => {
      setShelves(own);
      setSelected(new Set(own.map((s) => s.id).filter((id) => onRecipe.has(id))));
    });
  }, [ownerId, recipeId]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSave = async () => {
    setSaving(true);
    await setRecipeShelves(ownerId, recipeId, [...selected]);
    setSaving(false);
    onSaved(selected.size > 0);
    onClose();
  };

  // New shelf… opens the same New shelf popup as everywhere else; once it's
  // made it's ticked here, ready to save the recipe onto.
  if (view === 'newShelf') {
    return (
      <NewShelfSheet
        onClose={() => setView('shelves')}
        onCreated={(shelf) => {
          setShelves((s) => [...(s ?? []), shelf]);
          setSelected((s) => new Set(s).add(shelf.id));
          setView('shelves');
        }}
      />
    );
  }

  return (
    <ShelfSheet title="Manage shelves" label={`Manage shelves for ${recipeTitle}`} onClose={onClose}>
      <div className="mb-3 truncate font-mono text-[12px] text-ink-mute">{recipeTitle}</div>

      {shelves === null ? (
        <div className="py-4 text-center font-mono text-[14px] text-ink-mute">Loading…</div>
      ) : (
        shelves.map((shelf) => (
          <button
            key={shelf.id}
            type="button"
            onClick={() => toggle(shelf.id)}
            className="flex w-full items-center gap-2.5 border-t border-dashed border-rule py-[11px] text-left"
          >
            <Checkbox checked={selected.has(shelf.id)} />
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[14px] text-ink">
                {shelf.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shelf.coverUrl}
                    alt=""
                    className="mr-1.5 inline-block h-4 w-4 -translate-y-px rounded-[3px] object-cover align-middle"
                  />
                ) : shelf.stickerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shelf.stickerUrl}
                    alt=""
                    className="mr-1.5 inline-block h-4 w-4 -translate-y-px object-contain align-middle"
                  />
                ) : (
                  shelf.emoji && <span className={`mr-1.5 ${EMOJI_FONT_CLASS}`}>{shelf.emoji}</span>
                )}
                {shelf.title}
              </span>
              <span className="block font-mono text-[12px] text-ink-mute">
                {shelf.count} recipe{shelf.count === 1 ? '' : 's'}
              </span>
            </span>
          </button>
        ))
      )}

      <button
        type="button"
        onClick={() => setView('newShelf')}
        className="mb-3.5 flex w-full items-center gap-2.5 border-y border-dashed border-rule py-[11px] text-left"
      >
        <PlusIcon size={15} className="text-ink" />
        <span className="font-mono text-[14px] text-ink">New shelf…</span>
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || shelves === null}
        className="w-full rounded-button border border-ink bg-ink py-3 font-mono text-[14px] font-semibold text-cream disabled:opacity-60"
      >
        {saving ? 'Saving…' : `Save to ${selected.size} ${selected.size === 1 ? 'shelf' : 'shelves'}`}
      </button>
    </ShelfSheet>
  );
}
