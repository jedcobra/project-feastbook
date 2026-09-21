'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ChevronIcon, TrashIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { TopBar } from '@/components/top-bar';
import { parseDurationMinutes } from '@/lib/format';
import { deleteShelf, fetchShelfDetail, removeRecipeFromShelf, type ShelfDetail } from '@/lib/supabase/queries';
import { shelfVisibilityLabel } from '@/lib/visibility';

type SortKey = 'added' | 'title' | 'time';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'added', label: 'Recently added' },
  { key: 'title', label: 'A–Z' },
  { key: 'time', label: 'Quickest' },
];

export function ShelfDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [shelf, setShelf] = useState<ShelfDetail | null | undefined>(undefined);
  const [sort, setSort] = useState<SortKey>('added');
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleRemove = async (recipeId: string) => {
    setShelf((s) => (s ? { ...s, recipes: s.recipes.filter((r) => r.id !== recipeId) } : s));
    await removeRecipeFromShelf(id, recipeId);
  };

  const handleDeleteShelf = async () => {
    setDeleting(true);
    const ok = await deleteShelf(id);
    if (ok) {
      router.push('/me');
    } else {
      setDeleting(false);
    }
  };

  if (shelf === undefined) {
    return (
      <>
        <TopBar backHref="/me" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (shelf === null) {
    return (
      <>
        <TopBar backHref="/me" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">Not available.</span>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title={shelf.title}
        backHref="/me"
        subtitle={`${shelf.recipes.length} recipe${shelf.recipes.length === 1 ? '' : 's'} · ${shelfVisibilityLabel(shelf.visibility)}`}
        trailing={
          isOwner && (
            <OutlineBox compact onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done' : 'Edit'}
            </OutlineBox>
          )
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {shelf.subtitle && <div className="mb-3.5 font-mono text-[12px] leading-[1.55] text-ink-mute">{shelf.subtitle}</div>}

        <div className="mb-1.5 flex gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={`rounded border border-ink px-2 py-[3px] font-mono text-[10.5px] ${
                sort === s.key ? 'bg-ink text-cream' : 'bg-transparent text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {sorted.map((r) => (
          <div key={r.id} className="flex items-center gap-2.5 border-t border-dashed border-rule py-3">
            {editing ? (
              <>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-0.5 font-display text-[16px] font-bold text-ink">{r.title}</h3>
                  <div className="font-mono text-[10.5px] text-ink-mute">
                    @{r.author} · {r.time} · {r.difficulty}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(r.id)}
                  className="flex-shrink-0 font-mono text-[11px] text-accent"
                >
                  Remove
                </button>
              </>
            ) : (
              <Link href={`/recipe/${r.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <h3 className="mb-0.5 font-display text-[16px] font-bold text-ink">{r.title}</h3>
                  <div className="font-mono text-[10.5px] text-ink-mute">
                    @{r.author} · {r.time} · {r.difficulty}
                  </div>
                </div>
                <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
              </Link>
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="mt-2.5 border border-dashed border-rule p-[26px] text-center">
            <div className="mb-1.5 font-display text-[18px] font-bold text-ink">Empty shelf</div>
            <div className="font-mono text-[12px] leading-[1.5] text-ink-mute">
              Save a recipe and file it here, or move things over from another shelf.
            </div>
          </div>
        )}

        {editing && isOwner && (
          <div className="mt-5 border-t border-dashed border-rule pt-4">
            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-2.5 font-mono text-[12.5px] text-accent"
              >
                <TrashIcon size={16} />
                Delete shelf
              </button>
            ) : (
              <div className="border border-accent p-3">
                <div className="mb-2.5 font-mono text-[11.5px] leading-[1.55] text-ink">
                  Delete &ldquo;{shelf.title}&rdquo;?{' '}
                  {shelf.recipes.length > 0
                    ? `The ${shelf.recipes.length} recipe${shelf.recipes.length === 1 ? '' : 's'} on it stay in your cookbook — this just removes the shelf.`
                    : 'This can’t be undone.'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 rounded-button border border-ink bg-transparent py-2 font-mono text-[12px] text-ink"
                  >
                    Keep it
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteShelf}
                    disabled={deleting}
                    className="flex-1 rounded-button border border-accent bg-accent py-2 font-mono text-[12px] text-cream disabled:opacity-60"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
