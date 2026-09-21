import { FeedScreen } from '@/components/feed/feed-screen';
import { NotificationsButton } from '@/components/notifications/notifications-button';
import { TopBar } from '@/components/top-bar';

export default function FeedPage() {
  return (
    <>
      <TopBar variant="brand" trailing={<NotificationsButton />} />
      <FeedScreen />
    </>
  );
}
