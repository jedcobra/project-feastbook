import { redirect } from 'next/navigation';
import { FriendProfileScreen } from '@/components/profile/friend-profile-screen';

export default function FriendProfilePage({ params }: { params: { handle: string } }) {
  if (params.handle === 'you') redirect('/me');

  return <FriendProfileScreen handle={params.handle} />;
}
