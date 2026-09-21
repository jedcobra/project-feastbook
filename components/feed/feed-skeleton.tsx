import { SkeletonLine } from '@/components/skeleton-line';

// Wears the feed's own shape while it loads — a date bar and four
// activity-row placeholders — instead of a spinner or bare "Loading…" text.
export function FeedSkeleton() {
  return (
    <>
      <div className="rule-y flex-shrink-0 px-5 pb-2.5">
        <SkeletonLine width="42%" height={10} />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-5 pt-3.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-[18px] border-b border-dashed border-rule pb-[18px]">
            <SkeletonLine width="38%" height={9} className="mb-2" />
            <SkeletonLine width="88%" height={19} className="mb-2.5" />
            <SkeletonLine width="64%" height={11} className="mb-2" />
            <SkeletonLine width="30%" height={9} />
          </div>
        ))}
      </div>
    </>
  );
}
