export function Tag({
  children,
  selected = false,
  onRemove,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onRemove?: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-tag border px-2 py-[3px] font-mono text-meta font-medium ${
        selected ? 'border-ink bg-ink text-cream' : 'border-rule-soft bg-tag text-tag-ink'
      }`}
    >
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} className="opacity-60" aria-label="Remove tag">
          ×
        </button>
      )}
    </span>
  );
}
