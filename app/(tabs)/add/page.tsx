import { PlaceholderScreen } from '@/components/placeholder-screen';
import { TopBar } from '@/components/top-bar';

// Recipe creation isn't designed yet — see README's Open Design Questions.
export default function AddPage() {
  return (
    <>
      <TopBar title="Add a recipe" backHref="/feed" />
      <PlaceholderScreen line1="Recipe creation flow lives here." line2="Not yet built." />
    </>
  );
}
