import { PlaceholderScreen } from '@/components/placeholder-screen';
import { TopBar } from '@/components/top-bar';

// My Cookbook / Profile isn't built yet — see the suggested build order.
export default function CookbookPage() {
  return (
    <>
      <TopBar title="Cookbook" />
      <PlaceholderScreen line1="Your cookbook lives here." line2="Not yet built." />
    </>
  );
}
