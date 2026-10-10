'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronIcon, HeartIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { DragHandle, ReorderBar, useLongPressReorder } from '@/components/profile/long-press-reorder';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { SwipeableRow } from '@/components/swipeable-row';
import { Tag } from '@/components/tag';
import { deleteRecipe, deleteShelf, fetchRecipeDeleteImpact, setShelfArchived } from '@/lib/supabase/queries';
import { sortByCookbookOrder } from '@/lib/cookbook-order';
import { formatCount } from '@/lib/format';
import type { CookedRecipe, Recipe, Shelf } from '@/lib/types';

type TabId = 'recipes' | 'shelves' | 'cooked';

export function ProfileTabs({
  shelves,
  recipes,
  savedRecipes = [],
  cookedRecipes = [],
  archivedShelfCount = 0,
  ownerHandle,
  isOwn,
  recipeOrder = [],
  onReorderRecipes,
  onReorderShelves,
  onRecipeDeleted,
  onShelfRemoved,
  onShelfArchived,
}: {
  shelves: Shelf[];
  recipes: Recipe[];
  savedRecipes?: Recipe[];
  cookedRecipes?: CookedRecipe[];
  archivedShelfCount?: number;
  ownerHandle: string;
  isOwn: boolean;
  recipeOrder?: string[];
  onReorderRecipes?: (recipeIds: string[]) => void;
  onReorderShelves?: (shelfIds: string[]) => void;
  onRecipeDeleted?: (recipeId: string) => void;
  onShelfRemoved?: (shelfId: string) => void;
  onShelfArchived?: (shelfId: string) => void;
}) {
  const [tab, setTab] = useState<TabId>('recipes');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'recipes', label: 'Recipes' },
    { id: 'shelves', label: 'Shelves' },
    { id: 'cooked', label: 'Cooked' },
  ];

  return (
    <div>
      <div className="mx-5 grid grid-cols-3 border-b border-dashed border-rule">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 py-2.5 text-center font-mono text-[14px] ${
              tab === t.id
                ? 'border-ink font-semibold text-ink'
                : 'border-transparent font-normal text-ink-mute'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'recipes' && (
        <RecipesTab
          recipes={recipes}
          savedRecipes={savedRecipes}
          isOwn={isOwn}
          recipeOrder={recipeOrder}
          onReorder={isOwn ? onReorderRecipes : undefined}
          onRecipeDeleted={onRecipeDeleted}
        />
      )}
      {tab === 'shelves' && (
        <ShelvesTab
          shelves={shelves}
          isOwn={isOwn}
          archivedShelfCount={archivedShelfCount}
          onReorder={isOwn ? onReorderShelves : undefined}
          onShelfRemoved={onShelfRemoved}
          onShelfArchived={onShelfArchived}
        />
      )}
      {tab === 'cooked' && <CookedTab recipes={cookedRecipes} ownerHandle={ownerHandle} />}
    </div>
  );
}

