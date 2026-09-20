'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PencilIcon } from '@/components/icons';
import { postComment } from '@/lib/supabase/queries';
import type { RecipeComment } from '@/lib/types';

export function AddCommentForm({
  recipeId,
  authorProfileId,
  onPosted,
}: {
  recipeId: string;
  authorProfileId: string | null;
  onPosted: (comment: RecipeComment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authorProfileId) {
    return (
      <Link
        href="/account"
        className="mt-3.5 flex items-center gap-1.5 rounded-button border border-dashed border-rule px-3 py-2.5 font-mono text-[12px] text-ink-mute print:hidden"
      >
        <PencilIcon size={13} />
        Sign in to leave a note…
      </Link>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3.5 flex w-full items-center gap-1.5 rounded-button border border-dashed border-rule px-3 py-2.5 font-mono text-[12px] text-ink-mute print:hidden"
      >
        <PencilIcon size={13} />
        Leave a note…
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const comment = await postComment(authorProfileId, recipeId, text.trim());
    setSubmitting(false);
    if (comment) {
      onPosted(comment);
      setText('');
      setOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3.5 flex flex-col gap-2 print:hidden">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you think?"
        rows={3}
        className="w-full rounded-button border border-ink bg-cream-surface px-3 py-2.5 font-mono text-[12px] text-ink placeholder:text-ink-mute focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-button border border-ink bg-ink px-4 py-2 font-mono text-[12px] font-semibold text-cream disabled:opacity-50"
        >
          {submitting ? 'Posting…' : 'Post note'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-button border border-rule px-4 py-2 font-mono text-[12px] text-ink-mute"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
