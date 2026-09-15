import { PlaceholderScreen } from '@/components/placeholder-screen';
import { TopBar } from '@/components/top-bar';

// Discover isn't built yet — see the suggested build order.
export default function DiscoverPage() {
  return (
    <>
      <TopBar title="Discover" />
      <PlaceholderScreen line1="Trending recipes and cooks to follow live here." line2="Not yet built." />
    </>
  );
}