// Own shelves can be swiped left to archive (instant, reversible from the
// Archived list) or delete (a shelf's recipes aren't going anywhere, so a
// swipe plus one confirm tap is enough — no async impact check needed,
// unlike a recipe). Someone else's shelves aren't yours to touch here.
// Like Recipes, a long press on your own shelves switches to reorder mode.
function ShelvesTab({
  shelves,
  isOwn,
  archivedShelfCount,
  onReorder,
  onShelfRemoved,
  onShelfArchived,
}: {
  shelves: Shelf[];
  isOwn: boolean;
  archivedShelfCount: number;
  onReorder?: (shelfIds: string[]) => void;
  onShelfRemoved?: (shelfId: string) => void;
  onShelfArchived?: (shelfId: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const reorder = useLongPressReorder({
    ids: shelves.map((s) => s.id),
    onReorder,
    onStart: () => setOpenId(null),
  });

  const handleArchive = async (shelfId: string) => {
    onShelfRemoved?.(shelfId);
    onShelfArchived?.(shelfId);
    await setShelfArchived(shelfId, true);
  };

  const confirmingShelf = confirmingId ? shelves.find((s) => s.id === confirmingId) : undefined;

  const shelfBody = (shelf: Shelf) => (
    <>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-ink">
        <span className="font-mono text-[14px] font-semibold text-ink">{shelf.count}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-0.5 font-display text-[17px] font-bold text-ink">{shelf.title}</h3>
        <div className="mb-1.5 font-mono text-meta text-ink-mute">{shelf.subtitle}</div>
        <div className="flex flex-wrap gap-1.5">
          {shelf.recipes.slice(0, 3).map((r) => (
            <Tag key={r.id}>{r.title}</Tag>
          ))}
          {shelf.count > 3 && <Tag>+{shelf.count - 3} more</Tag>}
        </div>
      </div>
    </>
  );

  if (reorder.reorderIds) {
    const shelfById = new Map(shelves.map((s) => [s.id, s]));
    return (
      <div className="mx-5 select-none pb-8">
        <ReorderBar label="Drag a shelf up or down" onDone={reorder.stop} />
        {reorder.reorderIds
          .map((id) => shelfById.get(id))
          .filter((s): s is Shelf => !!s)
          .map((shelf) => (
            <div
              key={shelf.id}
              ref={reorder.rowRef(shelf.id)}
              className={`flex items-start gap-3.5 border-b border-dashed border-rule py-3.5 transition-colors ${
                reorder.draggingId === shelf.id ? 'bg-cream-deep' : 'bg-cream'
              }`}
            >
              {shelfBody(shelf)}
              <div className="self-center">
                <DragHandle label={`Move ${shelf.title}`} onStart={() => reorder.startDrag(shelf.id)} />
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="mx-5 pb-8">
      {isOwn && archivedShelfCount > 0 && (
        <div className="flex justify-end py-2">
          <Link href="/archived-shelves" className="font-mono text-[12px] text-ink-mute">
            Archived ({archivedShelfCount})
          </Link>
        </div>
      )}
      {shelves.map((shelf) => {
        const row = (
          <Link
            href={`/shelf/${shelf.id}`}
            className="flex items-start gap-3.5 border-b border-dashed border-rule bg-cream py-3.5"
          >
            {shelfBody(shelf)}
            <ChevronIcon size={16} className="mt-2.5 flex-shrink-0 text-ink-mute" />
          </Link>
        );

        if (!isOwn) return <div key={shelf.id}>{row}</div>;

        return (
          <div key={shelf.id} {...reorder.pressProps}>
            <SwipeableRow
              open={openId === shelf.id}
              onOpen={() => setOpenId(shelf.id)}
              onClose={() => setOpenId((cur) => (cur === shelf.id ? null : cur))}
              actions={[
                { label: 'Delete', className: 'bg-accent', onClick: () => setConfirmingId(shelf.id) },
                { label: 'Archive', className: 'bg-ink', onClick: () => handleArchive(shelf.id) },
              ]}
            >
              {row}
            </SwipeableRow>
          </div>
        );
      })}
      {isOwn && (
        <Link
          href="/new-shelf"
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 border border-dashed border-rule py-3 font-mono text-[14px] text-ink-mute"
        >
          <PlusIcon size={13} />
          New shelf
        </Link>
      )}

      {confirmingShelf && (
        <DeleteShelfConfirm
          shelf={confirmingShelf}
          onCancel={() => setConfirmingId(null)}
          onDeleted={() => {
            setConfirmingId(null);
            onShelfRemoved?.(confirmingShelf.id);
          }}
        />
      )}
    </div>
  );
}

// Deleting a shelf just un-groups its recipes — they stay in the
// cookbook — so the confirm copy says that up front rather than making a
// swipe feel as risky as deleting a recipe outright.
function DeleteShelfConfirm({
  shelf,
  onCancel,
  onDeleted,
}: {
  shelf: Shelf;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteShelf(shelf.id);
    setDeleting(false);
    if (ok) onDeleted();
  };

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
      >
        <h3 className="mb-2 flex items-center gap-2 font-display text-[17px] font-bold text-ink">
          <TrashIcon size={16} />
          Delete &ldquo;{shelf.title}&rdquo;?
        </h3>
        <div className="mb-3.5 font-mono text-[12px] leading-[1.55] text-ink-mute">
          {shelf.count > 0
            ? `The ${shelf.count} recipe${shelf.count === 1 ? '' : 's'} on it stay in your cookbook — this just removes the shelf.`
            : 'This can’t be undone.'}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
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
    </div>
  );
}

// Authored recipes and recipes saved from other cooks, in one list — a
// saved-from-someone-else row carries a heart badge with their handle
// instead of a saves count, rather than living in a separate tab. Own
// authored rows can be swiped left to delete; saved rows and anyone else's
// cookbook aren't yours to delete from here. In your own cookbook a long
// press switches the list into reorder mode: rows stop being links, each
// gets a drag handle, and every drop is saved as the cookbook's order.
function RecipesTab({
  recipes,
  savedRecipes,
  isOwn,
  recipeOrder,
  onReorder,
  onRecipeDeleted,
}: {
  recipes: Recipe[];
  savedRecipes: Recipe[];
  isOwn: boolean;
  recipeOrder: string[];
  onReorder?: (recipeIds: string[]) => void;
  onRecipeDeleted?: (recipeId: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Saving your own recipe to one of your own shelves (the shelf "Add
  // recipes" picker allows this) marks it saved without un-authoring it —
  // without this filter it'd show up twice, once from each list.
  const ownIds = new Set(recipes.map((r) => r.id));
  const sortedRows = sortByCookbookOrder(
    [
      ...recipes.map((r) => ({ recipe: r, saved: false })),
      ...savedRecipes.filter((r) => !ownIds.has(r.id)).map((r) => ({ recipe: r, saved: true })),
    ],
    (row) => row.recipe.id,
    recipeOrder,
  );
  const reorder = useLongPressReorder({
    ids: sortedRows.map((row) => row.recipe.id),
    onReorder,
    onStart: () => setOpenId(null),
  });
  const rowById = new Map(sortedRows.map((row) => [row.recipe.id, row]));
  const rows = reorder.reorderIds
    ? reorder.reorderIds.map((id) => rowById.get(id)).filter((row): row is (typeof sortedRows)[number] => !!row)
    : sortedRows;

  if (rows.length === 0) {
    return (
      <div className="mx-5 pb-8 pt-6">
        <div className="border border-dashed border-rule p-5 text-center font-mono text-[14px] leading-relaxed text-ink-mute">
          Recipes written or saved here will show up here.
        </div>
      </div>
    );
  }

  const confirmingRecipe = confirmingId ? recipes.find((r) => r.id === confirmingId) : undefined;

  const rowBody = (r: Recipe, saved: boolean) => (
    <>
      {r.coverPhotoUrl && <RecipeThumbnail src={r.coverPhotoUrl} alt={r.title} />}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2.5">
          <h3 className="min-w-0 flex-1 font-display text-[17px] font-bold text-ink">{r.title}</h3>
          {saved && (
            <span className="flex flex-shrink-0 items-center gap-1 font-mono text-meta text-ink-mute">
              <HeartIcon size={10} />@{r.author}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-meta text-ink-mute">
          <span>{r.time}</span>
          <span>·</span>
          <span>{formatCount(r.madeIt)} cooked</span>
          <span>·</span>
          <span aria-label={`${r.saves} save${r.saves === 1 ? '' : 's'}`} className="flex items-center gap-1">
            {formatCount(r.saves)}
            <HeartIcon size={10} filled className="text-accent" />
          </span>
          {r.ratingCount > 0 && (
            <>
              <span>·</span>
              <span aria-label={`Rated ${r.rating.toFixed(1)} out of 5`}>
                {r.rating.toFixed(1)} <span className="text-ink">★</span>
              </span>
            </>
          )}
          <span>·</span>
          <span>{r.difficulty}</span>
        </div>
      </div>
    </>
  );

  if (reorder.reorderIds) {
    return (
      <div className="mx-5 select-none pb-8">
        <ReorderBar label="Drag a recipe up or down" onDone={reorder.stop} />
        {rows.map(({ recipe: r, saved }) => (
          <div
            key={r.id}
            ref={reorder.rowRef(r.id)}
            className={`flex items-center gap-2.5 border-b border-dashed border-rule py-3.5 transition-colors ${
              reorder.draggingId === r.id ? 'bg-cream-deep' : 'bg-cream'
            }`}
          >
            {rowBody(r, saved)}
            <DragHandle label={`Move ${r.title}`} onStart={() => reorder.startDrag(r.id)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-5 pb-8">
      {rows.map(({ recipe: r, saved }) => {
        const row = (
          <Link
            href={`/recipe/${r.id}`}
            className="flex items-center gap-2.5 border-b border-dashed border-rule bg-cream py-3.5"
          >
            {rowBody(r, saved)}
          </Link>
        );

        if (!isOwn || saved) {
          return (
            <div key={r.id} {...reorder.pressProps}>
              {row}
            </div>
          );
        }

        return (
          <div key={r.id} {...reorder.pressProps}>
            <SwipeableRow
              open={openId === r.id}
              onOpen={() => setOpenId(r.id)}
              onClose={() => setOpenId((cur) => (cur === r.id ? null : cur))}
              actions={[
                {
                  label: 'Delete',
                  className: 'bg-accent',
                  onClick: () => setConfirmingId(r.id),
                },
              ]}
            >
              {row}
            </SwipeableRow>
          </div>
        );
      })}

      {confirmingRecipe && (
        <DeleteRecipeConfirm
          recipe={confirmingRecipe}
          onCancel={() => setConfirmingId(null)}
          onDeleted={() => {
            setConfirmingId(null);
            onRecipeDeleted?.(confirmingRecipe.id);
          }}
        />
      )}
    </div>
  );
}

// Impact-aware delete confirmation, matching the copy the owner sheet's
// "…" menu uses on the recipe page — deleting a recipe has real
// consequences (its notes, other people's saves) so a swipe alone can't
// be the whole confirmation, unlike a message or a shelf.
function DeleteRecipeConfirm({
  recipe,
  onCancel,
  onDeleted,
}: {
  recipe: Recipe;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [impact, setImpact] = useState<{ comments: number; saves: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchRecipeDeleteImpact(recipe.id).then(setImpact);
  }, [recipe.id]);

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteRecipe(recipe.id);
    setDeleting(false);
    if (ok) onDeleted();
  };

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
      >
        <h3 className="mb-2 flex items-center gap-2 font-display text-[17px] font-bold text-ink">
          <TrashIcon size={16} />
          Delete &ldquo;{recipe.title}&rdquo;?
        </h3>
        <div className="mb-3.5 font-mono text-[12px] leading-[1.55] text-ink-mute">
          {impact
            ? `The ${impact.comments} note${impact.comments === 1 ? '' : 's'} on it go too. The ${impact.saves} ${impact.saves === 1 ? 'person who' : 'people who'} saved it will lose it.`
            : 'Checking what this affects…'}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
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
    </div>
  );
}

function CookedTab({ recipes, ownerHandle }: { recipes: CookedRecipe[]; ownerHandle: string }) {
  if (recipes.length === 0) {
    return (
      <div className="mx-5 pb-8 pt-6">
        <div className="border border-dashed border-rule p-5 text-center font-mono text-[14px] leading-relaxed text-ink-mute">
          Recipes @{ownerHandle} has cooked
          <br />
          will appear here.
        </div>
      </div>
    );
  }
  return (
    <div className="mx-5 pb-8">
      {recipes.map((r) => (
        <Link
          key={r.id}
          href={`/recipe/${r.id}`}
          className="flex items-center gap-2.5 border-b border-dashed border-rule py-3.5"
        >
          {r.coverPhotoUrl && <RecipeThumbnail src={r.coverPhotoUrl} alt={r.title} />}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2.5">
              <h3 className="min-w-0 flex-1 font-display text-[17px] font-bold text-ink">{r.title}</h3>
              <span className="flex-shrink-0 font-mono text-meta text-ink-mute">@{r.author}</span>
            </div>
            <div className="mt-1 flex gap-2.5 font-mono text-meta text-ink-mute">
              <span>{r.time}</span>
              <span>·</span>
              <span>Last cooked {r.cookedAt}</span>
              <span>·</span>
              <span>{r.difficulty}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
