'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ChevronIcon, PlusIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { AddRecipesToShelfSheet } from '@/components/shelves/add-recipes-to-shelf-sheet';
import { EditShelfSheet } from '@/components/shelves/edit-shelf-sheet';
import { TopBar } from '@/components/top-bar';
import { parseDurationMinutes } from '@/lib/format';
import { fetchShelfDetail, type ShelfDetail } from '@/lib/supabase/queries';
import type { Recipe, Shelf } from '@/lib/types';
import { shelfVisibilityLabel } from '@/lib/visibility';
import { HandleLink } from '@/components/handle-link';

type SortKey = 'added' | 'title' | 'time';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'added', label: 'Recently added' },
  { key: 'title', label: 'A–Z' },
  { key: 'time', label: 'Quickest' },
];

// One shelf on its own page — where search results and shared links land.
// The owner's Edit opens the same Edit shelf popup as the cookbook does.
export function ShelfDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [shelf, setShelf] = useState<ShelfDetail | null | undefined>(undefined);
  const [sort, setSort] = useState<SortKey>('added');
  const [editing, setEditing] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  useEffect(() => {
    fetchShelfDetail(id).then(setShelf);
  }, [id]);

  const isOwner = !!profile && shelf?.ownerId === profile.id;

  const sorted = useMemo(() => {
    if (!shelf) return [];
    if (sort === 'title') return [...shelf.recipes].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'time')
      return [...shelf.recipes].sort(
        (a, b) => (parseDurationMinutes(a.time) || 999) - (parseDurationMinutes(b.time) || 999),
      );
    return shelf.recipes;
  }, [shelf, sort]);

  const handleRecipesAdded = (added: Recipe[]) => {
    setShelf((s) => (s ? { ...s, recipes: [...added, ...s.recipes] } : s));
  };

  // The Edit popup reports changes as a Shelf, whose recipes are just ids:
  // keep the full recipes still on it, and reload if it gained any.
  const handleShelfChange = (next: Shelf) => {
    setShelf((s) => {
      if (!s) return s;
      const ids = new Set(next.recipes.map((r) => r.id));
      return {
        ...s,
        title: next.title,
        subtitle: next.subtitle,
        visibility: next.visibility,
        emoji: next.emoji ?? null,
        coverUrl: next.coverUrl ?? null,
        stickerUrl: next.stickerUrl ?? null,
        postedAt: next.postedAt ?? null,
        recipes: s.recipes.filter((r) => ids.has(r.id)),
      };
    });
    if (shelf && next.recipes.some((r) => !shelf.recipes.some((x) => x.id === r.id))) {
      fetchShelfDetail(id).then(setShelf);
    }
  };

  if (shelf === undefined) {
    return (
      <>
        <TopBar backHref="/me" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[14px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (shelf === null) {
    return (
      <>
        <TopBar backHref="/me" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[14px] text-ink-mute">Not available.</span>
        </div>
      </>
    );
  }

  const asShelf: Shelf = {
    id: shelf.id,
    title: shelf.title,
    subtitle: shelf.subtitle,
    visibility: shelf.visibility,
    emoji: shelf.emoji,
    coverUrl: shelf.coverUrl,
    stickerUrl: shelf.stickerUrl,
    postedAt: shelf.postedAt,
    count: shelf.recipes.length,
    recipes: shelf.recipes.map((r) => ({ id: r.id, title: r.title })),
  };

  return (
    <>
      <TopBar
        title={shelf.emoji ? `${shelf.emoji} ${shelf.title}` : shelf.title}
        backHref="/me"
        subtitle={`${shelf.recipes.length} recipe${shelf.recipes.length === 1 ? '' : 's'} · ${shelfVisibilityLabel(shelf.visibility)}`}
        trailing={
          isOwner && (
            <OutlineBox compact onClick={() => setEditing(true)}>
              Edit
            </OutlineBox>
          )
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {shelf.subtitle && (
          <div className="mb-3.5 font-mono text-[14px] leading-[1.55] text-ink-mute">{shelf.subtitle}</div>
        )}

        <div className="mb-1.5 flex gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={`rounded border border-ink px-2 py-[3px] font-mono text-[12px] ${
                sort === s.key ? 'bg-ink text-cream' : 'bg-transparent text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {sorted.map((r) => (
          <div key={r.id} className="flex items-center gap-2.5 border-t border-rule-soft py-3">
            {r.coverPhotoUrl && <RecipeThumbnail src={r.coverPhotoUrl} alt={r.title} />}
            <Link href={`/recipe/${r.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="min-w-0 flex-1">
                <h3 className="mb-0.5 font-display text-[16px] font-bold text-ink">{r.title}</h3>
                <div className="font-mono text-[12px] text-ink-mute">
                  <HandleLink nested handle={r.author} /> · {r.time} · {r.difficulty}
                </div>
              </div>
              <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
            </Link>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="mt-2.5 border border-rule p-[26px] text-center">
            <div className="mb-1.5 font-display text-[18px] font-bold text-ink">Empty cookbook</div>
            <div className="mb-3.5 font-mono text-[14px] leading-[1.5] text-ink-mute">
              Save a recipe and add it here, or bring one over from another cookbook.
            </div>
            {isOwner && (
              <OutlineBox onClick={() => setAddSheetOpen(true)}>
                <PlusIcon size={13} />
                Add recipes
              </OutlineBox>
            )}
          </div>
        )}
      </div>
      {addSheetOpen && (
        <AddRecipesToShelfSheet
          ownerId={shelf.ownerId}
          shelfId={id}
          existingRecipeIds={new Set(shelf.recipes.map((r) => r.id))}
          onAdded={handleRecipesAdded}
          onClose={() => setAddSheetOpen(false)}
        />
      )}
      {editing && isOwner && (
        <EditShelfSheet
          shelf={asShelf}
          recipes={shelf.recipes}
          onChange={handleShelfChange}
          onDeleted={() => router.push('/me')}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
