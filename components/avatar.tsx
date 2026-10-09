interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

// The one answer for "what does a person look like" — a photo when
// they've uploaded one, otherwise the monogram ring it's always been.
export function Avatar({ name, src, size = 28, className = 'border border-ink' }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`flex-shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-cream-deep font-display font-bold text-ink ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}
