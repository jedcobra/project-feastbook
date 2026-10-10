'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { PencilIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { postComment } from '@/lib/supabase/queries';
import type { RecipeComment } from '@/lib/types';

// A two-note preview on the detail page itself, with a quick composer right
// here so leaving a plain note never has to leave the recipe screen. Replies,
// likes, the cooked-it/questions filters, and attaching a photo still live
// at the full thread, /recipe/[id]/comments.
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
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const handlePost = async () => {
    if (!draft.trim() || !profile || posting) return;
    setPosting(true);
    setError(null);
    const comment = await postComment(profile.id, recipeId, draft.trim(), { recipeAuthorId: authorId });
    setPosting(false);
    if (comment) {
      onPosted(comment);
      setDraft('');
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
          <Avatar name={comment.by} size={32} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[14px] font-semibold text-ink">{comment.by}</span>
              {comment.likes > 0 && <span className="font-mono text-[12px] text-ink-mute">· {comment.likes} ♥</span>}
            </div>
            <div className="mt-0.5 break-words font-mono text-[14px] leading-[1.45] text-ink">{comment.text}</div>
            {comment.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={comment.photoUrl}
                alt=""
                className="mt-2 h-20 w-20 rounded-button border border-rule object-cover"
              />
            )}
          </div>
        </div>
      ))}

      {profile ? (
        <div className="mt-3.5 flex items-end gap-2 rounded-button border border-dashed border-rule px-3 py-2.5">
          <PencilIcon size={15} className="mb-[4px] flex-shrink-0 text-ink-mute" />
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePost();
              }
            }}
            placeholder={total === 0 ? 'Leave the first note…' : 'Leave a note…'}
            rows={1}
            className="max-h-32 flex-1 resize-none overflow-y-auto border-none bg-transparent font-mono text-[16px] leading-[1.4] text-ink outline-none placeholder:text-ink-mute"
          />
          <button
            type="button"
            onClick={handlePost}
            disabled={!draft.trim() || posting}
            className="flex-shrink-0 font-mono text-[14px] font-semibold text-ink disabled:text-ink-mute"
          >
            {posting ? '…' : 'Post'}
          </button>
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
