import { EntryScreen } from '@/components/create/entry-screen';
import { TopBar } from '@/components/top-bar';

export default function NewRecipePage() {
  return (
    <>
      <TopBar title="New recipe" backHref="/me" />
      <EntryScreen />
    </>
  );
}
