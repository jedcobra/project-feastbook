import { SkeletonLine } from '@/components/skeleton-line';

// Wears the feed's own shape while it loads — four entries, each a top line
// for who did what, then a picture bleeding in from the left and lines of
// detail beside it — instead of a spinner.
export function FeedSkeleton() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="border-b border-rule-soft">
          <div className="px-5 pb-2.5 pt-3.5">
            <SkeletonLine width="55%" height={9} />
          </div>
          <div className="flex">
            <div className="aspect-square w-1/4 flex-shrink-0 animate-pulse bg-rule-soft" />
            <div className="min-w-0 flex-1 pb-4 pl-3.5 pr-5">
              <SkeletonLine width="85%" height={17} className="mb-2.5" />
              <SkeletonLine width="70%" height={9} className="mb-2" />
              <SkeletonLine width="40%" height={9} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
