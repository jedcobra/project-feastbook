'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { LinkIcon, MessageIcon, ShareIcon } from '@/components/icons';
import { track } from '@/lib/analytics';
import { fetchConversations, fetchFollowing, getOrCreateConversation, sendMessage } from '@/lib/supabase/queries';
import type { CookPhoto, Person, Recipe } from '@/lib/types';

// Something to share: what the sheet calls it, the link and text handed to
// other apps, a line about who the link works for, and what a message sent
// from here carries.
export interface ShareItem {
  title: string;
  text: string;
  path: string;
  linkNote: string;
  message: { recipeId?: string; photoUrl?: string };
}

// A recipe goes out as its public /r/[id] page, readable signed in or not.
export function recipeShareItem(recipe: Recipe): ShareItem {
  return {
    title: recipe.title,
    text: recipe.subtitle ? `${recipe.title} — ${recipe.subtitle}` : recipe.title,
    path: `/r/${recipe.id}`,
    linkNote: 'Anyone with the link can read it, signed in or not',
    message: { recipeId: recipe.id },
  };
}

// A cook photo goes out as a link to it on its cook's profile, and in a
// message as the photo itself with the recipe it's of.
export function cookPhotoShareItem(photo: CookPhoto): ShareItem {
  return {
    title: `@${photo.handle}’s ${photo.recipeTitle}`,
    text: `${photo.handle} cooked ${photo.recipeTitle}`,
    path: `/${photo.handle}?photo=${photo.id}`,
    linkNote: 'Opens the photo in Special Spoon',
    message: { recipeId: photo.recipeId, photoUrl: photo.photoUrl },
  };
}

interface ShareSheetProps {
  item: ShareItem;
  onClose: () => void;
}

// The Share button's menu: send it to someone in a message, copy its link,
// or hand off to the device's own share sheet when one exists. No
// brand-colored logos here — the design's palette is ink and cream, one
// accent, so these are plain mono rows like everything else.
export function ShareSheet({ item, onClose }: ShareSheetProps) {
  const { profile } = useAuth();
  const [view, setView] = useState<'main' | 'send'>('main');
  const [copied, setCopied] = useState(false);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const url = `${window.location.origin}${item.path}`;
  const text = item.text;
  const canNativeShare = typeof navigator.share === 'function';

  // The people worth offering first: anyone already in a conversation,
  // then anyone followed but not yet messaged — no separate "find anyone"
  // search here, since sharing a recipe is almost always with someone
  // already part of one of those two groups.
  useEffect(() => {
    if (view !== 'send' || !profile || people !== null) return;
    Promise.all([fetchConversations(profile.id), fetchFollowing(profile.id)]).then(([conversations, following]) => {
      const seen = new Set<string>();
      const list: Person[] = [];
      for (const c of conversations) {
        if (seen.has(c.person.id)) continue;
        seen.add(c.person.id);
        list.push(c.person);
      }
      for (const p of following) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        list.push(p);
      }
      setPeople(list);
    });
  }, [view, profile, people]);

  const sendToPerson = async (personId: string) => {
    if (!profile || sendingId) return;
    setSendingId(personId);
    const conversationId = await getOrCreateConversation(profile.id, personId);
    if (conversationId) {
      const message = await sendMessage(
        conversationId,
        profile.id,
        personId,
        '',
        item.message.photoUrl,
        item.message.recipeId,
      );
      if (message) {
        setSentIds((s) => new Set(s).add(personId));
        track('recipe_shared', { method: 'message', path: item.path });
      }
    }
    setSendingId(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      track('recipe_shared', { method: 'copy_link', path: item.path });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied — nothing else we can do about it.
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: item.title, text, url });
      track('recipe_shared', { method: 'native', path: item.path });
      onClose();
    } catch {
      // Cancelled by the person, or blocked mid-call — either way, no error to show.
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-night/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
      >
        {view === 'main' ? (
          <>
            <h3 className="mb-0.5 truncate font-display text-[17px] font-bold text-ink">{item.title}</h3>
            <div className="mb-1 font-mono text-[12px] text-ink-mute">{item.linkNote}</div>

            {profile && (
              <button
                type="button"
                onClick={() => setView('send')}
                className="flex w-full items-center gap-3 border-t border-rule-soft py-[11px] text-left"
              >
                <MessageIcon size={16} className="flex-shrink-0 text-ink" />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[14px] text-ink">Send in a message</span>
                  <span className="block truncate font-mono text-[12px] text-ink-mute">
                    To someone you follow or already message
                  </span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-3 border-t border-rule-soft py-[11px] text-left"
            >
              <LinkIcon size={16} className="flex-shrink-0 text-ink" />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[14px] text-ink">Copy link</span>
                <span className="block truncate font-mono text-[12px] text-ink-mute">{copied ? 'Copied' : url}</span>
              </span>
            </button>

            {canNativeShare && (
              <button
                type="button"
                onClick={nativeShare}
                className="flex w-full items-center gap-3 border-t border-rule-soft py-[11px] text-left"
              >
                <ShareIcon size={16} className="flex-shrink-0 text-ink" />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[14px] text-ink">Share via…</span>
                  <span className="block truncate font-mono text-[12px] text-ink-mute">
                    Messages, mail, or any app on this device
                  </span>
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            <h3 className="mb-3 font-display text-[17px] font-bold text-ink">Send to</h3>
            {people === null ? (
              <div className="py-4 text-center font-mono text-[14px] text-ink-mute">Loading…</div>
            ) : people.length === 0 ? (
              <div className="py-4 text-center font-mono text-[14px] leading-[1.55] text-ink-mute">
                Follow someone or start a conversation first — that&rsquo;s who shows up here.
              </div>
            ) : (
              people.map((p, i) => {
                const sent = sentIds.has(p.id);
                const sending = sendingId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={sent || sending}
                    onClick={() => sendToPerson(p.id)}
                    className={`flex w-full items-center gap-3 py-2.5 text-left disabled:opacity-60 ${
                      i === 0 ? '' : 'border-t border-rule-soft'
                    }`}
                  >
                    <Avatar name={p.handle} src={p.avatarUrl} size={28} />
                    <span className="min-w-0 flex-1 font-mono text-[14px] text-ink">@{p.handle}</span>
                    <span className="font-mono text-[12px] text-ink-mute">
                      {sent ? 'Sent' : sending ? 'Sending…' : 'Send'}
                    </span>
                  </button>
                );
              })
            )}
            <button
              type="button"
              onClick={() => setView('main')}
              className="mt-3 w-full border-t border-rule-soft pt-3 text-center font-mono text-[14px] text-ink-mute"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
