import { EMOJI_FONT_CLASS } from '@/lib/food-emoji';

// A shelf's square icon: its food emoji if one was picked, otherwise how
// many recipes are on it.
export function ShelfIcon({ emoji, count }: { emoji?: string | null; count: number }) {
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-ink">
      {emoji ? (
        <span className={`text-[20px] ${EMOJI_FONT_CLASS}`}>{emoji}</span>
      ) : (
        <span className="font-mono text-[14px] font-semibold text-ink">{count}</span>
      )}
    </div>
  );
}
