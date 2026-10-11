'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { PlusIcon, TrashIcon, XIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { AddRecipesToShelfSheet } from '@/components/shelves/add-recipes-to-shelf-sheet';
import { ShelfForm } from '@/components/shelves/new-shelf-form';
import { createShelf, deleteShelf, removeRecipeFromShelf, updateShelf } from '@/lib/supabase/queries';
import type { Recipe, Shelf } from '@/lib/types';

// Everything about one of your shelves, edited from the cookbook without
// leaving it: name, icon, description and who can see it; taking recipes
// off or adding more; deleting it. Changes are passed up as they're saved
// so the shelf behind the sheet updates straight away.
export function EditShelfSheet({
  shelf,
  recipes,
  onChange,
  onDeleted,
  onClose,
}: {
  shelf: Shelf;
  // The shelf's recipes, in its order.
  recipes: Recipe[];
  onChange: (shelf: Shelf) => void;
  onDeleted: () => void;
  onClose: () => void;
}) {
  const { profile } = useAuth();
  const [adding, setAdding] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const existingIds = useMemo(() => new Set(shelf.recipes.map((r) => r.id)), [shelf.recipes]);

  const remove = (recipe: Recipe) => {
    onChange({
      ...shelf,
      count: Math.max(0, shelf.count - 1),
      recipes: shelf.recipes.filter((r) => r.id !== recipe.id),
    });
    void removeRecipeFromShelf(shelf.id, recipe.id);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    const ok = await deleteShelf(shelf.id);
    setDeleting(false);
    if (ok) onDeleted();
    else setError("Couldn't delete the shelf — try again.");
  };

  if (adding && profile) {
    return (
      <AddRecipesToShelfSheet
        ownerId={profile.id}
        shelfId={shelf.id}
        existingRecipeIds={existingIds}
        onAdded={(added) =>
          onChange({
            ...shelf,
            count: shelf.count + added.length,
            recipes: [...added.map((r) => ({ id: r.id, title: r.title })), ...shelf.recipes],
          })
        }
        onClose={() => setAdding(false)}
      />
    );
  }

  return (
    <ShelfSheet title="Edit shelf" label={`Edit ${shelf.title}`} onClose={onClose}>
      <ShelfForm
        initial={{
          title: shelf.title,
          subtitle: shelf.subtitle,
          visibility: shelf.visibility,
          emoji: shelf.emoji ?? null,
          coverUrl: shelf.coverUrl ?? null,
          stickerUrl: shelf.stickerUrl ?? null,
        }}
        recipePhotos={recipes.flatMap((r) =>
          r.coverPhotoUrl ? [{ id: r.id, title: r.title, url: r.coverPhotoUrl }] : [],
        )}
        submitLabel="Save changes"
        submittingLabel="Saving…"
        // The heart button finds its default shelf by this exact name.
        titleLocked={shelf.title === 'Saved' ? 'Your heart button saves here, so this name stays.' : undefined}
        onSubmit={async (values) => {
          const ok = await updateShelf(shelf.id, values);
          if (ok) onChange({ ...shelf, ...values });
          return ok;
        }}
      />

      <div className="mt-6">
        <Label className="mb-2 text-[11px]">On this shelf</Label>
        {recipes.length === 0 ? (
          <div className="border-t border-dashed border-rule py-2.5 font-mono text-[12px] text-ink-mute">
            Nothing on this shelf yet.
          </div>
        ) : (
          recipes.map((r) => (
            <div key={r.id} className="flex items-center gap-2.5 border-t border-dashed border-rule py-2.5">
              {r.coverPhotoUrl && <RecipeThumbnail src={r.coverPhotoUrl} alt={r.title} />}
              <span className="min-w-0 flex-1 truncate font-display text-[15px] font-bold text-ink">{r.title}</span>
              <button
                type="button"
                onClick={() => remove(r)}
                className="flex-shrink-0 font-mono text-[12px] text-accent"
              >
                Remove
              </button>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex w-full items-center justify-center gap-1.5 border border-dashed border-rule py-3 font-mono text-[14px] text-ink-mute"
        >
          <PlusIcon size={13} />
          Add recipes
        </button>
      </div>

      <div className="mt-6 border-t border-dashed border-rule pt-4">
        {error && <div className="mb-2 font-mono text-[12px] text-accent">{error}</div>}
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-2.5 font-mono text-[14px] text-accent"
          >
            <TrashIcon size={16} />
            Delete shelf
          </button>
        ) : (
          <div className="border border-accent p-3">
            <div className="mb-2.5 font-mono text-[12px] leading-[1.55] text-ink">
              Delete &ldquo;{shelf.title}&rdquo;?{' '}
              {recipes.length > 0
                ? `The ${recipes.length} recipe${recipes.length === 1 ? '' : 's'} on it stay in your cookbook — this just removes the shelf.`
                : 'This can’t be undone.'}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 rounded-button border border-ink bg-transparent py-2 font-mono text-[14px] text-ink"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-button border border-accent bg-accent py-2 font-mono text-[14px] text-cream disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ShelfSheet>
  );
}

// The bottom sheet both shelf sheets share: a title, a close button, and a
// scrolling body.
function ShelfSheet({
  title,
  label,
  onClose,
  children,
}: {
  title: string;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-night/30" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] flex-col rounded-t-2xl border-t border-ink bg-cream"
      >
        <div className="flex flex-shrink-0 items-center justify-between px-5 pb-3 pt-4">
          <h3 className="font-display text-[19px] font-bold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink text-ink"
          >
            <XIcon size={12} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}

// A new shelf, made from the cookbook in the same sheet as editing one.
// Once it's created the caller swaps this for the shelf's Edit sheet, so
// recipes can go straight onto it.
export function NewShelfSheet({ onCreated, onClose }: { onCreated: (shelf: Shelf) => void; onClose: () => void }) {
  const { profile } = useAuth();
  return (
    <ShelfSheet title="New shelf" label="New shelf" onClose={onClose}>
      <ShelfForm
        submitLabel="Create shelf"
        submittingLabel="Creating…"
        onSubmit={async (values) => {
          if (!profile) return false;
          const { title, subtitle, visibility, emoji, coverUrl, stickerUrl } = values;
          const created = await createShelf(profile.id, title, subtitle, visibility, emoji, coverUrl, stickerUrl);
          if (created) onCreated({ id: created.id, ...values, count: 0, recipes: [] });
          return !!created;
        }}
      />
    </ShelfSheet>
  );
}
