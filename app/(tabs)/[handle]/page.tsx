import { redirect } from 'next/navigation';
import { ShareIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { FriendProfileScreen } from '@/components/profile/friend-profile-screen';
import { TopBar } from '@/components/top-bar';

export default function FriendProfilePage({ params }: { params: { handle: string } }) {
  if (params.handle === 'you') redirect('/me');

  return (
    <>
      <TopBar
        backHref="/feed"
        trailing={
          <OutlineBox compact aria-label="Share">
            <ShareIcon size={14} />
          </OutlineBox>
        }
      />
      <FriendProfileScreen handle={params.handle} />
    </>
  );
}
