'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PROFILE_BUTTON, PROFILE_BUTTON_PRIMARY } from '@/components/profile/profile-header';
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
    <div className="flex gap-1.5 px-5 pb-4">
      <button
        type="button"
        onClick={onToggleFollow}
        className={following ? PROFILE_BUTTON : PROFILE_BUTTON_PRIMARY}
      >
        {following ? 'Following' : 'Follow'}
      </button>
      <button type="button" onClick={openConversation} disabled={opening} className={PROFILE_BUTTON}>
        {opening ? '…' : 'Message'}
      </button>
    </div>
  );
}
