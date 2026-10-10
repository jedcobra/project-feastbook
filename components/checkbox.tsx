// Square outlined checkbox — the design's one checkbox shape.
export function Checkbox({
  checked,
  size = 13,
  className = '',
}: {
  checked: boolean;
  size?: number;
  className?: string;
}) {
  const tick = Math.round(size * 0.7);
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex flex-shrink-0 items-center justify-center rounded-checkbox border-[1.2px] border-ink ${
        checked ? 'bg-ink' : 'bg-transparent'
      } ${className}`}
    >
      {checked && (
        <svg width={tick} height={tick} viewBox="0 0 10 10" fill="none" className="stroke-cream">
          <path d="M2 5l2 2 4-5" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
