'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CookPhotoViewer } from '@/components/cooked/cook-photo-viewer';
import { KissButton, kissLabel } from '@/components/cooked/kiss-button';
import { FEED_IMAGE_CLASS, FeedEntry, FeedEntryByline } from '@/components/feed/feed-row';
import { ChefHatIcon, MessageIcon } from '@/components/icons';
import type { CookPhoto } from '@/lib/types';

// Someone's photo of a dish they cooked, as a feed entry: the photo on the
// left, then which recipe it was, a kiss, and comments. Tapping the photo or
// the comments opens the same popup as the profile's Cooked grid.
export function FeedPhotoPost({
  photo,
  onChange,
  onDeleted,
}: {
  photo: CookPhoto;
  onChange: (photo: CookPhoto) => void;
  onDeleted: (photoId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <FeedEntry
      image={
        <button type="button" onClick={() => setOpen(true)} aria-label="Open photo" className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.photoUrl}
            alt={`@${photo.handle}’s ${photo.recipeTitle}`}
            loading="lazy"
            className={FEED_IMAGE_CLASS}
          />
        </button>
      }
    >
      <FeedEntryByline
        handle={photo.handle}
        when={photo.at}
        verb={
          <>
            <ChefHatIcon size={14} />
            cooked
          </>
        }
      />
      <Link
        href={`/recipe/${photo.recipeId}`}
        className="mt-1 block font-display text-[19px] font-bold leading-tight text-ink"
      >
        {photo.recipeTitle}
      </Link>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <KissButton photo={photo} onChange={onChange} onError={setError} />
          <span className="font-mono text-meta text-ink">{kissLabel(photo.kisses)}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 font-mono text-meta text-ink-mute"
        >
          <MessageIcon size={14} weight={0.9} />
          {photo.commentCount === 0
            ? 'Comment'
            : `${photo.commentCount} comment${photo.commentCount === 1 ? '' : 's'}`}
        </button>
      </div>
      {error && <div className="mt-1.5 font-mono text-[12px] text-accent">{error}</div>}

      {open && (
        <CookPhotoViewer
          photo={photo}
          onClose={() => setOpen(false)}
          onChange={onChange}
          onDeleted={(id) => {
            setOpen(false);
            onDeleted(id);
          }}
        />
      )}
    </FeedEntry>
  );
}
