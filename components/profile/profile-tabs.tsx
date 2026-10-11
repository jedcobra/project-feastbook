'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CookPhotoViewer } from '@/components/cooked/cook-photo-viewer';
import { ChevronIcon, HeartIcon, PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { DragHandle, ReorderBar, useLongPressReorder } from '@/components/profile/long-press-reorder';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { EditShelfSheet } from '@/components/shelves/edit-shelf-sheet';
import { ShelfIcon } from '@/components/shelves/shelf-icon';
import { SwipeableRow } from '@/components/swipeable-row';
import { deleteRecipe, deleteShelf, fetchRecipeDeleteImpact, setShelfArchived } from '@/lib/supabase/queries';
import { sortByCookbookOrder } from '@/lib/cookbook-order';
import { formatCount } from '@/lib/format';
import type { CookPhoto, Recipe, Shelf } from '@/lib/types';
import { HandleLink } from '@/components/handle-link';

type TabId = 'recipes' | 'cooked';
const TAB_ORDER: TabId[] = ['recipes', 'cooked'];

export function ProfileTabs({
  shelves,
  recipes,
  savedRecipes = [],
  shelfRecipes = [],
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
  onShelfChange,
}: {
  shelves: Shelf[];
  recipes: Recipe[];
  savedRecipes?: Recipe[];
  shelfRecipes?: Recipe[];
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
  onShelfChange?: (shelf: Shelf) => void;
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
        const i = TAB_ORDER.indexOf(cur) + (dx < 0 ? 1 : -1);
        return TAB_ORDER[Math.max(0, Math.min(TAB_ORDER.length - 1, i))];
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
      <div className="mx-5 grid grid-cols-2 border-b border-dashed border-rule">
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
            shelves={shelves}
            recipes={recipes}
            savedRecipes={savedRecipes}
            shelfRecipes={shelfRecipes}
            isOwn={isOwn}
            archivedShelfCount={archivedShelfCount}
            recipeOrder={recipeOrder}
            onReorderRecipes={isOwn ? onReorderRecipes : undefined}
            onReorderShelves={isOwn ? onReorderShelves : undefined}
            onRecipeDeleted={onRecipeDeleted}
            onShelfRemoved={onShelfRemoved}
            onShelfArchived={onShelfArchived}
            onShelfChange={onShelfChange}
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

// Where the heart button files recipes. It isn't shown as a shelf of its
// own: its recipes sit among the loose ones, marked with a heart.
const SAVED_SHELF_TITLE = 'Saved';

type RecipeListRow = { recipe: Recipe; saved: boolean };

// The whole cookbook in one list. Shelves come first, each a closed group
// that opens in place to show its recipes; every recipe not on a shelf
// follows, one row each. Recipes saved from other cooks carry a heart and
// that cook's handle instead of living in a tab of their own. In your own
// cookbook a long press switches to edit mode: drag shelves and loose
// recipes by their handles to reorder (every drop is saved), swipe a shelf
// left to archive (instant, reversible from Archived shelves) or delete it,
// or one of your own recipes left to delete it. Outside edit mode rows are
// plain links and toggles, so a stray swipe can't delete anything.
function RecipesTab({
  shelves,
  recipes,
  savedRecipes,
  shelfRecipes,
  isOwn,
  archivedShelfCount,
  recipeOrder,
  onReorderRecipes,
  onReorderShelves,
  onRecipeDeleted,
  onShelfRemoved,
  onShelfArchived,
  onShelfChange,
}: {
  shelves: Shelf[];
  recipes: Recipe[];
  savedRecipes: Recipe[];
  shelfRecipes: Recipe[];
  isOwn: boolean;
  archivedShelfCount: number;
  recipeOrder: string[];
  onReorderRecipes?: (recipeIds: string[]) => void;
  onReorderShelves?: (shelfIds: string[]) => void;
  onRecipeDeleted?: (recipeId: string) => void;
  onShelfRemoved?: (shelfId: string) => void;
  onShelfArchived?: (shelfId: string) => void;
  onShelfChange?: (shelf: Shelf) => void;
}) {
  // Which row is swiped open — a shelf's id or a recipe's, never both.
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmingRecipeId, setConfirmingRecipeId] = useState<string | null>(null);
  const [confirmingShelfId, setConfirmingShelfId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [editingShelfId, setEditingShelfId] = useState<string | null>(null);

  const ownIds = new Set(recipes.map((r) => r.id));
  const recipeById = new Map([...shelfRecipes, ...savedRecipes, ...recipes].map((r) => [r.id, r]));
  const rowsFor = (ids: string[]) =>
    ids.flatMap((id): RecipeListRow[] => {
      const recipe = recipeById.get(id);
      return recipe ? [{ recipe, saved: !ownIds.has(id) }] : [];
    });

  const savedShelf = shelves.find((s) => s.title === SAVED_SHELF_TITLE);
  const groups = shelves.filter((s) => s !== savedShelf);
  const shelvedIds = new Set(groups.flatMap((s) => s.recipes.map((r) => r.id)));
  const shelfRows = (shelf: Shelf) => rowsFor(shelf.recipes.map((r) => r.id));

  // Saved recipes come from your own saves, or on someone else's profile
  // from their Saved shelf where you're allowed to see it. Saving your own
  // recipe doesn't un-author it, hence the de-duplication.
  const looseIds = [
    ...new Set([
      ...recipes.map((r) => r.id),
      ...savedRecipes.map((r) => r.id),
      ...(savedShelf?.recipes.map((r) => r.id) ?? []),
    ]),
  ].filter((id) => !shelvedIds.has(id));
  const looseRows = sortByCookbookOrder(rowsFor(looseIds), (row) => row.recipe.id, recipeOrder);

  // A long press on either list puts both into edit mode together.
  const startEditing = () => {
    setOpenId(null);
    shelfReorder.start();
    recipeReorder.start();
  };
  const shelfReorder = useLongPressReorder({
    ids: groups.map((s) => s.id),
    onReorder: onReorderShelves && ((ids) => onReorderShelves(savedShelf ? [savedShelf.id, ...ids] : ids)),
    onStart: startEditing,
  });
  const recipeReorder = useLongPressReorder({
    ids: looseRows.map((row) => row.recipe.id),
    // Only loose recipes can be dragged here. Shelved ones keep their old
    // places in the saved order, after these, for if they come off a shelf.
    onReorder:
      onReorderRecipes &&
      ((ids) => onReorderRecipes([...ids, ...recipeOrder.filter((id) => !ids.includes(id))])),
    onStart: startEditing,
  });
  const editing = shelfReorder.reorderIds !== null || recipeReorder.reorderIds !== null;

  const toggleShelf = (shelfId: string) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      if (!next.delete(shelfId)) next.add(shelfId);
      return next;
    });

  const archiveShelf = async (shelfId: string) => {
    onShelfRemoved?.(shelfId);
    onShelfArchived?.(shelfId);
    await setShelfArchived(shelfId, true);
  };

  const confirmingRecipe = confirmingRecipeId ? recipes.find((r) => r.id === confirmingRecipeId) : undefined;
  const confirmingShelf = confirmingShelfId ? groups.find((s) => s.id === confirmingShelfId) : undefined;
  const editingShelf = editingShelfId ? groups.find((s) => s.id === editingShelfId) : undefined;
  const confirmSheets = (
    <>
      {editingShelf && (
        <EditShelfSheet
          shelf={editingShelf}
          recipes={shelfRows(editingShelf).map((row) => row.recipe)}
          onChange={(next) => onShelfChange?.(next)}
          onDeleted={() => {
            setEditingShelfId(null);
            onShelfRemoved?.(editingShelf.id);
          }}
          onClose={() => setEditingShelfId(null)}
        />
      )}
      {confirmingRecipe && (
        <DeleteRecipeConfirm
          recipe={confirmingRecipe}
          onCancel={() => setConfirmingRecipeId(null)}
          onDeleted={() => {
            setConfirmingRecipeId(null);
            onRecipeDeleted?.(confirmingRecipe.id);
          }}
        />
      )}
      {confirmingShelf && (
        <DeleteShelfConfirm
          shelf={confirmingShelf}
          onCancel={() => setConfirmingShelfId(null)}
          onDeleted={() => {
            setConfirmingShelfId(null);
            onShelfRemoved?.(confirmingShelf.id);
          }}
        />
      )}
    </>
  );

  const recipeBody = (r: Recipe, saved: boolean) => (
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

  const shelfBody = (shelf: Shelf) => (
    <>
      <ShelfIcon emoji={shelf.emoji} coverUrl={shelf.coverUrl} count={shelfRows(shelf).length} />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[17px] font-bold text-ink">{shelf.title}</h3>
        {shelf.subtitle && <div className="mt-0.5 truncate font-mono text-meta text-ink-mute">{shelf.subtitle}</div>}
      </div>
    </>
  );

  if (editing) {
    const shelfById = new Map(groups.map((s) => [s.id, s]));
    const rowById = new Map(looseRows.map((row) => [row.recipe.id, row]));
    return (
      <div className="mx-5 select-none pb-8">
        <ReorderBar
          label="Drag to reorder · swipe left for more"
          onDone={() => {
            setOpenId(null);
            shelfReorder.stop();
            recipeReorder.stop();
          }}
        />
        {(shelfReorder.reorderIds ?? [])
          .map((id) => shelfById.get(id))
          .filter((s): s is Shelf => !!s)
          .map((shelf) => (
            <div key={shelf.id} ref={shelfReorder.rowRef(shelf.id)}>
              <SwipeableRow
                open={openId === shelf.id}
                onOpen={() => setOpenId(shelf.id)}
                onClose={() => setOpenId((cur) => (cur === shelf.id ? null : cur))}
                actions={[
                  { label: 'Delete', className: 'bg-accent', onClick: () => setConfirmingShelfId(shelf.id) },
                  { label: 'Archive', className: 'bg-ink', onClick: () => archiveShelf(shelf.id) },
                ]}
              >
                <div
                  className={`flex items-center gap-3.5 border-b border-dashed border-rule py-3.5 transition-colors ${
                    shelfReorder.draggingId === shelf.id ? 'bg-cream-deep' : 'bg-cream'
                  }`}
                >
                  {shelfBody(shelf)}
                  <DragHandle
                    label={`Move ${shelf.title}`}
                    onStart={() => {
                      setOpenId(null);
                      shelfReorder.startDrag(shelf.id);
                    }}
                  />
                </div>
              </SwipeableRow>
            </div>
          ))}
        {(recipeReorder.reorderIds ?? [])
          .map((id) => rowById.get(id))
          .filter((row): row is RecipeListRow => !!row)
          .map(({ recipe: r, saved }) => {
            const row = (
              <div
                className={`flex items-center gap-2.5 border-b border-dashed border-rule py-3.5 transition-colors ${
                  recipeReorder.draggingId === r.id ? 'bg-cream-deep' : 'bg-cream'
                }`}
              >
                {recipeBody(r, saved)}
                <DragHandle
                  label={`Move ${r.title}`}
                  onStart={() => {
                    setOpenId(null);
                    recipeReorder.startDrag(r.id);
                  }}
                />
              </div>
            );
            return (
              <div key={r.id} ref={recipeReorder.rowRef(r.id)}>
                {isOwn && !saved ? (
                  <SwipeableRow
                    open={openId === r.id}
                    onOpen={() => setOpenId(r.id)}
                    onClose={() => setOpenId((cur) => (cur === r.id ? null : cur))}
                    actions={[{ label: 'Delete', className: 'bg-accent', onClick: () => setConfirmingRecipeId(r.id) }]}
                  >
                    {row}
                  </SwipeableRow>
                ) : (
                  row
                )}
              </div>
            );
          })}
        {confirmSheets}
      </div>
    );
  }

  return (
    <div className="mx-5 pb-8">
      {isOwn && (
        <div className="flex items-center justify-end gap-4 py-2 font-mono text-[12px] text-ink-mute">
          {archivedShelfCount > 0 && <Link href="/archived-shelves">Archived shelves ({archivedShelfCount})</Link>}
          <Link href="/new-shelf" className="flex items-center gap-1">
            <PlusIcon size={11} />
            New shelf
          </Link>
        </div>
      )}

      {groups.length === 0 && looseRows.length === 0 && (
        <div className={`border border-dashed border-rule p-5 text-center font-mono text-[14px] leading-relaxed text-ink-mute ${isOwn ? '' : 'mt-6'}`}>
          Recipes written or saved here will show up here.
        </div>
      )}

      {groups.map((shelf) => {
        const rows = shelfRows(shelf);
        const open = expanded.has(shelf.id);
        return (
          <div key={shelf.id} className="border-b border-dashed border-rule">
            <div {...shelfReorder.pressProps}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggleShelf(shelf.id)}
                className="flex w-full items-center gap-3.5 bg-cream py-3.5 text-left"
              >
                {shelfBody(shelf)}
                <ChevronIcon
                  size={16}
                  className={`flex-shrink-0 text-ink-mute transition-transform ${open ? 'rotate-90' : ''}`}
                />
              </button>
            </div>
            {open && (
              <div className="mb-3.5 border-l-2 border-ink pl-3.5">
                {rows.length === 0 ? (
                  <div className="py-2.5 font-mono text-[12px] text-ink-mute">Nothing on this shelf yet.</div>
                ) : (
                  rows.map(({ recipe: r, saved }) => (
                    <div key={r.id} {...recipeReorder.pressProps}>
                      <Link
                        href={`/recipe/${r.id}`}
                        className="flex items-center gap-2.5 border-b border-dashed border-rule bg-cream py-3"
                      >
                        {recipeBody(r, saved)}
                      </Link>
                    </div>
                  ))
                )}
                {isOwn && (
                  <button
                    type="button"
                    onClick={() => setEditingShelfId(shelf.id)}
                    className="flex items-center gap-1 pt-2.5 font-mono text-[12px] text-ink-mute"
                  >
                    <PencilIcon size={11} />
                    Edit shelf
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {looseRows.map(({ recipe: r, saved }) => (
        <div key={r.id} {...recipeReorder.pressProps}>
          <Link
            href={`/recipe/${r.id}`}
            className="flex items-center gap-2.5 border-b border-dashed border-rule bg-cream py-3.5"
          >
            {recipeBody(r, saved)}
          </Link>
        </div>
      ))}
      {confirmSheets}
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
