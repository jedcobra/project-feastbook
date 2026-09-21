'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { SwipeableRow } from '@/components/swipeable-row';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import {
  blockUser,
  deleteConversationForMe,
  fetchArchivedConversations,
  fetchConversations,
  setConversationArchived,
} from '@/lib/supabase/queries';
import type { ConversationSummary } from '@/lib/types';

export function InboxScreen() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [archivedCount, setArchivedCount] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    fetchConversations(profile.id).then(setConversations);
    fetchArchivedConversations(profile.id).then((rows) => setArchivedCount(rows.length));
  }, [profile]);

  const remove = (id: string) => setConversations((cs) => (cs ? cs.filter((c) => c.id !== id) : cs));

  const handleArchive = async (id: string) => {
    if (!profile) return;
    remove(id);
    setArchivedCount((n) => n + 1);
    await setConversationArchived(id, profile.id, true);
  };

  const handleDelete = async (id: string) => {
    if (!profile) return;
    remove(id);
    await deleteConversationForMe(id, profile.id);
  };

  const handleBlock = async (id: string, personId: string) => {
    if (!profile) return;
    await blockUser(profile.id, personId);
    remove(id);
  };

  return (
    <>
      <TopBar
        title="Messages"
        trailing={
          archivedCount > 0 ? (
            <Link href="/messages/archived" className="font-mono text-[11px] text-ink-mute">
              Archived ({archivedCount})
            </Link>
          ) : undefined
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {conversations === null ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">Loading…</div>
        ) : conversations.length === 0 ? (
          <div className="mt-4 border border-dashed border-rule p-[22px] text-center">
            <div className="mb-1.5 font-display text-[18px] font-bold text-ink">No messages yet</div>
            <div className="font-mono text-[12px] leading-[1.55] text-ink-mute">
              Message a cook from their profile and it&rsquo;ll show up here.
            </div>
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
                { label: 'Archive', onClick: () => handleArchive(c.id), className: 'bg-ink' },
                {
                  label: 'Block',
                  onClick: () => handleBlock(c.id, c.person.id),
                  className: 'border-l border-cream/40 bg-accent',
                },
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
                  <div
                    className={`truncate font-mono text-[12px] ${c.unread > 0 ? 'font-semibold text-ink' : 'text-ink-mute'}`}
                  >
                    {c.lastMessage || 'Say hello…'}
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-[10px] text-ink-mute">{formatRelativeTime(c.lastMessageAt)}</span>
                  {c.unread > 0 && (
                    <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-semibold text-cream">
                      {c.unread}
                    </span>
                  )}
                </div>
              </Link>
            </SwipeableRow>
          ))
        )}
      </div>
    </>
  );
}
