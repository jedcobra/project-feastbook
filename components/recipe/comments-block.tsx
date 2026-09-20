import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { PencilIcon } from '@/components/icons';
import { Label } from '@/components/label';
import type { RecipeComment } from '@/lib/types';

// A two-note preview on the detail page itself — the full thread (replies,
// likes, cooked-it/questions filters) lives at /recipe/[id]/comments.
export function CommentsBlock({ recipeId, comments }: { recipeId: string; comments: RecipeComment[] }) {
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <div>
      <div className="mb-3.5 border-t border-dashed border-rule" />
      <div className="mb-3 flex items-baseline gap-2">
        <Label className="flex-1">Notes from the table</Label>
        {total > 0 && (
          <Link
            href={`/recipe/${recipeId}/comments`}
            className="font-mono text-[11px] text-ink-mute underline decoration-dashed underline-offset-[3px]"
          >
            All {total} →
          </Link>
        )}
      </div>
      {comments.slice(0, 2).map((comment, i) => (
        <div key={comment.id} className={`py-2.5 ${i === 0 ? '' : 'border-t border-dotted border-rule'}`}>
          <div className="mb-1 flex items-center gap-1.5">
            <Avatar name={comment.by} size={18} />
            <span className="font-mono text-meta text-ink">{comment.by}</span>
            {comment.likes > 0 && <span className="font-mono text-meta text-ink-mute">· {comment.likes} ♥</span>}
          </div>
          <div className="pl-6 font-mono text-[12px] leading-relaxed text-ink-mute">{comment.text}</div>
        </div>
      ))}
      <Link
        href={`/recipe/${recipeId}/comments`}
        className="mt-3.5 flex w-full items-center gap-1.5 rounded-button border border-dashed border-rule px-3 py-2.5 font-mono text-[12px] text-ink-mute"
      >
        <PencilIcon size={13} />
        {total === 0 ? 'Leave the first note…' : 'Leave a note…'}
      </Link>
    </div>
  );
}
