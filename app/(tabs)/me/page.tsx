import { EditIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { ProfileScreen } from '@/components/profile/profile-screen';
import { TopBar } from '@/components/top-bar';
import { byHandle } from '@/lib/fixtures';

export default function CookbookPage() {
  const person = byHandle('you');

  return (
    <>
      <TopBar
        variant="brand"
        trailing={
          <OutlineBox compact aria-label="Edit profile">
            <EditIcon size={14} />
          </OutlineBox>
        }
      />
      <ProfileScreen person={person} isOwn />
    </>
  );
}
