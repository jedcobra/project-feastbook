// Square outlined checkbox — the design's one checkbox shape.
export function Checkbox({ checked, className = '' }: { checked: boolean; className?: string }) {
  return (
    <span
      className={`flex h-[13px] w-[13px] flex-shrink-0 items-center justify-center rounded-checkbox border-[1.2px] border-ink ${
        checked ? 'bg-ink' : 'bg-transparent'
      } ${className}`}
    >
      {checked && (
        <svg width={9} height={9} viewBox="0 0 10 10" fill="none" className="stroke-cream">
          <path d="M2 5l2 2 4-5" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
