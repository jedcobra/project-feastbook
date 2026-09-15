import { FeedScreen } from '@/components/feed/feed-screen';
import { OutlineBox } from '@/components/outline-box';
import { SearchIcon } from '@/components/icons';
import { TopBar } from '@/components/top-bar';

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
      <FeedScreen />
    </>
  );
}
