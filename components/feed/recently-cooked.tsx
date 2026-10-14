'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Avatar } from '@/components/avatar';
import { CookPhotoViewer } from '@/components/cooked/cook-photo-viewer';
import { Label } from '@/components/label';
import type { CookPhoto, RecentCook } from '@/lib/types';

const BUBBLE = 68;

// The row of rounded-square pictures across the top of the feed, like stories: what
// you and the people you follow cooked lately, newest first, scrolling sideways.
// A cook photo opens large in the same popup as the profile's Cooked grid;
// a plain "cooked" mark opens its recipe.
export function RecentlyCooked({
  cooks,
  onChange,
  onDeleted,
}: {
  cooks: RecentCook[];
  onChange: (photo: CookPhoto) => void;
  onDeleted: (photoId: string) => void;
}) {
  const [openPhotoId, setOpenPhotoId] = useState<string | null>(null);
  const openPhoto = cooks.flatMap((c) => (c.type === 'photo' && c.photo.id === openPhotoId ? [c.photo] : []))[0];

  // Nothing from you or the people you follow yet: no row at all, rather than an
  // empty shelf at the top of every visit.
  if (cooks.length === 0) return null;

  return (
    <section aria-label="Recently cooked" className="border-b border-rule-soft pb-3.5 pt-3">
      <Label className="px-5 pb-2.5">Recently cooked</Label>
      <ul className="flex gap-3.5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cooks.map((cook) => {
          const handle = cook.type === 'photo' ? cook.photo.handle : cook.handle;
          const title = cook.type === 'photo' ? cook.photo.recipeTitle : cook.recipeTitle;
          const bubble = (
            <Bubble
              imageUrl={cook.type === 'photo' ? cook.photo.photoUrl : cook.imageUrl}
              handle={handle}
              avatarUrl={cook.type === 'photo' ? cook.photo.avatarUrl : cook.avatarUrl}
            />
          );
          const caption = (
            <span className="block w-[72px] truncate text-center font-mono text-meta text-ink">{handle}</span>
          );
          const label = `@${handle} cooked ${title}`;
          return (
            <li key={cook.key} className="flex-shrink-0">
              {cook.type === 'photo' ? (
                <button
                  type="button"
                  onClick={() => setOpenPhotoId(cook.photo.id)}
                  aria-label={label}
                  className="flex flex-col items-center gap-1.5"
                >
                  {bubble}
                  {caption}
                </button>
              ) : (
                <Link
                  href={`/recipe/${cook.recipeId}`}
                  aria-label={label}
                  className="flex flex-col items-center gap-1.5"
                >
                  {bubble}
                  {caption}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {openPhoto && (
        <CookPhotoViewer
          photo={openPhoto}
          onClose={() => setOpenPhotoId(null)}
          onChange={onChange}
          onDeleted={(id) => {
            setOpenPhotoId(null);
            onDeleted(id);
          }}
        />
      )}
    </section>
  );
}

// The dish in a rounded-square frame, with the cook's own face tucked into the corner.
function Bubble({ imageUrl, handle, avatarUrl }: { imageUrl: string; handle: string; avatarUrl?: string }) {
  return (
    <span className="relative block" style={{ width: BUBBLE, height: BUBBLE }}>
      <span className="block h-full w-full rounded-[18px] border-2 border-accent p-[2px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-full w-full rounded-[14px] bg-cream-deep object-cover" />
      </span>
      <Avatar
        name={handle}
        src={avatarUrl}
        size={22}
        className="absolute -bottom-1 -right-1 border-2 border-cream"
      />
    </span>
  );
}
