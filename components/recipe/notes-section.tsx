'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { HeartIcon, PencilIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { NoteComposer } from '@/components/recipe/note-composer';
import { ZoomablePhoto } from '@/components/photo-viewer';
import { deleteComment, hasCooked, postComment, toggleCommentLike, updateComment } from '@/lib/supabase/queries';
import type { RecipeComment } from '@/lib/types';

type Filter = 'all' | 'cooked' | 'questions';

const COMPOSER_ID = 'note-composer';

// The full notes thread, at the bottom of the recipe itself: the note box
// first (new notes land right under it), then every note with its replies,
// likes, and edit/delete for your own. A note is marked "cooked it" when
// its author has cooked the recipe by the time they post it.
export function NotesSection({
  recipeId,
  authorId,
  comments,
  onCommentsChange,
}: {
  recipeId: string;
  authorId: string;
  comments: RecipeComment[];
  onCommentsChange: (fn: (comments: RecipeComment[]) => RecipeComment[]) => void;
}) {
  const { profile } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [replyTo, setReplyTo] = useState<RecipeComment | null>(null);
  const [editing, setEditing] = useState<RecipeComment | null>(null);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);
  const shown = comments.filter((c) => (filter === 'all' ? true : filter === 'cooked' ? c.cooked : c.isQuestion));
  const updateComments = onCommentsChange;
  const focusComposer = () => document.getElementById(COMPOSER_ID)?.focus();

  // Arriving from an old notes link (/recipe/[id]/comments → #notes): the
  // recipe loads after the browser's own hash jump, so scroll here once
  // the section exists.
  useEffect(() => {
    if (window.location.hash === '#notes') document.getElementById('notes')?.scrollIntoView();
  }, []);

  const handleLike = async (comment: RecipeComment) => {
    if (!profile) return;
    const next = !comment.likedByMe;
    updateComments((comments) =>
      comments.map((c) => applyToComment(c, comment.id, (m) => ({ ...m, likedByMe: next, likes: m.likes + (next ? 1 : -1) }))),
    );
    await toggleCommentLike(comment.id, profile.id, next);
  };

  const handleDelete = async (comment: RecipeComment) => {
    if (editing?.id === comment.id) cancelEdit();
    updateComments((comments) => removeComment(comments, comment.id));
    await deleteComment(comment.id);
  };

  // Editing reuses the composer at the bottom: it fills with the note's
  // text and photo, and Post becomes Save.
  const startEdit = (comment: RecipeComment) => {
    setReplyTo(null);
    setEditing(comment);
    setDraft(comment.text);
    setPhotoUrl(comment.photoUrl ?? '');
    setPostError(null);
    // Synchronous with the tap, so phones open the keyboard too (and the
    // page scrolls up to the box).
    focusComposer();
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
    setPhotoUrl('');
  };

  const startReply = (comment: RecipeComment) => {
    if (editing) cancelEdit();
    setReplyTo(comment);
    focusComposer();
  };

  const handleSaveEdit = async (comment: RecipeComment) => {
    const text = draft.trim();
    setPosting(true);
    setPostError(null);
    const ok = await updateComment(comment.id, text, photoUrl || null);
    setPosting(false);
    if (!ok) {
      setPostError("Couldn't save that — check your connection and try again.");
      return;
    }
    updateComments((comments) =>
      comments.map((c) =>
        applyToComment(c, comment.id, (m) => ({
          ...m,
          text,
          photoUrl: photoUrl || undefined,
          isQuestion: text.endsWith('?'),
          edited: m.edited || text !== m.text || (photoUrl || undefined) !== m.photoUrl,
        })),
      ),
    );
    cancelEdit();
  };

  const handlePost = async () => {
    if (!draft.trim() || !profile || posting) return;
    if (editing) return handleSaveEdit(editing);
    setPosting(true);
    setPostError(null);
    let comment: RecipeComment | null = null;
    try {
      const cooked = !replyTo && (await hasCooked(profile.id, recipeId));
      comment = await postComment(profile.id, recipeId, draft.trim(), {
        parentId: replyTo?.id,
        cooked,
        recipeAuthorId: authorId,
        photoUrl: photoUrl || undefined,
      });
    } catch (err) {
      console.error('handlePost', err);
    }
    setPosting(false);
    if (comment) {
      updateComments((comments) =>
        replyTo ? comments.map((c) => (c.id === replyTo.id ? { ...c, replies: [...c.replies, comment!] } : c)) : [comment!, ...comments],
      );
      setDraft('');
      setReplyTo(null);
      setPhotoUrl('');
    } else {
      setPostError("Couldn't post that — check your connection and try again.");
    }
  };


  return (
    <div id="notes" className="scroll-mt-4">
      <div className="mb-3.5 border-t border-dashed border-rule" />
      <div className="mb-3 flex items-baseline gap-2">
        <Label className="flex-1">Notes from the table</Label>
        {total > 0 && (
          <span className="font-mono text-[12px] text-ink-mute">
            {total} note{total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {profile ? (
        <div className="mb-3">
          {postError && <div className="mb-2 font-mono text-[12px] text-accent">{postError}</div>}
          {replyTo && (
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[12px] text-ink-mute">
              <span>Replying to @{replyTo.handle}</span>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setPhotoUrl('');
                }}
                className="px-1 text-[16px] leading-none text-ink"
              >
                ×
              </button>
            </div>
          )}
          {editing && (
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[12px] text-ink-mute">
              <span>Editing your note</span>
              <button type="button" onClick={cancelEdit} className="px-1 text-[16px] leading-none text-ink">
                ×
              </button>
            </div>
          )}
          <NoteComposer
            id={COMPOSER_ID}
            profileId={profile.id}
            value={draft}
            onChange={setDraft}
            placeholder={
              editing ? 'Edit your note…' : replyTo ? 'Write a reply…' : total === 0 ? 'Leave the first note…' : 'Leave a note…'
            }
            photoUrl={photoUrl}
            onPhotoUrlChange={setPhotoUrl}
            onSubmit={handlePost}
            submitLabel={editing ? 'Save' : 'Post'}
            submitting={posting}
            onError={setPostError}
            maxHeightClassName=""
          />
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-2 rounded-button border border-dashed border-rule px-3 py-2.5 font-mono text-[14px] text-ink-mute">
          <PencilIcon size={15} />
          Sign in to leave a note
        </div>
      )}

      {total > 0 && (
        <div className="mb-1 flex gap-1.5">
          {(
            [
              ['all', 'All'],
              ['cooked', 'Cooked it'],
              ['questions', 'Questions'],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded border border-ink px-2.5 py-2 font-mono text-[12px] leading-none ${
                filter === key ? 'bg-ink text-cream' : 'bg-transparent text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {total === 0 ? (
        <div className="font-mono text-[14px] leading-[1.55] text-ink-mute">
          If you change something, or it goes wrong, say so here. That&rsquo;s what makes the recipe better next time.
        </div>
      ) : shown.length === 0 ? (
        <div className="py-4 font-mono text-[14px] text-ink-mute">Nothing under this filter yet.</div>
      ) : (
        shown.map((comment) => (
          <div key={comment.id} className="border-t border-dashed border-rule">
            <NoteRow
              comment={comment}
              depth={0}
              viewerId={profile?.id ?? null}
              onLike={handleLike}
              onReply={startReply}
              onEdit={startEdit}
              onDelete={handleDelete}
              onOpenProfile={(handle) => router.push(`/${handle}`)}
            />
          </div>
        ))
      )}
    </div>
  );
}

function applyToComment(comment: RecipeComment, id: string, fn: (c: RecipeComment) => RecipeComment): RecipeComment {
  if (comment.id === id) return fn(comment);
  return { ...comment, replies: comment.replies.map((r) => applyToComment(r, id, fn)) };
}

function removeComment(comments: RecipeComment[], id: string): RecipeComment[] {
  return comments.filter((c) => c.id !== id).map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== id) }));
}

