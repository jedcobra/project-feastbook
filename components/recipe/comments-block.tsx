import { Avatar } from '@/components/avatar';
import { Label } from '@/components/label';
import { PencilIcon } from '@/components/icons';
import { byHandle } from '@/lib/fixtures';
import type { RecipeComment } from '@/lib/types';

export function CommentsBlock({ comments }: { comments: RecipeComment[] }) {
  return (
    <div className="pb-8">
      <div className="mb-3.5 border-t border-dashed border-rule" />
      <Label className="mb-3">Notes from the table</Label>
      {comments.map((comment, i) => {
        const author = byHandle(comment.by);
        return (
          <div
            key={i}
            className={`py-2.5 ${i === 0 ? '' : 'border-t border-dotted border-rule'}`}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <Avatar name={author.name} size={18} />
              <span className="font-mono text-meta text-ink">{author.name}</span>
              <span className="font-mono text-meta text-ink-mute">· {comment.likes} ♥</span>
            </div>
            <div className="pl-6 font-mono text-[12px] leading-relaxed text-ink-mute">
              {comment.text}
            </div>
          </div>
        );
      })}
      <div className="mt-3.5 flex items-center gap-1.5 rounded-button border border-dashed border-rule px-3 py-2.5 font-mono text-[12px] text-ink-mute">
        <PencilIcon size={13} />
        Leave a note…
      </div>
    </div>
  );
}
