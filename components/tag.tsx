export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-tag border border-rule-soft bg-tag px-2 py-[3px] font-mono text-meta font-medium text-tag-ink">
      {children}
    </span>
  );
}
