'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OutlineBox } from '@/components/outline-box';
import { getOrCreateConversation } from '@/lib/supabase/queries';

export function FollowActions({
  personId,
  myId,
  following,
  onToggleFollow,
}: {
  personId: string;
  myId: string;
  following: boolean;
  onToggleFollow: () => void;
}) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  const openConversation = async () => {
    if (opening) return;
    setOpening(true);
    const conversationId = await getOrCreateConversation(myId, personId);
    setOpening(false);
    if (conversationId) router.push(`/messages/${conversationId}`);
  };

  return (
    <div className="flex gap-2 px-5 pb-[18px]">
      <button
        type="button"
        onClick={onToggleFollow}
        className={`flex-1 rounded-button border border-ink py-2.5 font-mono text-[13px] font-semibold ${
          following ? 'bg-cream text-ink' : 'bg-ink text-cream'
        }`}
      >
        {following ? 'Following' : 'Follow'}
      </button>
      <OutlineBox onClick={openConversation} disabled={opening}>
        {opening ? '…' : 'Message'}
      </OutlineBox>
    </div>
  );
}
