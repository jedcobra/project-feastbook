interface AvatarProps {
  name: string;
  size?: number;
}

// Monogram avatar — indigo ring, no photo uploads in v1.
export function Avatar({ name, size = 28 }: AvatarProps) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full border border-ink bg-cream-deep font-display font-bold text-ink"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}
