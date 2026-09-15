import { notFound, redirect } from 'next/navigation';
import { ShareIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { ProfileScreen } from '@/components/profile/profile-screen';
import { TopBar } from '@/components/top-bar';
import { PEOPLE } from '@/lib/fixtures';

export function generateStaticParams() {
  // Include 'you' so a static page exists to run its redirect to /me.
  return PEOPLE.map((p) => ({ handle: p.handle }));
}

export default function FriendProfilePage({ params }: { params: { handle: string } }) {
  if (params.handle === 'you') redirect('/me');

  const person = PEOPLE.find((p) => p.handle === params.handle);
  if (!person) notFound();

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
      <ProfileScreen person={person} isOwn={false} />
    </>
  );
}
