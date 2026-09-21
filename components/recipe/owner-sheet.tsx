'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookIcon, ChevronIcon, LinkIcon, PencilIcon, PrintIcon, SaveIcon, TrashIcon } from '@/components/icons';
import { deleteRecipe, fetchRecipeDeleteImpact, updateRecipeVisibility } from '@/lib/supabase/queries';
import type { Visibility } from '@/lib/types';
import { VISIBILITY_OPTIONS, visibilityLabel } from '@/lib/visibility';

interface OwnerSheetProps {
  recipeId: string;
  title: string;
  visibility: Visibility;
  onVisibilityChanged: (v: Visibility) => void;
  onClose: () => void;
}

// The "…" menu on a recipe you wrote: edit, revisions, privacy, copy link,
// print, delete. Everything happens in this one sheet rather than
// scattering owner-only actions across the detail page.
export function OwnerSheet({ recipeId, title, visibility, onVisibilityChanged, onClose }: OwnerSheetProps) {
  const router = useRouter();
  const [view, setView] = useState<'menu' | 'privacy'>('menu');
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [impact, setImpact] = useState<{ comments: number; saves: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  const startDelete = async () => {
    setConfirmingDelete(true);
    setImpact(await fetchRecipeDeleteImpact(recipeId));
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await deleteRecipe(recipeId);
    setDeleting(false);
    if (ok) router.push('/me');
  };

  const copyLink = async () => {
    try {
      // /r/[id] is the public share page — readable without an account,
      // unlike /recipe/[id] which sits behind the sign-in-only tabs shell.
      await navigator.clipboard.writeText(`${window.location.origin}/r/${recipeId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied — nothing else we can do about it.
    }
  };

  const chooseVisibility = async (v: Visibility) => {
    if (v === visibility) {
      setView('menu');
      return;
    }
    setSavingVisibility(true);
    const ok = await updateRecipeVisibility(recipeId, v);
    setSavingVisibility(false);
    if (ok) {
      onVisibilityChanged(v);
      setView('menu');
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30 print:hidden"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
      >
        {view === 'menu' ? (
          <>
            <h3 className="mb-0.5 font-display text-[19px] font-bold text-ink">{title}</h3>
            <div className="mb-3 font-mono text-[11px] text-ink-mute">Yours</div>

            <button
              type="button"
              onClick={() => router.push(`/new/edit?edit=${recipeId}`)}
              className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[11px] text-left"
            >
              <PencilIcon size={16} className="flex-shrink-0 text-ink" />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12.5px] text-ink">Edit recipe</span>
                <span className="block truncate font-mono text-[10.5px] text-ink-mute">
                  Title, ingredients, method, notes
                </span>
              </span>
              <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
            </button>

            <button
              type="button"
              onClick={() => router.push(`/recipe/${recipeId}/revisions`)}
              className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[11px] text-left"
            >
              <SaveIcon size={16} className="flex-shrink-0 text-ink" />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12.5px] text-ink">Revision history</span>
                <span className="block truncate font-mono text-[10.5px] text-ink-mute">
                  Every edit, restorable
                </span>
              </span>
              <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
            </button>

            <button
              type="button"
              onClick={() => setView('privacy')}
              className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[11px] text-left"
            >
              <BookIcon size={16} className="flex-shrink-0 text-ink" />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12.5px] text-ink">Change who can see it</span>
                <span className="block truncate font-mono text-[10.5px] text-ink-mute">
                  Currently: {visibilityLabel(visibility)}
                </span>
              </span>
              <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[11px] text-left"
            >
              <LinkIcon size={16} className="flex-shrink-0 text-ink" />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12.5px] text-ink">Copy link</span>
                <span className="block truncate font-mono text-[10.5px] text-ink-mute">
                  {copied ? 'Copied' : `${typeof window !== 'undefined' ? window.location.host : ''}/r/${recipeId}`}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[11px] text-left"
            >
              <PrintIcon size={16} className="flex-shrink-0 text-ink" />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[12.5px] text-ink">Print or save as PDF</span>
                <span className="block truncate font-mono text-[10.5px] text-ink-mute">
                  One page, no screen furniture
                </span>
              </span>
            </button>

            <div className="mt-1 border-t border-dashed border-rule pt-3">
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={startDelete}
                  className="flex items-center gap-3 font-mono text-[12.5px] text-accent"
                >
                  <TrashIcon size={16} />
                  Delete recipe
                </button>
              ) : (
                <div className="border border-accent p-3">
                  <div className="mb-2.5 font-mono text-[11.5px] leading-[1.55] text-ink">
                    Delete &ldquo;{title}&rdquo;?{' '}
                    {impact
                      ? `The ${impact.comments} note${impact.comments === 1 ? '' : 's'} on it go too. The ${impact.saves} ${impact.saves === 1 ? 'person who' : 'people who'} saved it will lose it.`
                      : 'Checking what this affects…'}
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
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 rounded-button border border-accent bg-accent py-2 font-mono text-[12px] text-cream disabled:opacity-60"
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-3 font-display text-[17px] font-bold text-ink">Who can see it</h3>
            {VISIBILITY_OPTIONS.map((o, i) => {
              const on = visibility === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={savingVisibility}
                  onClick={() => chooseVisibility(o.id)}
                  className={`flex w-full items-start gap-2.5 py-[11px] text-left ${i === 0 ? '' : 'border-t border-dotted border-rule'}`}
                >
                  <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
                    {on && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
                  </span>
                  <span className="flex-1">
                    <span className={`block font-mono text-[13px] ${on ? 'font-semibold' : 'font-normal'} text-ink`}>
                      {o.title}
                    </span>
                    <span className="block font-mono text-[11px] leading-snug text-ink-mute">{o.sub}</span>
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setView('menu')}
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
