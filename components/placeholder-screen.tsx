export function PlaceholderScreen({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-8">
      <p className="text-center font-mono text-[12px] leading-relaxed text-ink-mute">
        {line1}
        <br />
        <span className="text-ink">{line2}</span>
      </p>
    </div>
  );
}
