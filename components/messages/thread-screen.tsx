'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { MoreIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import {
  blockUser,
  deleteMessage,
  fetchConversationPeer,
  fetchMessages,
  isBlockedByMe,
  markConversationRead,
  sendMessage,
  unblockUser,
} from '@/lib/supabase/queries';
import type { DirectMessage, Person } from '@/lib/types';

export function ThreadScreen({ conversationId }: { conversationId: string }) {
  const { profile } = useAuth();
  const [peer, setPeer] = useState<Person | null | undefined>(undefined);
  const [messages, setMessages] = useState<DirectMessage[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) return;
    fetchConversationPeer(conversationId, profile.id).then(setPeer);
    fetchMessages(conversationId).then(setMessages);
    markConversationRead(conversationId, profile.id);
  }, [conversationId, profile]);

  useEffect(() => {
    if (profile && peer) isBlockedByMe(profile.id, peer.id).then(setBlockedByMe);
  }, [profile, peer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !profile || sending) return;
    setSending(true);
    setSendError(null);
    const text = draft.trim();
    setDraft('');
    const message = await sendMessage(conversationId, profile.id, text);
    setSending(false);
    if (message) {
      setMessages((m) => (m ? [...m, message] : [message]));
    } else {
      setDraft(text);
      setSendError('Couldn’t send that. Try again in a moment.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    setMessages((m) => (m ? m.filter((msg) => msg.id !== id) : m));
    await deleteMessage(id);
  };

  const toggleBlock = async () => {
    if (!profile || !peer) return;
    setMenuOpen(false);
    if (blockedByMe) {
      setBlockedByMe(false);
      await unblockUser(profile.id, peer.id);
    } else {
      setBlockedByMe(true);
      await blockUser(profile.id, peer.id);
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
      <TopBar
        title={peer.name}
        subtitle={`@${peer.handle}`}
        backHref="/messages"
        trailing={
          <OutlineBox compact aria-label="Conversation options" onClick={() => setMenuOpen(true)}>
            <MoreIcon size={14} />
          </OutlineBox>
        }
      />
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
                <div className={`flex max-w-[78%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2 font-mono text-[12.5px] leading-[1.45] ${
                      mine ? 'bg-ink text-cream' : 'border border-ink bg-cream text-ink'
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className="mt-1 flex items-center gap-2 px-1">
                    <span className="font-mono text-[10px] text-ink-mute">{formatRelativeTime(m.createdAt)}</span>
                    {mine && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className="font-mono text-[10px] text-ink-mute underline decoration-dashed underline-offset-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {profile && (
        <div className="flex-shrink-0 border-t border-dashed border-rule bg-cream px-4 pb-[18px] pt-2.5">
          {blockedByMe ? (
            <div className="flex items-center gap-2.5 rounded-button border border-dashed border-rule px-3 py-2.5">
              <span className="flex-1 font-mono text-[11.5px] text-ink-mute">
                You&rsquo;ve blocked @{peer.handle}.
              </span>
              <OutlineBox compact onClick={toggleBlock}>
                Unblock
              </OutlineBox>
            </div>
          ) : (
            <>
              {sendError && <div className="mb-2 font-mono text-[11px] text-accent">{sendError}</div>}
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
            </>
          )}
        </div>
      )}

      {menuOpen && (
        <div
          className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30"
          onClick={() => setMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
          >
            <h3 className="mb-3 font-display text-[17px] font-bold text-ink">{peer.name}</h3>
            <button
              type="button"
              onClick={toggleBlock}
              className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[13px] text-left"
            >
              <span className="min-w-0 flex-1">
                <span className={`block font-mono text-[12.5px] ${blockedByMe ? 'text-ink' : 'text-accent'}`}>
                  {blockedByMe ? `Unblock @${peer.handle}` : `Block @${peer.handle}`}
                </span>
                <span className="block truncate font-mono text-[10.5px] text-ink-mute">
                  {blockedByMe
                    ? 'They still can’t message you until you unblock them.'
                    : 'They won’t be able to message you, and you won’t be able to message them.'}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
