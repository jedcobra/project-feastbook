'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CookPhotoViewer } from '@/components/cooked/cook-photo-viewer';
import { ChevronIcon, HeartIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { DragHandle, ReorderBar, useLongPressReorder } from '@/components/profile/long-press-reorder';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { SwipeableRow } from '@/components/swipeable-row';
import { Tag } from '@/components/tag';
import { deleteRecipe, deleteShelf, fetchRecipeDeleteImpact, setShelfArchived } from '@/lib/supabase/queries';
import { sortByCookbookOrder } from '@/lib/cookbook-order';
import { formatCount } from '@/lib/format';
import type { CookPhoto, Recipe, Shelf } from '@/lib/types';
import { HandleLink } from '@/components/handle-link';

type TabId = 'recipes' | 'shelves' | 'cooked';

export function ProfileTabs({
  shelves,
  recipes,
  savedRecipes = [],
  cookPhotos = [],
  onCookPhotosChange,
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
  cookPhotos?: CookPhoto[];
  onCookPhotosChange?: (fn: (photos: CookPhoto[]) => CookPhoto[]) => void;
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
  const [openPhotoId, setOpenPhotoId] = useState<string | null>(null);

  // A notification about one of your photos links here as ?photo=<id>:
  // open the Cooked tab on that photo, then drop the param so closing it
  // and refreshing doesn't reopen it.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('photo');
    if (!id) return;
    setTab('cooked');
    setOpenPhotoId(id);
    const url = new URL(window.location.href);
    url.searchParams.delete('photo');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, []);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'recipes', label: 'Recipes' },
    { id: 'cooked', label: 'Cooked' },
    { id: 'shelves', label: 'Shelves' },
  ];

  // Swipe left/right anywhere on the profile's scrolling area to move to the
  // next/previous tab, so it works below a short tab's content too. Native
  // listeners rather than React ones, so swipes inside a portalled popup
  // (the cooked-photo viewer) never reach here; gestures that start on a row
  // with its own swipe or drag (data-own-swipe) are left to it.
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current?.closest<HTMLElement>('.overflow-y-auto') ?? contentRef.current;
    if (!el) return;
    const order: TabId[] = ['recipes', 'cooked', 'shelves'];
    let start: { x: number; y: number; t: number } | null = null;
    const onStart = (e: TouchEvent) => {
      const target = e.target as Element | null;
      start =
        e.touches.length === 1 && !target?.closest('[data-own-swipe]')
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
          : null;
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const quick = Date.now() - start.t < 700;
      start = null;
      if (!quick || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 2) return;
      setTab((cur) => {
        const i = order.indexOf(cur) + (dx < 0 ? 1 : -1);
        return order[Math.max(0, Math.min(order.length - 1, i))];
      });
    };
    const onCancel = () => {
      start = null;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, []);

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

      <div ref={contentRef}>
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
        {tab === 'cooked' && (
          <CookedTab
            photos={cookPhotos}
            ownerHandle={ownerHandle}
            isOwn={isOwn}
            openPhotoId={openPhotoId}
            onOpenPhotoId={setOpenPhotoId}
            onPhotosChange={onCookPhotosChange}
          />
        )}
      </div>
    </div>
  );
}

const SAVED_SHELF_TITLE = 'Saved';

