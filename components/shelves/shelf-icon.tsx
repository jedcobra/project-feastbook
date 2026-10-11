import { EMOJI_FONT_CLASS } from '@/lib/shelf-emoji';

// A sticker's white die-cut edge and soft shadow, traced around its shape
// rather than its box.
export const STICKER_CLASS =
  'object-contain [filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)_drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]';

// A shelf's icon: its cover photo, its sticker or its emoji, or else how
// many recipes are on it in a rounded square. All take the same space so
// shelf names line up whichever a shelf has.
export function ShelfIcon({
  emoji,
  coverUrl,
  stickerUrl,
  count,
}: {
  emoji?: string | null;
  coverUrl?: string | null;
  stickerUrl?: string | null;
  count: number;
}) {
  if (coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverUrl} alt="" className="h-9 w-9 flex-shrink-0 rounded-button object-cover" />;
  }
  if (stickerUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={stickerUrl} alt="" className={`h-9 w-9 flex-shrink-0 p-px ${STICKER_CLASS}`} />;
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
