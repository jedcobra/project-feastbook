'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { AutoGrowTextarea } from '@/components/auto-grow-textarea';
import { Avatar } from '@/components/avatar';
import { CookPhotoViewer } from '@/components/cooked/cook-photo-viewer';
import { KissButton, kissLabel } from '@/components/cooked/kiss-button';
import { HandleLink } from '@/components/handle-link';
import { ChefHatIcon } from '@/components/icons';
import { deleteCookPhotoComment, fetchCookPhotoComments, postCookPhotoComment } from '@/lib/supabase/queries';
import type { CookPhoto, CookPhotoComment } from '@/lib/types';

// Someone's photo of a dish they cooked — the one feed post that breaks
// from the recipe-book entries: a header, the photo full width, then a kiss,
// which recipe it was, and its comments right here in the feed (expand to
// read them, and a box to add one). Tapping the photo opens it large, in the
// same popup as the profile's Cooked grid.
export function FeedPhotoPost({
  photo,
  onChange,
  onDeleted,
}: {
  photo: CookPhoto;
  onChange: (photo: CookPhoto) => void;
  onDeleted: (photoId: string) => void;
}) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Comments load the first time they're expanded. Ones you post here show
  // straight away under the post, expanded or not.
  const [comments, setComments] = useState<CookPhotoComment[] | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [posted, setPosted] = useState<CookPhotoComment[]>([]);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const inputId = `photo-comment-${photo.id}`;
  const isOwner = profile?.id === photo.userId;

  const expandComments = () => {
    setShowComments(true);
    if (comments === null) {
      fetchCookPhotoComments(photo.id).then((cs) => {
        setComments(cs);
        // Anything posted here is in that list now.
        setPosted([]);
      });
    }
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
    if (comments) setComments([...comments, comment]);
    else setPosted((ps) => [...ps, comment]);
    onChange({ ...photo, commentCount: photo.commentCount + 1 });
    setDraft('');
  };

  const remove = async (comment: CookPhotoComment) => {
    setComments((cs) => cs?.filter((c) => c.id !== comment.id) ?? cs);
    setPosted((ps) => ps.filter((c) => c.id !== comment.id));
    onChange({ ...photo, commentCount: Math.max(0, photo.commentCount - 1) });
    if (!(await deleteCookPhotoComment(comment.id))) {
      setError("Couldn't delete that comment — try again.");
      onChange({ ...photo });
      if (comments) fetchCookPhotoComments(photo.id).then(setComments);
    }
  };

  const visibleComments = showComments && comments ? comments : posted;

  return (
    <article className="border-b border-dashed border-rule pb-3.5">
      <div className="flex items-center gap-2 px-5 pb-2.5 pt-3.5">
        <Link href={`/${photo.handle}`} className="flex min-w-0 items-center gap-2">
          <Avatar name={photo.handle} src={photo.avatarUrl} size={28} />
          <span className="truncate font-mono text-[14px] font-semibold text-ink">@{photo.handle}</span>
        </Link>
        <span className="flex flex-shrink-0 items-center gap-1 font-mono text-meta text-ink-mute">
          <ChefHatIcon size={16} />
          cooked
        </span>
        <span className="ml-auto flex-shrink-0 font-mono text-meta text-ink-mute">{photo.at}</span>
      </div>

      <button type="button" onClick={() => setOpen(true)} aria-label="Open photo" className="block w-full bg-cream-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.photoUrl}
          alt={`@${photo.handle}’s ${photo.recipeTitle}`}
          loading="lazy"
          className="aspect-[2/1] w-full object-cover"
        />
      </button>

      <div className="flex items-center gap-4 px-5 pt-2.5">
        <div className="flex items-center gap-2">
          <KissButton photo={photo} onChange={onChange} onError={setError} />
          <span className="font-mono text-[14px] text-ink">{kissLabel(photo.kisses)}</span>
        </div>
      </div>
      {error && <div className="px-5 pt-1.5 font-mono text-[12px] text-accent">{error}</div>}

      <div className="px-5 pt-1.5 font-mono text-[14px] leading-[1.45] text-ink">
        <HandleLink handle={photo.handle} className="font-semibold" /> <span className="text-ink-mute">cooked</span>{' '}
        <Link href={`/recipe/${photo.recipeId}`} className="underline decoration-dashed underline-offset-[3px]">
          {photo.recipeTitle}
        </Link>
      </div>
      {photo.commentCount > 0 && !showComments && (
        <button type="button" onClick={expandComments} className="px-5 pt-1 font-mono text-[12px] text-ink-mute">
          {photo.commentCount === 1 ? 'View 1 comment' : `View all ${photo.commentCount} comments`}
        </button>
      )}
      {showComments && comments === null && (
        <div className="px-5 pt-1 font-mono text-[12px] text-ink-mute">Loading comments…</div>
      )}

      {visibleComments.length > 0 && (
        <div className="px-5 pt-1.5">
          {visibleComments.map((c) => (
            <div key={c.id} className="py-1 font-mono text-[14px] leading-[1.45] text-ink">
              <span className="break-words">
                <HandleLink handle={c.handle} className="font-semibold" /> {c.text}
              </span>
              <span className="ml-2 whitespace-nowrap text-[12px] text-ink-mute">
                {c.at}
                {(c.authorId === profile?.id || isOwner) && (
                  <button type="button" onClick={() => remove(c)} className="ml-2">
                    Delete
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {profile && (
        <div className="mx-5 mt-2 flex items-end gap-2 border-b border-dotted border-rule pb-1">
          <AutoGrowTextarea
            id={inputId}
            value={draft}
            rows={1}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isOwner ? 'Add a comment…' : `Leave a comment for @${photo.handle}`}
            className="max-h-[30dvh] flex-1 resize-none border-none bg-transparent py-1 font-mono text-[16px] leading-[1.4] text-ink outline-none placeholder:text-[14px] placeholder:text-ink-mute"
          />
          {draft.trim() && (
            <button
              type="button"
              onClick={post}
              disabled={posting}
              className="pb-1 font-mono text-[14px] font-semibold text-ink disabled:opacity-50"
            >
              {posting ? '…' : 'Post'}
            </button>
          )}
        </div>
      )}

      {open && (
        <CookPhotoViewer
          photo={photo}
          onClose={() => {
            setOpen(false);
            // Comments may have changed in the popup — refresh any shown here.
            if (comments) fetchCookPhotoComments(photo.id).then(setComments);
          }}
          onChange={onChange}
          onDeleted={(id) => {
            setOpen(false);
            onDeleted(id);
          }}
        />
      )}
    </article>
  );
}
