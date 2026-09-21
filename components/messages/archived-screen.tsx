'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { SwipeableRow } from '@/components/messages/swipeable-row';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import { deleteConversationForMe, fetchArchivedConversations, setConversationArchived } from '@/lib/supabase/queries';
import type { ConversationSummary } from '@/lib/types';

export function ArchivedScreen() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) fetchArchivedConversations(profile.id).then(setConversations);
  }, [profile]);

  const remove = (id: string) => setConversations((cs) => (cs ? cs.filter((c) => c.id !== id) : cs));

  const handleUnarchive = async (id: string) => {
    if (!profile) return;
    remove(id);
    await setConversationArchived(id, profile.id, false);
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    remove(id);
    await deleteConversationForMe(id, profile.id);
  };

  return (
    <>
      <TopBar title="Archived" backHref="/messages" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {conversations === null ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">Loading…</div>
        ) : conversations.length === 0 ? (
          <div className="mt-4 border border-dashed border-rule p-[22px] text-center font-mono text-[12px] leading-[1.55] text-ink-mute">
            Nothing archived.
          </div>
        ) : (
          conversations.map((c, i) => (
            <SwipeableRow
              key={c.id}
              open={openId === c.id}
              onOpen={() => setOpenId(c.id)}
              onClose={() => setOpenId((id) => (id === c.id ? null : id))}
              actions={[
                { label: 'Delete', onClick: () => handleDelete(c.id), className: 'bg-accent' },
                { label: 'Unarchive', onClick: () => handleUnarchive(c.id), className: 'bg-ink' },
              ]}
            >
              <Link
                href={`/messages/${c.id}`}
                className={`flex items-center gap-2.5 border-b border-dashed border-rule py-3 ${i === 0 ? 'border-t' : ''}`}
              >
                <Avatar name={c.person.name} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[15px] font-bold text-ink">{c.person.name}</span>
                    <span className="font-mono text-meta text-ink-mute">@{c.person.handle}</span>
                  </div>
                  <div className="truncate font-mono text-[12px] text-ink-mute">{c.lastMessage || 'Say hello…'}</div>
                </div>
                <span className="flex-shrink-0 font-mono text-[10px] text-ink-mute">
                  {formatRelativeTime(c.lastMessageAt)}
                </span>
              </Link>
            </SwipeableRow>
          ))
        )}
      </div>
    </>
  );
}
