'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import {
  fetchConversationPeer,
  fetchMessages,
  markConversationRead,
  sendMessage,
} from '@/lib/supabase/queries';
import type { DirectMessage, Person } from '@/lib/types';

export function ThreadScreen({ conversationId }: { conversationId: string }) {
  const { profile } = useAuth();
  const [peer, setPeer] = useState<Person | null | undefined>(undefined);
  const [messages, setMessages] = useState<DirectMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    fetchConversationPeer(conversationId, profile.id).then(setPeer);
    fetchMessages(conversationId).then(setMessages);
    markConversationRead(conversationId, profile.id);
  }, [conversationId, profile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !profile || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft('');
    const message = await sendMessage(conversationId, profile.id, text);
    setSending(false);
    if (message) {
      setMessages((m) => (m ? [...m, message] : [message]));
    } else {
      setDraft(text);
    }
  };

  if (peer === undefined || messages === null) {
    return (
      <>
        <TopBar backHref="/messages" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (peer === null) {
    return (
      <>
        <TopBar backHref="/messages" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">This conversation isn&rsquo;t available.</span>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={peer.name} subtitle={`@${peer.handle}`} backHref="/messages" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-2">
        {messages.length === 0 ? (
          <div className="mt-6 text-center font-mono text-[12px] leading-[1.55] text-ink-mute">
            Nothing here yet — say hello.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === profile?.id;
            return (
              <div key={m.id} className={`mb-2.5 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2 font-mono text-[12.5px] leading-[1.45] ${
                      mine ? 'bg-ink text-cream' : 'border border-ink bg-cream text-ink'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="mt-1 px-1 font-mono text-[10px] text-ink-mute">
                    {formatRelativeTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {profile && (
        <div className="flex-shrink-0 border-t border-dashed border-rule bg-cream px-4 pb-[18px] pt-2.5">
          <div className="flex items-end gap-2 rounded-button border border-ink bg-cream-surface px-2.5 py-2">
            <textarea
              value={draft}
              rows={1}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Write a message…"
              className="max-h-24 flex-1 resize-none border-none bg-transparent font-mono text-[12.5px] leading-[1.5] text-ink outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              className={`rounded-button border border-ink px-2.5 py-1 font-mono text-[11px] ${
                draft.trim() ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
