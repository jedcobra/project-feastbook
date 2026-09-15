import { Avatar } from '@/components/avatar';
import { Label } from '@/components/label';
import type { RecipeComment } from '@/lib/types';

export function CommentsBlock({ comments }: { comments: RecipeComment[] }) {
  if (comments.length === 0) return null;

  return (
    <div>
      <div className="mb-3.5 border-t border-dashed border-rule" />
      <Label className="mb-3">Notes from the table</Label>
      {comments.map((comment, i) => (
        <div key={i} className={`py-2.5 ${i === 0 ? '' : 'border-t border-dotted border-rule'}`}>
          <div className="mb-1 flex items-center gap-1.5">
            <Avatar name={comment.by} size={18} />
            <span className="font-mono text-meta text-ink">{comment.by}</span>
            <span className="font-mono text-meta text-ink-mute">· {comment.likes} ♥</span>
          </div>
          <div className="pl-6 font-mono text-[12px] leading-relaxed text-ink-mute">{comment.text}</div>
        </div>
      ))}
    </div>
  );
}
