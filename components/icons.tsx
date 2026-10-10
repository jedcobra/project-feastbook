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
  // Every call site passes its own `size`, so scaling up here — rather
  // than at each of them — is the one place that reaches all of them.
  // 1.1 (10% larger), then another 20% on top of that.
  return (
    <svg
      viewBox="0 0 24 24"
      width={size * 1.32}
      height={size * 1.32}
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

export function SendIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M21 3L11 13M21 3l-7 18-4-8-8-4 19-6z" />
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

// Drawn edge to edge in the 24-unit box, so it's scaled down to sit at the
// same visual size as the other glyphs, with its stroke widened to match.
const CHEF_HAT_SCALE = 0.76;

export function ChefHatIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <g
        transform={`translate(12 12) scale(${CHEF_HAT_SCALE}) translate(-12 -11.4)`}
        strokeWidth={(props.weight ?? 1.4) / CHEF_HAT_SCALE}
      >
        <path d="M6.2 16.5A5.5 5.5 0 1 1 5.25 5.53A7.4 7.4 0 0 1 18.75 5.53A5.5 5.5 0 1 1 17.8 16.5" />
        <path d="M5.25 5.53L5.6 6.7M18.75 5.53L18.4 6.7M5.6 13Q5.9 15.4 7.5 16.4M18.4 13Q18.1 15.4 16.5 16.4M12 13.6V16.4" />
        <rect x="5.5" y="16.5" width="13" height="5.5" rx="1" />
      </g>
    </StrokeIcon>
  );
}

// Traced from the chef's-kiss hand drawing (512px artboard), scaled into
// the 24px box with the stroke compensated so it matches the other icons.
const CHEF_KISS_SCALE = 24 / 512;

export function ChefKissIcon({ filled, ...props }: StrokeIconProps & { filled?: boolean }) {
  return (
    <StrokeIcon {...props}>
      <g transform={`scale(${CHEF_KISS_SCALE})`} strokeWidth={((props.weight ?? 1.4) * (filled ? 1.35 : 1)) / CHEF_KISS_SCALE}>
        <path d="M100 30L117 52M133 8L134 38M184 18L163 44" />
        <path d="M108 82C95 74 70 82 62 100C45 130 30 190 28 255C26 300 50 330 90 375C115 405 130 440 145 458C220 470 300 478 378 492" />
        <path d="M108 82C112 100 98 120 92 140C82 180 85 240 100 290C110 320 120 350 128 372" />
        <path d="M66 118C78 116 92 110 98 96M112 112C125 110 138 104 142 92" />
        <path d="M108 82C118 70 140 70 150 80C158 90 152 115 148 140C140 180 145 230 160 270C175 305 185 335 190 358" />
        <path d="M150 80C165 72 180 80 188 92C205 120 215 160 240 200C270 235 330 260 380 290C400 302 410 315 415 320" />
        <path d="M165 105C180 150 195 200 215 250C228 285 260 298 300 300C350 305 400 315 425 325C455 340 480 370 490 415" />
        <path d="M245 245C255 238 265 236 272 236" />
      </g>
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

export function MenuIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </StrokeIcon>
  );
}

export function HomeIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6 10.5V19a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1v-8.5" />
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

export function OpenBookIcon(props: StrokeIconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" />
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
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
