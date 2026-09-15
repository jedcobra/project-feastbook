interface IconProps {
  size?: number;
  className?: string;
}

interface StrokeIconProps extends IconProps {
  weight?: number;
}

// Minimal line icons — ported from prototype/ss-primitives.jsx.
function StrokeIcon({
  size = 14,
  weight = 1.4,
  className,
  children,
}: StrokeIconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </StrokeIcon>
  );
}

export function BackIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M15 6l-6 6 6 6" />
    </StrokeIcon>
  );
}

export function BookmarkIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 3h12v18l-6-4-6 4V3z" />
    </StrokeIcon>
  );
}

export function ShareIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8 10.5l8-3.5M8 13.5l8 3.5" />
    </StrokeIcon>
  );
}

export function CookIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 10h14M5 10a2 2 0 012-2h10a2 2 0 012 2M6 10v6a3 3 0 003 3h6a3 3 0 003-3v-6" />
      <path d="M9 6l1-2M12 6l1-2M15 6l1-2" />
    </StrokeIcon>
  );
}

export function PencilIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 21l4-1L19 8l-3-3L4 17l-1 4z" />
    </StrokeIcon>
  );
}

export function PlusIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 5v14M5 12h14" />
    </StrokeIcon>
  );
}

export function ChevronIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M9 6l6 6-6 6" />
    </StrokeIcon>
  );
}

export function EditIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </StrokeIcon>
  );
}
