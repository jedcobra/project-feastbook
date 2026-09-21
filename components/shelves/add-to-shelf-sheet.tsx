'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/checkbox';
import { PlusIcon } from '@/components/icons';
import { NewShelfForm } from '@/components/shelves/new-shelf-form';
import { fetchShelfIdsForRecipe, fetchShelvesForOwner, setRecipeShelves } from '@/lib/supabase/queries';
import type { Shelf } from '@/lib/types';

interface AddToShelfSheetProps {
  ownerId: string;
  recipeId: string;
  recipeTitle: string;
  onClose: () => void;
  onSaved: (shelved: boolean) => void;
}

// What the bookmark button opens once a recipe's already saved (a first
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

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4">
        {view === 'shelves' ? (
          <>
            <h3 className="mb-0.5 font-display text-[19px] font-bold text-ink">Manage shelves</h3>
            <div className="mb-3 truncate font-mono text-[11px] text-ink-mute">{recipeTitle}</div>

            {shelves === null ? (
              <div className="py-4 text-center font-mono text-[12px] text-ink-mute">Loading…</div>
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
                    <span className="block font-mono text-[12.5px] text-ink">{shelf.title}</span>
                    <span className="block font-mono text-[10.5px] text-ink-mute">{shelf.count} recipes</span>
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
              <span className="font-mono text-[12.5px] text-ink">New shelf…</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || shelves === null}
              className="w-full rounded-button border border-ink bg-ink py-3 font-mono text-[13px] font-semibold text-cream disabled:opacity-60"
            >
              {saving ? 'Saving…' : `Save to ${selected.size} shelf${selected.size === 1 ? '' : 'ves'}`}
            </button>
          </>
        ) : (
          <>
            <h3 className="mb-3 font-display text-[19px] font-bold text-ink">New shelf</h3>
            <NewShelfForm
              onCreated={(shelf) => {
                setShelves((s) => [...(s ?? []), { id: shelf.id, title: shelf.title, subtitle: '', visibility: 'private', count: 0, recipes: [] }]);
                setSelected((s) => new Set(s).add(shelf.id));
                setView('shelves');
              }}
            />
            <button
              type="button"
              onClick={() => setView('shelves')}
              className="mt-3 w-full border-t border-dashed border-rule pt-3 text-center font-mono text-[12px] text-ink-mute"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
