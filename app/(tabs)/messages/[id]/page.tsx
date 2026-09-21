import { ThreadScreen } from '@/components/messages/thread-screen';

export default function ThreadPage({ params }: { params: { id: string } }) {
  return <ThreadScreen conversationId={params.id} />;
}
