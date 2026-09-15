export function Tag({
  children,
  selected = false,
}: {
  children: React.ReactNode;
  selected?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-tag border px-2 py-[3px] font-mono text-meta font-medium ${
        selected ? 'border-ink bg-ink text-cream' : 'border-rule-soft bg-tag text-tag-ink'
      }`}
    >
      {children}
    </span>
  );
}
