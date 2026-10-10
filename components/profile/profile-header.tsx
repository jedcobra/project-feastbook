'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Avatar } from '@/components/avatar';
import { XIcon } from '@/components/icons';
import { formatCount } from '@/lib/format';
import type { Person } from '@/lib/types';

// Instagram's profile button: equal width, ~32px tall, soft fill, no border.
const PROFILE_BUTTON_BASE = 'flex h-8 flex-1 items-center justify-center rounded-lg font-mono text-[14px] font-semibold';
export const PROFILE_BUTTON = `${PROFILE_BUTTON_BASE} bg-cream-deep text-ink`;
export const PROFILE_BUTTON_PRIMARY = `${PROFILE_BUTTON_BASE} bg-ink text-cream`;

// Instagram's profile header proportions: an 86px avatar beside three
// evenly spaced stats, then name, handle and bio, then equal-width soft
// buttons. Followers and Following open the actual list; Recipes has no
// list of its own (that's the Recipes tab below). Only your own header
// gets Edit/Share here — someone else's gets Follow/Message from
// FollowActions, styled to match.
export function ProfileHeader({ person, isOwn = false }: { person: Person; isOwn?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const stats: [string, string, string | null][] = [
    ['recipes', formatCount(person.recipes), null],
    ['followers', formatCount(person.followers), `/${person.handle}/followers`],
    ['following', formatCount(person.following), `/${person.handle}/following`],
  ];

  const shareProfile = async () => {
    const url = `${window.location.origin}/${person.handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: person.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Cancelled by the person, or clipboard access denied — either way,
      // nothing else to do about it.
    }
  };

  const avatar = <Avatar name={person.name} src={person.avatarUrl} size={86} />;

  return (
    <>
      <div className={`px-5 pt-1 ${isOwn ? 'pb-4' : 'pb-3'}`}>
        <div className="flex items-center gap-5">
          {person.avatarUrl ? (
            <button type="button" onClick={() => setPhotoOpen(true)} aria-label="View photo" className="flex-shrink-0">
              {avatar}
            </button>
          ) : (
            avatar
          )}
          <div className="grid min-w-0 flex-1 grid-cols-3">
            {stats.map(([label, value, href]) => {
              const body = (
                <>
                  <div className="font-display text-[18px] font-bold leading-tight text-ink">{value}</div>
                  <div className="font-mono text-[12px] text-ink">{label}</div>
                </>
              );
              return href ? (
                <Link key={label} href={href} className="text-center">
                  {body}
                </Link>
              ) : (
                <div key={label} className="text-center">
                  {body}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="font-display text-[16px] font-bold leading-tight text-ink">{person.name}</h1>
          <div className="font-mono text-[14px] text-ink-mute">@{person.handle}</div>
          {person.bio && (
            <div className="mt-1 whitespace-pre-line break-words font-mono text-[14px] leading-[1.45] text-ink">
              {person.bio}
            </div>
          )}
        </div>

        {isOwn && (
          <div className="mt-3 flex gap-1.5">
            <Link href="/settings/profile" className={PROFILE_BUTTON}>
              Edit profile
            </Link>
            <button type="button" onClick={shareProfile} className={PROFILE_BUTTON}>
              {copied ? 'Copied' : 'Share profile'}
            </button>
          </div>
        )}
      </div>

      {photoOpen && person.avatarUrl && (
        <div
          className="fixed inset-0 z-30 mx-auto flex max-w-column items-center justify-center bg-ink/85 p-8"
          onClick={() => setPhotoOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPhotoOpen(false)}
            aria-label="Close"
            className="absolute right-5 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-cream text-cream"
          >
            <XIcon size={14} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={person.avatarUrl}
            alt={person.name}
            className="aspect-square w-full max-w-sm rounded-full border border-cream object-cover"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
