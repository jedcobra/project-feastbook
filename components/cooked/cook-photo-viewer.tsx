'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/components/auth/auth-provider';
import { AutoGrowTextarea } from '@/components/auto-grow-textarea';
import { Avatar } from '@/components/avatar';
import { ChefKissIcon, XIcon } from '@/components/icons';
import {
  deleteCookPhoto,
  deleteCookPhotoComment,
  fetchCookPhotoComments,
  postCookPhotoComment,
  setCookPhotoKiss,
} from '@/lib/supabase/queries';
import type { CookPhoto, CookPhotoComment } from '@/lib/types';

const kissLabel = (n: number) => `${n} kiss${n === 1 ? '' : 'es'}`;

// The enlarged view of one photo from a Cooked grid: the photo, a chef's
// kiss (like) with its count, which recipe it was, and comments with a box
// to add one. Owners can delete the photo; anyone can delete their own
// comments, and owners can delete any comment on their photo.
export function CookPhotoViewer({
  photo,
  onClose,
  onChange,
  onDeleted,
}: {
  photo: CookPhoto;
  onClose: () => void;
  onChange: (photo: CookPhoto) => void;
  onDeleted: (photoId: string) => void;
}) {
  const { profile } = useAuth();
  const [comments, setComments] = useState<CookPhotoComment[] | null>(null);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kissBusy, setKissBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = profile?.id === photo.userId;

  useEffect(() => {
    fetchCookPhotoComments(photo.id).then(setComments);
  }, [photo.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleKiss = async () => {
    if (!profile || kissBusy) return;
    const next = !photo.kissedByMe;
    const optimistic = { ...photo, kissedByMe: next, kisses: Math.max(0, photo.kisses + (next ? 1 : -1)) };
    setKissBusy(true);
    onChange(optimistic);
    const ok = await setCookPhotoKiss(photo, profile.id, next);
    setKissBusy(false);
    if (!ok) onChange(photo);
  };

  const post = async () => {
    const text = draft.trim();
    if (!profile || !text || posting) return;
    setPosting(true);
    setError(null);
    const comment = await postCookPhotoComment(photo, { id: profile.id, handle: profile.handle }, text);
    setPosting(false);
    if (!comment) {
      setError("Couldn't post that — check your connection and try again.");
      return;
    }
    setComments((cs) => [...(cs ?? []), comment]);
    setDraft('');
  };

  const removeComment = async (comment: CookPhotoComment) => {
    setComments((cs) => cs?.filter((c) => c.id !== comment.id) ?? cs);
    if (!(await deleteCookPhotoComment(comment.id))) {
      setComments((cs) => (cs ? [...cs, comment] : cs));
    }
  };

  const removePhoto = async () => {
    if (await deleteCookPhoto(photo.id)) onDeleted(photo.id);
    else setError("Couldn't delete that photo — try again.");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-30 mx-auto flex max-w-column flex-col bg-ink/40"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Photo by @${photo.handle}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-auto flex max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-cream sm:my-auto"
      >
        <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-dashed border-rule px-4 py-2.5">
          <Link href={`/${photo.handle}`} onClick={onClose} className="flex min-w-0 flex-1 items-center gap-2">
            <Avatar name={photo.handle} size={28} />
            <span className="truncate font-mono text-[14px] font-semibold text-ink">@{photo.handle}</span>
          </Link>
          {isOwner && (
            <button
              type="button"
              onClick={() => setConfirmDelete((c) => !c)}
              className="font-mono text-[12px] text-ink-mute"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink text-ink"
          >
            <XIcon size={12} />
          </button>
        </div>

        {confirmDelete && (
          <div className="flex flex-shrink-0 items-center gap-2 border-b border-dashed border-rule bg-cream-deep px-4 py-2.5 font-mono text-[12px] text-ink">
            <span className="flex-1">Delete this photo and its comments?</span>
            <button type="button" onClick={() => setConfirmDelete(false)} className="px-1 text-ink-mute">
              Cancel
            </button>
            <button type="button" onClick={removePhoto} className="font-semibold text-accent">
              Delete
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.photoUrl} alt={`@${photo.handle}’s ${photo.recipeTitle}`} className="max-h-[60dvh] w-full bg-ink object-contain" />

          <div className="px-4 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleKiss}
                disabled={!profile}
                aria-pressed={photo.kissedByMe}
                aria-label={photo.kissedByMe ? 'Take back kiss' : 'Send a kiss'}
                className={photo.kissedByMe ? 'text-accent' : 'text-ink'}
              >
                <ChefKissIcon size={22} filled={photo.kissedByMe} />
              </button>
              <span className="font-mono text-[14px] font-semibold text-ink">{kissLabel(photo.kisses)}</span>
            </div>
            <div className="mt-1.5 font-mono text-[14px] leading-[1.45] text-ink">
              <span className="font-semibold">@{photo.handle}</span> <span className="text-ink-mute">cooked</span>{' '}
              <Link
                href={`/recipe/${photo.recipeId}`}
                onClick={onClose}
                className="underline decoration-dashed underline-offset-[3px]"
              >
                {photo.recipeTitle}
              </Link>
            </div>
            <div className="mt-0.5 font-mono text-[12px] text-ink-mute">{photo.at}</div>
          </div>

          <div className="px-4 pb-3 pt-2">
            {comments === null ? (
              <div className="py-2 font-mono text-[12px] text-ink-mute">Loading comments…</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 py-2">
                  <Link href={`/${c.handle}`} onClick={onClose} className="flex-shrink-0">
                    <Avatar name={c.handle} size={26} />
                  </Link>
                  <div className="min-w-0 flex-1 font-mono text-[14px] leading-[1.45] text-ink">
                    <div className="break-words">
                      <Link href={`/${c.handle}`} onClick={onClose} className="font-semibold">
                        @{c.handle}
                      </Link>{' '}
                      {c.text}
                    </div>
                    <div className="mt-0.5 flex gap-3 text-[12px] text-ink-mute">
                      <span>{c.at}</span>
                      {(c.authorId === profile?.id || isOwner) && (
                        <button type="button" onClick={() => removeComment(c)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {profile && (
          <div className="flex-shrink-0 border-t border-dashed border-rule px-4 pb-[18px] pt-2.5">
            {error && <div className="mb-2 font-mono text-[12px] text-accent">{error}</div>}
            <div className="flex items-end gap-2 rounded-button border border-ink bg-cream-surface px-2.5 py-2">
              <AutoGrowTextarea
                value={draft}
                rows={1}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={comments?.length ? 'Add a comment…' : 'Be the first to comment…'}
                className="max-h-[25dvh] flex-1 resize-none border-none bg-transparent py-1.5 font-mono text-[16px] leading-[1.4] text-ink outline-none placeholder:text-ink-mute"
              />
              <button
                type="button"
                onClick={post}
                disabled={!draft.trim() || posting}
                className={`rounded-button border border-ink px-3 py-1.5 font-mono text-[13px] ${
                  draft.trim() ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
                }`}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
