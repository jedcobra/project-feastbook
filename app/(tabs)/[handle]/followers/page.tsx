import { PeopleListScreen } from '@/components/profile/people-list-screen';

export default function FollowersPage({ params }: { params: { handle: string } }) {
  return <PeopleListScreen handle={params.handle} kind="followers" />;
}
