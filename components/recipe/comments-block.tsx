'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { PencilIcon } from '@/components/icons';
import { ZoomablePhoto } from '@/components/photo-viewer';
import { Label } from '@/components/label';
import { NoteComposer } from '@/components/recipe/note-composer';
import { postComment } from '@/lib/supabase/queries';
import type { RecipeComment } from '@/lib/types';

// A two-note preview on the detail page itself, with the same note box as
// the full thread (photo included) so leaving a note never has to leave the
// recipe screen. Replies, likes and the cooked-it/questions filters live at
// the full thread, /recipe/[id]/comments.
export function CommentsBlock({
  recipeId,
  authorId,
  comments,
  onPosted,
}: {
  recipeId: string;
  authorId: string;
  comments: RecipeComment[];
  onPosted: (comment: RecipeComment) => void;
}) {
  const { profile } = useAuth();
  const [draft, setDraft] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  const handlePost = async () => {
    if (!draft.trim() || !profile || posting) return;
    setPosting(true);
    setError(null);
    const comment = await postComment(profile.id, recipeId, draft.trim(), {
      recipeAuthorId: authorId,
      photoUrl: photoUrl || undefined,
    });
    setPosting(false);
    if (comment) {
      onPosted(comment);
      setDraft('');
      setPhotoUrl('');
    } else {
      setError("Couldn't post that — check your connection and try again.");
    }
  };

  return (
    <div>
      <div className="mb-3.5 border-t border-dashed border-rule" />
      <div className="mb-3 flex items-baseline gap-2">
        <Label className="flex-1">Notes from the table</Label>
        {total > 0 && (
          <Link
            href={`/recipe/${recipeId}/comments`}
            className="font-mono text-[12px] text-ink-mute underline decoration-dashed underline-offset-[3px]"
          >
            All {total} →
          </Link>
        )}
      </div>
      {comments.slice(0, 2).map((comment, i) => (
        <div
          key={comment.id}
          className={`flex items-start gap-2.5 py-3 ${i === 0 ? '' : 'border-t border-dotted border-rule'}`}
        >
          <Avatar name={comment.handle} size={32} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[14px] font-semibold text-ink">@{comment.handle}</span>
              {comment.likes > 0 && <span className="font-mono text-[12px] text-ink-mute">· {comment.likes} ♥</span>}
              {comment.edited && <span className="font-mono text-[12px] text-ink-mute">· edited</span>}
            </div>
            <div className="mt-0.5 break-words font-mono text-[14px] leading-[1.45] text-ink">{comment.text}</div>
            {comment.photoUrl && (
              <ZoomablePhoto
                src={comment.photoUrl}
                alt={`Photo from @${comment.handle}`}
                className="h-20 w-20 rounded-button border border-rule object-cover"
              />
            )}
          </div>
        </div>
      ))}

      {profile ? (
        <div className="mt-3.5">
          <NoteComposer
            profileId={profile.id}
            value={draft}
            onChange={setDraft}
            placeholder={total === 0 ? 'Leave the first note…' : 'Leave a note…'}
            photoUrl={photoUrl}
            onPhotoUrlChange={setPhotoUrl}
            onSubmit={handlePost}
            submitting={posting}
            onError={setError}
            maxHeightClassName=""
          />
        </div>
      ) : (
        <Link
          href={`/recipe/${recipeId}/comments`}
          className="mt-3.5 flex w-full items-center gap-2 rounded-button border border-dashed border-rule px-3 py-2.5 font-mono text-[14px] text-ink-mute"
        >
          <PencilIcon size={15} />
          {total === 0 ? 'Leave the first note…' : 'Leave a note…'}
        </Link>
      )}
      {error && <div className="mt-1.5 font-mono text-[12px] text-accent">{error}</div>}
    </div>
  );
}
