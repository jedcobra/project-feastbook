'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Avatar } from '@/components/avatar';
import { XIcon } from '@/components/icons';
import { formatCount } from '@/lib/format';
import type { Person } from '@/lib/types';

// Bordered profile card — banner + overlapping avatar, name, handle, bio,
// stats grid. Followers and Following open the actual list; Recipes has
// no separate list of its own (that's just the Recipes tab below). Only
// your own card gets the Edit/Share row below the stats — Instagram-style.
export function ProfileHeader({ person, isOwn = false }: { person: Person; isOwn?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const stats: [string, string, string | null][] = [
    ['Recipes', String(person.recipes), null],
    ['Followers', formatCount(person.followers), `/${person.handle}/followers`],
    ['Following', String(person.following), `/${person.handle}/following`],
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

  return (
    <>
      <div className="mx-5 mb-5">
        <div className="h-16 rounded-t-lg border border-b-0 border-ink bg-gradient-to-r from-ink to-ink-soft" />
        <div className="border border-ink px-[18px] pb-3.5 pt-0">
          <div className="-mt-7 mb-2.5">
            {person.avatarUrl ? (
              <button type="button" onClick={() => setPhotoOpen(true)} aria-label="View photo">
                <Avatar
                  name={person.name}
                  src={person.avatarUrl}
                  size={56}
                  className="border-[3px] border-cream bg-highlight shadow-sm"
                />
              </button>
            ) : (
              <Avatar name={person.name} size={56} className="border-[3px] border-cream bg-highlight shadow-sm" />
            )}
          </div>
          <h1 className="mb-0.5 font-display text-profile-name font-bold text-ink">{person.name}</h1>
          <div className="mb-2.5 font-mono text-meta text-ink-mute">@{person.handle}</div>
          <div className="mb-3.5 font-mono text-[14px] leading-[1.55] text-ink-mute">{person.bio}</div>
          <div className="grid grid-cols-3 border-t border-dashed border-rule pt-3">
            {stats.map(([label, value, href]) =>
              href ? (
                <Link key={label} href={href} className="text-center">
                  <div className="font-display text-[20px] font-bold text-ink">{value}</div>
                  <div className="font-display text-[11px] font-bold uppercase tracking-wide text-ink underline decoration-dashed underline-offset-2">
                    {label}
                  </div>
                </Link>
              ) : (
                <div key={label} className="text-center">
                  <div className="font-display text-[20px] font-bold text-ink">{value}</div>
                  <div className="font-display text-[11px] font-bold uppercase tracking-wide text-ink">{label}</div>
                </div>
              ),
            )}
          </div>
          {isOwn && (
            <div className="mt-3.5 flex gap-2 border-t border-dashed border-rule pt-3.5">
              <Link
                href="/settings/profile"
                className="flex-1 rounded-button border border-ink bg-transparent py-2 text-center font-mono text-[14px] font-semibold text-ink"
              >
                Edit profile
              </Link>
              <button
                type="button"
                onClick={shareProfile}
                className="flex-1 rounded-button border border-ink bg-transparent py-2 text-center font-mono text-[14px] font-semibold text-ink"
              >
                {copied ? 'Copied' : 'Share profile'}
              </button>
            </div>
          )}
        </div>
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
