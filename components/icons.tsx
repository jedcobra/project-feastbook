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

export function XIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </StrokeIcon>
  );
}

export function LinkIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M10 13a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
      <path d="M14 11a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
    </StrokeIcon>
  );
}

export function CameraIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3 8a1 1 0 011-1h3l1.5-2h7L17 7h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </StrokeIcon>
  );
}

export function ForkIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="7" cy="6" r="2.5" />
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="12" cy="19" r="2.5" />
      <path d="M7 8.5v2a3 3 0 003 3h4a3 3 0 003-3v-2M12 13.5v3" />
    </StrokeIcon>
  );
}

export function DragIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </StrokeIcon>
  );
}

export function WarnIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 10v4M12 17h.01" />
    </StrokeIcon>
  );
}

export function TimerIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v3l2 2M9 3h6M12 6V3" />
    </StrokeIcon>
  );
}

export function SaveIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 4h11l3 3v13H5V4z" />
      <path d="M8 4v6h8V4M8 20v-6h8v6" />
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

export function TrashIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m3 0l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7h12z" />
      <path d="M10 11v6M14 11v6" />
    </StrokeIcon>
  );
}
