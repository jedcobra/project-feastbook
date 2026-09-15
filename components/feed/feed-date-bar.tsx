export function FeedDateBar({ date, count }: { date: string; count: number }) {
  return (
    <div className="rule-y flex-shrink-0 px-5">
      <div className="flex items-center justify-between pb-2.5 font-mono text-meta text-ink-mute">
        <span>{date}</span>
        <span className="text-ink">
          {count} update{count === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
