'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import { fetchConversations } from '@/lib/supabase/queries';
import type { ConversationSummary } from '@/lib/types';

export function InboxScreen() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);

  useEffect(() => {
    if (profile) fetchConversations(profile.id).then(setConversations);
  }, [profile]);

  return (
    <>
      <TopBar title="Messages" />
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
            <Link
              key={c.id}
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
          ))
        )}
      </div>
    </>
  );
}
