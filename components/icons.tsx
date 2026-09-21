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

export function WandIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 20l10-10" />
      <path d="M17 4v3M15.5 5.5h3" />
      <path d="M20 9v2M19 10h2" />
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

const GEAR_TOOTH_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function GearIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
      {GEAR_TOOTH_ANGLES.map((angle) => (
        <rect
          key={angle}
          x="10.8"
          y="4.3"
          width="2.4"
          height="3.4"
          rx="0.5"
          fill="currentColor"
          stroke="none"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </StrokeIcon>
  );
}

export function MessageIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v9a1.5 1.5 0 01-1.5 1.5H9l-4 4v-4H5.5A1.5 1.5 0 014 14.5v-9z" />
    </StrokeIcon>
  );
}

export function MoreIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

export function BookIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 5.5A1.5 1.5 0 016.5 4H19v15H6.5A1.5 1.5 0 015 17.5v-12z" />
      <path d="M8 4v15" />
    </StrokeIcon>
  );
}

export function PrintIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 8V4h12v4" />
      <path d="M6 17H4a1 1 0 01-1-1v-6a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1h-2" />
      <path d="M6 13h12v7H6z" />
    </StrokeIcon>
  );
}

export function BellIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
      <path d="M10 19a2 2 0 004 0" />
    </StrokeIcon>
  );
}

export function UserIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    </StrokeIcon>
  );
}

export function HeartIcon({ filled, ...props }: StrokeIconProps & { filled?: boolean }) {
  return (
    <StrokeIcon {...props}>
      <path
        d="M12 20.5c-.3 0-.6-.1-.8-.3C7.8 17.6 3 13.6 3 9.3 3 6.4 5.2 4 8 4c1.7 0 3.2.9 4 2.3C12.8 4.9 14.3 4 16 4c2.8 0 5 2.4 5 5.3 0 4.3-4.8 8.3-8.2 10.9-.2.2-.5.3-.8.3z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </StrokeIcon>
  );
}
