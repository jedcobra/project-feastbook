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

// A cookbook in the profile's row of highlights: a circle holding its
// cover photo, sticker or emoji, or else its recipe count. The open one
// gets a heavier ring.
export function ShelfBubble({
  emoji,
  coverUrl,
  stickerUrl,
  count,
  selected,
}: {
  emoji?: string | null;
  coverUrl?: string | null;
  stickerUrl?: string | null;
  count: number;
  selected: boolean;
}) {
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-cream-deep ${
        selected ? 'ring-2 ring-ink ring-offset-2 ring-offset-cream' : 'ring-1 ring-rule'
      }`}
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="h-full w-full object-cover" />
      ) : stickerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={stickerUrl} alt="" className={`h-11 w-11 ${STICKER_CLASS}`} />
      ) : emoji ? (
        <span className={`text-[32px] ${EMOJI_FONT_CLASS}`}>{emoji}</span>
      ) : (
        <span className="font-display text-[24px] font-bold leading-none text-ink">{count}</span>
      )}
    </div>
  );
}
