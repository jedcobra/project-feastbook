// The one answer for "what does a recipe photo look like on a card" —
// used everywhere a recipe row renders (feed, discover, profile, search,
// shelves) so a card with a photo and a card without one differ by exactly
// this much, not by whatever each screen improvised.
export function RecipeThumbnail({ src, alt, size = 44 }: { src: string; alt: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="flex-shrink-0 rounded-button border border-rule object-cover"
      style={{ width: size, height: size }}
    />
  );
}