function NoteRow({
  comment,
  depth,
  viewerId,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onOpenProfile,
}: {
  comment: RecipeComment;
  depth: number;
  viewerId: string | null;
  onLike: (c: RecipeComment) => void;
  onReply: (c: RecipeComment) => void;
  onEdit: (c: RecipeComment) => void;
  onDelete: (c: RecipeComment) => void;
  onOpenProfile: (handle: string) => void;
}) {
  const mine = viewerId === comment.authorId;
  return (
    <div className={depth ? 'ml-[42px]' : ''}>
      <div className="flex items-start gap-2.5 py-3">
        <button type="button" onClick={() => onOpenProfile(comment.handle)} className="flex-shrink-0">
          <Avatar name={comment.handle} size={depth ? 24 : 32} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenProfile(comment.handle)}
              className="font-mono text-[14px] font-semibold text-ink"
            >
              @{comment.handle}
            </button>
            {comment.cooked && !depth && (
              <span className="border border-accent px-1 font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
                cooked it
              </span>
            )}
            <span className="flex-1" />
            <span className="font-mono text-[12px] text-ink-mute">
              {comment.at}
              {comment.edited && ' · edited'}
            </span>
          </div>
          <div className="mt-0.5 break-words font-mono text-[14px] leading-[1.45] text-ink">{comment.text}</div>
          {comment.photoUrl && (
            <ZoomablePhoto
              src={comment.photoUrl}
              alt={`Photo from @${comment.handle}`}
              className="h-24 w-24 rounded-button border border-rule object-cover"
            />
          )}
          <div className="mt-1.5 flex items-center gap-4">
            <button
              type="button"
              onClick={() => onLike(comment)}
              disabled={!viewerId}
              className={`flex items-center gap-1 font-mono text-[12px] ${comment.likedByMe ? 'text-accent' : 'text-ink-mute'}`}
            >
              <HeartIcon size={14} filled={comment.likedByMe} />
              {comment.likes > 0 ? comment.likes : ''}
            </button>
            {depth === 0 && viewerId && (
              <button type="button" onClick={() => onReply(comment)} className="font-mono text-[12px] text-ink-mute">
                Reply
              </button>
            )}
            {mine && (
              <button type="button" onClick={() => onEdit(comment)} className="font-mono text-[12px] text-ink-mute">
                Edit
              </button>
            )}
            {mine && (
              <button type="button" onClick={() => onDelete(comment)} className="font-mono text-[12px] text-ink-mute">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies.map((reply) => (
        <NoteRow
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          viewerId={viewerId}
          onLike={onLike}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenProfile={onOpenProfile}
        />
      ))}
    </div>
  );
}
