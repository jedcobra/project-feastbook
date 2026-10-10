'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { HeartIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { NoteComposer } from '@/components/recipe/note-composer';
import { ZoomablePhoto } from '@/components/photo-viewer';
import { TopBar } from '@/components/top-bar';
import {
  deleteComment,
  fetchRecipeFull,
  hasCooked,
  postComment,
  toggleCommentLike,
  updateComment,
} from '@/lib/supabase/queries';
import type { Person, Recipe, RecipeComment } from '@/lib/types';

type Filter = 'all' | 'cooked' | 'questions';

const COMPOSER_ID = 'note-composer';

export function NotesScreen({ id }: { id: string }) {
  const { profile } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<{ recipe: Recipe; author: Person } | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>('all');
  const [replyTo, setReplyTo] = useState<RecipeComment | null>(null);
  const [editing, setEditing] = useState<RecipeComment | null>(null);
  const [draft, setDraft] = useState('');
  const [cookedMark, setCookedMark] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    fetchRecipeFull(id, profile?.id ?? null).then(setData);
  }, [id, profile?.id]);

  // Pre-check the box if this recipe's already marked cooked (e.g. from the
  // one-tap "I cooked it" on the recipe page itself) — otherwise it'd look
  // unchecked even though the recipe already shows as cooked.
  useEffect(() => {
    if (profile) hasCooked(profile.id, id).then(setCookedMark);
  }, [profile, id]);

  if (data === undefined) {
    return (
      <>
        <TopBar title="Notes" backHref={`/recipe/${id}`} />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[14px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (data === null) {
    return (
      <>
        <TopBar title="Notes" backHref={`/recipe/${id}`} />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[14px] text-ink-mute">Recipe not found.</span>
        </div>
      </>
    );
  }

  const { recipe } = data;
  const total = recipe.comments.reduce((n, c) => n + 1 + c.replies.length, 0);
  const shown = recipe.comments.filter((c) =>
    filter === 'all' ? true : filter === 'cooked' ? c.cooked : c.isQuestion,
  );

  const updateComments = (fn: (comments: RecipeComment[]) => RecipeComment[]) =>
    setData((d) => (d ? { ...d, recipe: { ...d.recipe, comments: fn(d.recipe.comments) } } : d));

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
    // Synchronous with the tap, so phones open the keyboard too.
    document.getElementById(COMPOSER_ID)?.focus();
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
    setPhotoUrl('');
  };

  const startReply = (comment: RecipeComment) => {
    if (editing) cancelEdit();
    setReplyTo(comment);
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
      comment = await postComment(profile.id, id, draft.trim(), {
        parentId: replyTo?.id,
        cooked: !replyTo && cookedMark,
        recipeAuthorId: data.author.id,
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
    <>
      <TopBar title="Notes" backHref={`/recipe/${id}`} subtitle={`${recipe.title} · ${total} note${total === 1 ? '' : 's'}`} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="mb-3 flex items-center gap-2 border-y border-dashed border-rule py-2.5">
          <span className="flex-1 font-mono text-[12px] text-ink-mute">{recipe.madeIt} people cooked this</span>
          {profile && (
            <OutlineBox compact filled={cookedMark} onClick={() => setCookedMark((c) => !c)}>
              {cookedMark ? '✓ Cooked it' : 'I cooked it'}
            </OutlineBox>
          )}
        </div>

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

        {shown.length === 0 ? (
          <div className="mt-4 border border-dashed border-rule p-[22px] text-center">
            <div className="mb-1.5 font-display text-[18px] font-bold text-ink">No notes yet</div>
            <div className="font-mono text-[14px] leading-[1.55] text-ink-mute">
              {filter === 'all'
                ? "If you change something, or it goes wrong, say so here. That's what makes the recipe better next time."
                : 'Nothing under this filter yet.'}
            </div>
          </div>
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

      {profile && (
        <div className="flex-shrink-0 border-t border-dashed border-rule bg-cream px-4 pb-[18px] pt-2.5">
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
            placeholder={editing ? 'Edit your note…' : replyTo ? 'Write a reply…' : 'Leave a note…'}
            photoUrl={photoUrl}
            onPhotoUrlChange={setPhotoUrl}
            onSubmit={handlePost}
            submitLabel={editing ? 'Save' : 'Post'}
            submitting={posting}
            onError={setPostError}
          />
        </div>
      )}
    </>
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
