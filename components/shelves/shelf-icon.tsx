import { EMOJI_FONT_CLASS } from '@/lib/shelf-emoji';

// A shelf's icon: its cover photo, or its emoji on its own, or else how
// many recipes are on it in a rounded square. All take the same space so
// shelf names line up whichever a shelf has.
export function ShelfIcon({
  emoji,
  coverUrl,
  count,
}: {
  emoji?: string | null;
  coverUrl?: string | null;
  count: number;
}) {
  if (coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverUrl} alt="" className="h-9 w-9 flex-shrink-0 rounded-button object-cover" />;
  }
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
