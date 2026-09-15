import { EditIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { OwnCookbook } from '@/components/profile/own-cookbook';
import { TopBar } from '@/components/top-bar';

export default function CookbookPage() {
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
      <OwnCookbook />
    </>
  );
}
