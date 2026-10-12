'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CookPhotoViewer } from '@/components/cooked/cook-photo-viewer';
import { HeartIcon, PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { ReorderBar, useLongPressReorder } from '@/components/profile/long-press-reorder';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { EditShelfSheet, NewShelfSheet, ShelfSheet } from '@/components/shelves/edit-shelf-sheet';
import { firstRecipePhoto, ShelfBubble } from '@/components/shelves/shelf-icon';
import { deleteRecipe, deleteShelf, fetchRecipeDeleteImpact, setShelfArchived } from '@/lib/supabase/queries';
import { formatCount } from '@/lib/format';
import type { CookPhoto, Recipe, Shelf } from '@/lib/types';
import { HandleLink } from '@/components/handle-link';

type TabId = 'recipes' | 'cooked';

// How far a cookbook in edit mode has to be pushed before it starts to
// move rather than counting as a tap.
const TILE_DRAG_THRESHOLD = 6;
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
  onReorderShelves,
  onRecipeDeleted,
  onShelfRemoved,
  onShelfArchived,
  onShelfChange,
  onShelfCreated,
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
  onReorderShelves?: (shelfIds: string[]) => void;
  onRecipeDeleted?: (recipeId: string) => void;
  onShelfRemoved?: (shelfId: string) => void;
  onShelfArchived?: (shelfId: string) => void;
  onShelfChange?: (shelf: Shelf) => void;
  onShelfCreated?: (shelf: Shelf) => void;
}) {
  const [tab, setTab] = useState<TabId>('recipes');
  const [openPhotoId, setOpenPhotoId] = useState<string | null>(null);
  const [focusShelfId, setFocusShelfId] = useState<string | null>(null);

  // Links can point into the profile. ?photo=<id> (a notification about one
  // of your photos) opens the Cooked tab on that photo; ?shelf=<id> (a
  // shelf post in the feed, or its notification) opens that shelf on the
  // Recipes tab. Either param is then dropped so closing and refreshing
  // doesn't reopen it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const photoId = params.get('photo');
    const shelfId = params.get('shelf');
    if (!photoId && !shelfId) return;
    if (photoId) {
      setTab('cooked');
      setOpenPhotoId(photoId);
    } else if (shelfId) {
      setTab('recipes');
      setFocusShelfId(shelfId);
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('photo');
    url.searchParams.delete('shelf');
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
      <div className="mx-5 grid grid-cols-2 border-b border-rule-soft">
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
            onReorderShelves={isOwn ? onReorderShelves : undefined}
            onRecipeDeleted={onRecipeDeleted}
            onShelfRemoved={onShelfRemoved}
            onShelfArchived={onShelfArchived}
            onShelfChange={onShelfChange}
            onShelfCreated={onShelfCreated}
            focusShelfId={focusShelfId}
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

// The whole cookbook on one tab. Shelves come first, as a row of
// rounded-square icons like story highlights; tapping one opens its
// recipes beneath the row. Then every recipe, newest first, whether or not
// it's on a shelf. Recipes saved from other cooks carry a heart and that
// cook's handle instead of living in a tab of their own. In your own
// cookbook a long press switches to edit mode: the cookbooks stay in their
// row and are dragged sideways to reorder (every drop is saved); tapping
// one offers Edit, Archive (instant, reversible from Archived shelves) or
// Delete, and tapping one of your own recipes offers Delete. Outside edit
// mode rows are plain links and toggles, so nothing gets deleted by
// accident.
function RecipesTab({
  shelves,
  recipes,
  savedRecipes,
  shelfRecipes,
  isOwn,
  archivedShelfCount,
  onReorderShelves,
  onRecipeDeleted,
  onShelfRemoved,
  onShelfArchived,
  onShelfChange,
  onShelfCreated,
  focusShelfId,
}: {
  shelves: Shelf[];
  recipes: Recipe[];
  savedRecipes: Recipe[];
  shelfRecipes: Recipe[];
  isOwn: boolean;
  archivedShelfCount: number;
  onReorderShelves?: (shelfIds: string[]) => void;
  onRecipeDeleted?: (recipeId: string) => void;
  onShelfRemoved?: (shelfId: string) => void;
  onShelfArchived?: (shelfId: string) => void;
  onShelfChange?: (shelf: Shelf) => void;
  onShelfCreated?: (shelf: Shelf) => void;
  // A shelf to open and scroll to on arrival (from a ?shelf= link).
  focusShelfId?: string | null;
}) {
  // In edit mode, the cookbook or recipe whose options are showing.
  const [options, setOptions] = useState<{ kind: 'shelf' | 'recipe'; id: string } | null>(null);
  const [confirmingRecipeId, setConfirmingRecipeId] = useState<string | null>(null);
  const [confirmingShelfId, setConfirmingShelfId] = useState<string | null>(null);
  // The cookbook opened from the row of icons, its recipes shown beneath.
  const [selectedId, setSelectedId] = useState<string | null>(focusShelfId ?? null);
  const bubbleEls = useRef(new Map<string, HTMLElement>());
  const cookbooksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusShelfId) return;
    setSelectedId(focusShelfId);
    // Once it's open, bring the row into view with that cookbook's icon in
    // the middle of it.
    requestAnimationFrame(() => {
      cookbooksRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      bubbleEls.current.get(focusShelfId)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    });
  }, [focusShelfId]);
  const [editingShelfId, setEditingShelfId] = useState<string | null>(null);
  const [creatingShelf, setCreatingShelf] = useState(false);

  const ownIds = new Set(recipes.map((r) => r.id));
  const recipeById = new Map([...shelfRecipes, ...savedRecipes, ...recipes].map((r) => [r.id, r]));
  const rowsFor = (ids: string[]) =>
    ids.flatMap((id): RecipeListRow[] => {
      const recipe = recipeById.get(id);
      return recipe ? [{ recipe, saved: !ownIds.has(id) }] : [];
    });

  const savedShelf = shelves.find((s) => s.title === SAVED_SHELF_TITLE);
  const groups = shelves.filter((s) => s !== savedShelf);
  const shelfRows = (shelf: Shelf) => rowsFor(shelf.recipes.map((r) => r.id));

  // Saved recipes come from your own saves, or on someone else's profile
  // from their Saved shelf where you're allowed to see it. Saving your own
  // recipe doesn't un-author it, hence the de-duplication. Newest first: a
  // recipe of your own by when it was posted, a saved one by when it was
  // saved (or posted, where that isn't known).
  const recipeIds = [
    ...new Set([
      ...recipes.map((r) => r.id),
      ...savedRecipes.map((r) => r.id),
      ...(savedShelf?.recipes.map((r) => r.id) ?? []),
    ]),
  ];
  const addedAt = ({ recipe, saved }: RecipeListRow) => (saved ? (recipe.savedAt ?? recipe.createdAt) : recipe.createdAt);
  const recipeRows = rowsFor(recipeIds).sort((a, b) => addedAt(b).localeCompare(addedAt(a)));

  // A long press anywhere on the tab puts it into edit mode, where the
  // cookbooks stay in their row and are dragged sideways.
  const editRowRef = useRef<HTMLDivElement>(null);
  const shelfReorder = useLongPressReorder({
    ids: groups.map((s) => s.id),
    onReorder: onReorderShelves && ((ids) => onReorderShelves(savedShelf ? [savedShelf.id, ...ids] : ids)),
    onStart: () => setOptions(null),
    axis: 'x',
    scrollRef: editRowRef,
  });
  const editing = shelfReorder.reorderIds !== null;

  // In edit mode a cookbook moves once it's pushed a little way; let go
  // without moving and it's a tap, which brings up its options.
  const tilePress = useRef<{ id: string; x: number; y: number; dragging: boolean } | null>(null);
  const tileProps = (shelfId: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      tilePress.current = { id: shelfId, x: e.clientX, y: e.clientY, dragging: false };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const press = tilePress.current;
      if (!press || press.dragging || press.id !== shelfId) return;
      if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > TILE_DRAG_THRESHOLD) {
        press.dragging = true;
        shelfReorder.startDrag(shelfId);
      }
    },
    onPointerUp: () => {
      const press = tilePress.current;
      tilePress.current = null;
      if (press && !press.dragging && press.id === shelfId) setOptions({ kind: 'shelf', id: shelfId });
    },
    onPointerCancel: () => {
      tilePress.current = null;
    },
  });

  const toggleShelf = (shelfId: string) => setSelectedId((cur) => (cur === shelfId ? null : shelfId));

  const archiveShelf = async (shelfId: string) => {
    onShelfRemoved?.(shelfId);
    onShelfArchived?.(shelfId);
    await setShelfArchived(shelfId, true);
  };

  const optionsShelf = options?.kind === 'shelf' ? groups.find((s) => s.id === options.id) : undefined;
  const optionsRecipe = options?.kind === 'recipe' ? recipes.find((r) => r.id === options.id) : undefined;
  const confirmingRecipe = confirmingRecipeId ? recipes.find((r) => r.id === confirmingRecipeId) : undefined;
  const confirmingShelf = confirmingShelfId ? groups.find((s) => s.id === confirmingShelfId) : undefined;
  const editingShelf = editingShelfId ? groups.find((s) => s.id === editingShelfId) : undefined;
  const confirmSheets = (
    <>
      {optionsShelf && (
        <OptionsSheet
          title={optionsShelf.title}
          onClose={() => setOptions(null)}
          options={[
            { label: 'Edit cookbook', onClick: () => setEditingShelfId(optionsShelf.id) },
            { label: 'Archive', onClick: () => void archiveShelf(optionsShelf.id) },
            { label: 'Delete', danger: true, onClick: () => setConfirmingShelfId(optionsShelf.id) },
          ]}
        />
      )}
      {optionsRecipe && (
        <OptionsSheet
          title={optionsRecipe.title}
          onClose={() => setOptions(null)}
          options={[{ label: 'Delete recipe', danger: true, onClick: () => setConfirmingRecipeId(optionsRecipe.id) }]}
        />
      )}
      {creatingShelf && (
        <NewShelfSheet
          onClose={() => setCreatingShelf(false)}
          // The new shelf goes to the front, open, with its Edit sheet up so
          // recipes can go straight onto it.
          onCreated={(shelf) => {
            onShelfCreated?.(shelf);
            setCreatingShelf(false);
            setSelectedId(shelf.id);
            setEditingShelfId(shelf.id);
          }}
        />
      )}
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

  if (editing) {
    const shelfById = new Map(groups.map((s) => [s.id, s]));
    return (
      <div className="mx-5 select-none pb-8">
        <ReorderBar
          label="Drag cookbooks to reorder · tap for options"
          onDone={() => {
            setOptions(null);
            shelfReorder.stop();
          }}
        />
        {groups.length > 0 && <SectionHeading>Cookbooks</SectionHeading>}
        {groups.length > 0 && (
          <div ref={editRowRef} data-own-swipe className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 pt-1">
            {(shelfReorder.reorderIds ?? [])
              .map((id) => shelfById.get(id))
              .filter((s): s is Shelf => !!s)
              .map((shelf) => (
                <div
                  key={shelf.id}
                  ref={shelfReorder.rowRef(shelf.id)}
                  {...tileProps(shelf.id)}
                  aria-label={`${shelf.title}: drag to move, tap for options`}
                  role="button"
                  className={`flex w-[70px] flex-shrink-0 cursor-grab touch-none flex-col items-center gap-2 transition-transform ${
                    shelfReorder.draggingId === shelf.id ? 'z-10 scale-110 opacity-90' : ''
                  }`}
                >
                  <ShelfBubble
                    coverUrl={shelf.coverUrl}
                    fallbackUrl={firstRecipePhoto([...shelfRows(shelf).map((row) => row.recipe), ...shelf.recipes])}
                    stickerUrl={shelf.stickerUrl}
                    count={shelfRows(shelf).length}
                    selected={shelfReorder.draggingId === shelf.id}
                  />
                  <span className="w-full truncate text-center font-mono text-[12px] leading-tight text-ink-soft">
                    {shelf.title}
                  </span>
                </div>
              ))}
          </div>
        )}
        {recipeRows.length > 0 && <SectionHeading>Recipes</SectionHeading>}
        {recipeRows.map(({ recipe: r, saved }) =>
          isOwn && !saved ? (
            <button
              key={r.id}
              type="button"
              onClick={() => setOptions({ kind: 'recipe', id: r.id })}
              className="flex w-full items-center gap-2.5 border-b border-rule-soft bg-cream py-3.5 text-left"
            >
              {recipeBody(r, saved)}
            </button>
          ) : (
            <div key={r.id} className="flex items-center gap-2.5 border-b border-rule-soft bg-cream py-3.5">
              {recipeBody(r, saved)}
            </div>
          ),
        )}
        {confirmSheets}
      </div>
    );
  }

  const selected = groups.find((s) => s.id === selectedId);
  const selectedRows = selected ? shelfRows(selected) : [];

  return (
    <div className="mx-5 pb-8">
      {/* Cookbooks sit in a row of rounded-square icons, like story
          highlights; tap one to open its recipes underneath, tap it again to
          close them. On your own profile New comes first. With none yet
          there's no heading, and your own row holds just New. */}
      <div ref={cookbooksRef} className="scroll-mt-2">
        {groups.length > 0 ? (
          <SectionHeading
            action={isOwn && archivedShelfCount > 0 && <Link href="/archived-shelves">Archived ({archivedShelfCount})</Link>}
          >
            Cookbooks
          </SectionHeading>
        ) : (
          isOwn &&
          archivedShelfCount > 0 && (
            <div className="mt-3 flex justify-end font-mono text-[12px] leading-none text-ink-mute">
              <Link href="/archived-shelves">Archived ({archivedShelfCount})</Link>
            </div>
          )
        )}

        {(groups.length > 0 || isOwn) && (
          <div data-own-swipe className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 pt-1">
            {isOwn && (
              <button
                type="button"
                onClick={() => setCreatingShelf(true)}
                className="flex w-[70px] flex-shrink-0 flex-col items-center gap-2"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink text-ink">
                  <PlusIcon size={20} />
                </div>
                <span className="w-full truncate text-center font-mono text-[12px] leading-tight text-ink-soft">New</span>
              </button>
            )}
            {groups.map((shelf) => (
              <div
                key={shelf.id}
                ref={(el) => {
                  if (el) bubbleEls.current.set(shelf.id, el);
                  else bubbleEls.current.delete(shelf.id);
                }}
                {...shelfReorder.pressProps}
                className="flex-shrink-0"
              >
                <button
                  type="button"
                  aria-expanded={selectedId === shelf.id}
                  aria-controls="cookbook-recipes"
                  onClick={() => toggleShelf(shelf.id)}
                  className="flex w-[70px] flex-col items-center gap-2"
                >
                  <ShelfBubble
                    coverUrl={shelf.coverUrl}
                    fallbackUrl={firstRecipePhoto([...shelfRows(shelf).map((row) => row.recipe), ...shelf.recipes])}
                    stickerUrl={shelf.stickerUrl}
                    count={shelfRows(shelf).length}
                    selected={selectedId === shelf.id}
                  />
                  <span
                    className={`w-full truncate text-center font-mono text-[12px] leading-tight ${
                      selectedId === shelf.id ? 'text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {shelf.title}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div id="cookbook-recipes" className="mt-3 border-l-2 border-ink pl-3.5">
            <div className="flex items-start justify-between gap-3 pb-1">
              <div className="min-w-0">
                <h3 className="font-display text-[20px] font-bold leading-tight text-ink">{selected.title}</h3>
                {selected.subtitle && <div className="mt-0.5 font-mono text-meta text-ink-mute">{selected.subtitle}</div>}
              </div>
              {isOwn && (
                <button
                  type="button"
                  onClick={() => setEditingShelfId(selected.id)}
                  className="flex flex-shrink-0 items-center gap-1 pt-1 font-mono text-[12px] text-ink-mute"
                >
                  <PencilIcon size={11} />
                  Edit
                </button>
              )}
            </div>
            {selectedRows.length === 0 ? (
              <div className="py-2.5 font-mono text-[12px] text-ink-mute">Nothing in this cookbook yet.</div>
            ) : (
              selectedRows.map(({ recipe: r, saved }) => (
                <div key={r.id} {...shelfReorder.pressProps}>
                  <Link
                    href={`/recipe/${r.id}`}
                    className="flex items-center gap-2.5 border-b border-rule-soft bg-cream py-3 last:border-b-0"
                  >
                    {recipeBody(r, saved)}
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {groups.length === 0 && recipeRows.length === 0 && (
        <div className={`border border-rule p-5 text-center font-mono text-[14px] leading-relaxed text-ink-mute ${isOwn ? 'mt-3' : 'mt-6'}`}>
          Recipes written or saved here will show up here.
        </div>
      )}

      {recipeRows.length > 0 && <SectionHeading>Recipes</SectionHeading>}
      {recipeRows.map(({ recipe: r, saved }) => (
        <div key={r.id} {...shelfReorder.pressProps}>
          <Link
            href={`/recipe/${r.id}`}
            className="flex items-center gap-2.5 border-b border-rule-soft bg-cream py-3.5"
          >
            {recipeBody(r, saved)}
          </Link>
        </div>
      ))}
      {confirmSheets}
    </div>
  );
}

// What can be done to a cookbook or recipe in edit mode, as a short list
// in the same sheet as the cookbook popups. Picking one closes the list.
function OptionsSheet({
  title,
  options,
  onClose,
}: {
  title: string;
  options: { label: string; danger?: boolean; onClick: () => void }[];
  onClose: () => void;
}) {
  return (
    <ShelfSheet title={title} label={`Options for ${title}`} onClose={onClose}>
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => {
            onClose();
            o.onClick();
          }}
          className={`block w-full border-t border-rule-soft py-3.5 text-left font-mono text-[14px] first:border-t-0 ${
            o.danger ? 'text-accent' : 'text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </ShelfSheet>
  );
}

// The small heading over each part of the Recipes tab: the shelves, then
// the recipes that aren't on one. Set in the body font, like the
// "Ingredients" subhead on an expanded feed post, with room for an action
// on the far right (Shelves has New shelf).
function SectionHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 font-mono text-[12px] leading-none text-ink-mute first:mt-3">
      <span className="uppercase tracking-[0.08em]">{children}</span>
      {action}
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
            ? `The ${shelf.count} recipe${shelf.count === 1 ? '' : 's'} in it stay in your recipes — this just removes the cookbook.`
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
          <div className="border border-rule p-5 text-center font-mono text-[14px] leading-relaxed text-ink-mute">
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
