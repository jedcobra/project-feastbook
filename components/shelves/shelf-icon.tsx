// A sticker's white die-cut edge and soft shadow, traced around its shape
// rather than its box.
export const STICKER_CLASS =
  'object-contain [filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)_drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]';

// The photo a cookbook shows when its owner hasn't chosen one: the first
// of its recipes, in the cookbook's order, that has a cover photo.
export function firstRecipePhoto(recipes: { coverPhotoUrl?: string }[]): string | undefined {
  return recipes.find((r) => r.coverPhotoUrl)?.coverPhotoUrl;
}

// A shelf's icon: the photo its owner chose (or a sticker from when those
// were offered), else its first recipe's photo, else how many recipes are
// on it in a rounded square. All take the same space so shelf names line
// up whichever a shelf has.
export function ShelfIcon({
  coverUrl,
  stickerUrl,
  fallbackUrl,
  count,
}: {
  coverUrl?: string | null;
  stickerUrl?: string | null;
  fallbackUrl?: string;
  count: number;
}) {
  if (stickerUrl && !coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={stickerUrl} alt="" className={`h-9 w-9 flex-shrink-0 p-px ${STICKER_CLASS}`} />;
  }
  const photo = coverUrl || fallbackUrl;
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className="h-9 w-9 flex-shrink-0 rounded-button object-cover" />;
  }
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-button border border-ink">
      <span className="font-mono text-[14px] font-semibold text-ink">{count}</span>
    </div>
  );
}

// A cookbook in the profile's row of highlights: a rounded square holding
// the same as its icon — its photo, its first recipe's photo, or its
// recipe count. The open one gets a heavier ring.
export function ShelfBubble({
  coverUrl,
  stickerUrl,
  fallbackUrl,
  count,
  selected,
}: {
  coverUrl?: string | null;
  stickerUrl?: string | null;
  fallbackUrl?: string;
  count: number;
  selected: boolean;
}) {
  const photo = coverUrl || (stickerUrl ? null : fallbackUrl);
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-cream-deep ${
        selected ? 'ring-2 ring-ink ring-offset-2 ring-offset-cream' : 'ring-1 ring-rule'
      }`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : stickerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={stickerUrl} alt="" className={`h-11 w-11 ${STICKER_CLASS}`} />
      ) : (
        <span className="font-display text-[24px] font-bold leading-none text-ink">{count}</span>
      )}
    </div>
  );
}