// Like Recipes, a long press on your own shelves switches to edit mode:
// drag a shelf by its handle to reorder, or swipe it left to archive
// (instant, reversible from the Archived list) or delete (a shelf's recipes
// aren't going anywhere, so one confirm tap is enough — no async impact
// check needed, unlike a recipe). Outside edit mode shelves are plain links.
// Someone else's shelves aren't yours to touch here.
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
  // The "Saved" shelf (where the heart button files recipes) is pinned
  // first: it can't be dragged, archived or deleted, and the rest reorder
  // beneath it.
  const pinned = shelves.find((s) => s.title === SAVED_SHELF_TITLE);
  const movable = shelves.filter((s) => s !== pinned);
  const reorder = useLongPressReorder({
    ids: movable.map((s) => s.id),
    onReorder: onReorder && ((ids) => onReorder(pinned ? [pinned.id, ...ids] : ids)),
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

  const confirmSheet = confirmingShelf && (
    <DeleteShelfConfirm
      shelf={confirmingShelf}
      onCancel={() => setConfirmingId(null)}
      onDeleted={() => {
        setConfirmingId(null);
        onShelfRemoved?.(confirmingShelf.id);
      }}
    />
  );

  if (reorder.reorderIds) {
    const shelfById = new Map(shelves.map((s) => [s.id, s]));
    return (
      <div className="mx-5 select-none pb-8">
        <ReorderBar
          label="Drag to reorder · swipe left for more"
          onDone={() => {
            setOpenId(null);
            reorder.stop();
          }}
        />
        {pinned && (
          <div className="flex items-start gap-3.5 border-b border-dashed border-rule bg-cream py-3.5">
            {shelfBody(pinned)}
            <span className="self-center font-mono text-meta text-ink-mute">Pinned</span>
          </div>
        )}
        {reorder.reorderIds
          .map((id) => shelfById.get(id))
          .filter((s): s is Shelf => !!s)
          .map((shelf) => (
            <div key={shelf.id} ref={reorder.rowRef(shelf.id)}>
              <SwipeableRow
                open={openId === shelf.id}
                onOpen={() => setOpenId(shelf.id)}
                onClose={() => setOpenId((cur) => (cur === shelf.id ? null : cur))}
                actions={[
                  { label: 'Delete', className: 'bg-accent', onClick: () => setConfirmingId(shelf.id) },
                  { label: 'Archive', className: 'bg-ink', onClick: () => handleArchive(shelf.id) },
                ]}
              >
                <div
                  className={`flex items-start gap-3.5 border-b border-dashed border-rule py-3.5 transition-colors ${
                    reorder.draggingId === shelf.id ? 'bg-cream-deep' : 'bg-cream'
                  }`}
                >
                  {shelfBody(shelf)}
                  <div className="self-center">
                    <DragHandle
                      label={`Move ${shelf.title}`}
                      onStart={() => {
                        setOpenId(null);
                        reorder.startDrag(shelf.id);
                      }}
                    />
                  </div>
                </div>
              </SwipeableRow>
            </div>
          ))}
        {confirmSheet}
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
      {[...(pinned ? [pinned] : []), ...movable].map((shelf) => (
        <div key={shelf.id} {...reorder.pressProps}>
          <Link
            href={`/shelf/${shelf.id}`}
            className="flex items-start gap-3.5 border-b border-dashed border-rule bg-cream py-3.5"
          >
            {shelfBody(shelf)}
            <ChevronIcon size={16} className="mt-2.5 flex-shrink-0 text-ink-mute" />
          </Link>
        </div>
      ))}
      {isOwn && (
        <Link
          href="/new-shelf"
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 border border-dashed border-rule py-3 font-mono text-[14px] text-ink-mute"
        >
          <PlusIcon size={13} />
          New shelf
        </Link>
      )}
      {confirmSheet}
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
    <div className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-night/30" onClick={onCancel}>
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
// instead of a saves count, rather than living in a separate tab. In your
// own cookbook a long press switches the list into edit mode: rows stop
// being links, each gets a drag handle (every drop is saved as the
// cookbook's order), and your own recipes can be swiped left to delete.
// Saved rows and anyone else's cookbook aren't yours to delete from here.
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
              <HeartIcon size={10} />
              <HandleLink nested handle={r.author} />
            </span>
          )}
        </div>
        {/* One line; only the time truncates if a row still can't fit. Saves and
            ratings live on the recipe itself, not in this list. */}
        <div className="mt-1 flex items-center gap-x-2 overflow-hidden whitespace-nowrap font-mono text-meta text-ink-mute">
          <span className="min-w-0 truncate">{r.time}</span>
          <span className="flex-shrink-0">·</span>
          <span className="flex-shrink-0">{r.difficulty}</span>
          <span className="flex-shrink-0">·</span>
          <span className="flex-shrink-0">{formatCount(r.madeIt)} cooked</span>
        </div>
      </div>
    </>
  );

  const confirmSheet = confirmingRecipe && (
    <DeleteRecipeConfirm
      recipe={confirmingRecipe}
      onCancel={() => setConfirmingId(null)}
      onDeleted={() => {
        setConfirmingId(null);
        onRecipeDeleted?.(confirmingRecipe.id);
      }}
    />
  );

  // Long press puts the list into edit mode: drag a row by its handle to
  // reorder it, or swipe one of your own recipes left to delete it. Outside
  // edit mode rows are plain links, so a stray swipe can't delete anything.
  if (reorder.reorderIds) {
    return (
      <div className="mx-5 select-none pb-8">
        <ReorderBar
          label={isOwn ? 'Drag to reorder · swipe left to delete' : 'Drag a recipe up or down'}
          onDone={() => {
            setOpenId(null);
            reorder.stop();
          }}
        />
        {rows.map(({ recipe: r, saved }) => {
          const row = (
            <div
              className={`flex items-center gap-2.5 border-b border-dashed border-rule py-3.5 transition-colors ${
                reorder.draggingId === r.id ? 'bg-cream-deep' : 'bg-cream'
              }`}
            >
              {rowBody(r, saved)}
              <DragHandle
                label={`Move ${r.title}`}
                onStart={() => {
                  setOpenId(null);
                  reorder.startDrag(r.id);
                }}
              />
            </div>
          );
          return (
            <div key={r.id} ref={reorder.rowRef(r.id)}>
              {isOwn && !saved ? (
                <SwipeableRow
                  open={openId === r.id}
                  onOpen={() => setOpenId(r.id)}
                  onClose={() => setOpenId((cur) => (cur === r.id ? null : cur))}
                  actions={[{ label: 'Delete', className: 'bg-accent', onClick: () => setConfirmingId(r.id) }]}
                >
                  {row}
                </SwipeableRow>
              ) : (
                row
              )}
            </div>
          );
        })}
        {confirmSheet}
      </div>
    );
  }

  return (
    <div className="mx-5 pb-8">
      {rows.map(({ recipe: r, saved }) => (
        <div key={r.id} {...reorder.pressProps}>
          <Link
            href={`/recipe/${r.id}`}
            className="flex items-center gap-2.5 border-b border-dashed border-rule bg-cream py-3.5"
          >
            {rowBody(r, saved)}
          </Link>
        </div>
      ))}
      {confirmSheet}
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
    <div className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-night/30" onClick={onCancel}>
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

// An Instagram-style grid of the owner's own versions of dishes, newest
// first. Tapping one opens it large, with chef's kisses and comments.
function CookedTab({
  photos,
  ownerHandle,
  isOwn,
  openPhotoId,
  onOpenPhotoId,
  onPhotosChange,
}: {
  photos: CookPhoto[];
  ownerHandle: string;
  isOwn: boolean;
  openPhotoId: string | null;
  onOpenPhotoId: (id: string | null) => void;
  onPhotosChange?: (fn: (photos: CookPhoto[]) => CookPhoto[]) => void;
}) {
  const open = photos.find((p) => p.id === openPhotoId);
  return (
    <div className="pb-8">
      {photos.length === 0 ? (
        <div className="mx-5 pt-6">
          <div className="border border-dashed border-rule p-5 text-center font-mono text-[14px] leading-relaxed text-ink-mute">
            {isOwn ? (
              <>
                Tap Cooked it on a recipe, or finish cooking mode,
                <br />
                and add a photo of your version.
              </>
            ) : (
              <>
                Photos of what {ownerHandle} has cooked
                <br />
                will appear here.
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-0.5 grid grid-cols-3 gap-0.5">
          {photos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenPhotoId(p.id)}
              aria-label={`${p.handle}’s ${p.recipeTitle}`}
              className="relative aspect-square overflow-hidden bg-cream-deep"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {open && (
        <CookPhotoViewer
          photo={open}
          onClose={() => onOpenPhotoId(null)}
          onChange={(next) => onPhotosChange?.((ps) => ps.map((p) => (p.id === next.id ? next : p)))}
          onDeleted={(id) => {
            onOpenPhotoId(null);
            onPhotosChange?.((ps) => ps.filter((p) => p.id !== id));
          }}
        />
      )}
    </div>
  );
}
