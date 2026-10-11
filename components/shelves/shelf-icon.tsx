import { EMOJI_FONT_CLASS } from '@/lib/shelf-emoji';

// A shelf's icon: its emoji on its own if one was picked, otherwise how
// many recipes are on it in a rounded square. Both take the same space so
// shelf names line up either way.
export function ShelfIcon({ emoji, count }: { emoji?: string | null; count: number }) {
  return emoji ? (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
      <span className={`text-[28px] ${EMOJI_FONT_CLASS}`}>{emoji}</span>
    </div>
  ) : (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-button border border-ink">
      <span className="font-mono text-[14px] font-semibold text-ink">{count}</span>
    </div>
  );
}
