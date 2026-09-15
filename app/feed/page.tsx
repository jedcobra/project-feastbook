import { FeedDateBar } from '@/components/feed/feed-date-bar';
import { FeedRow } from '@/components/feed/feed-row';
import { OutlineBox } from '@/components/outline-box';
import { SearchIcon } from '@/components/icons';
import { TopBar } from '@/components/top-bar';
import { FEED } from '@/lib/fixtures';

export default function FeedPage() {
  return (
    <>
      <TopBar
        variant="brand"
        trailing={
          <OutlineBox compact aria-label="Search">
            <SearchIcon size={14} />
          </OutlineBox>
        }
      />
      <FeedDateBar date="WED 22 APR" count={FEED.length} />
      <div className="flex-1 overflow-y-auto pb-8">
        {FEED.map((item, i) => (
          <FeedRow key={i} item={item} />
        ))}
      </div>
    </>
  );
}
