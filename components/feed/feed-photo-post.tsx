'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CookPhotoViewer } from '@/components/cooked/cook-photo-viewer';
import { KissButton, kissLabel } from '@/components/cooked/kiss-button';
import { FeedPostHeader } from '@/components/feed/feed-row';
import { HandleLink } from '@/components/handle-link';
import { ChefHatIcon, MessageIcon } from '@/components/icons';
import type { CookPhoto } from '@/lib/types';

// Someone's photo of a dish they cooked, as a feed post: the photo, a kiss
// and a comment button, and which recipe it was. Tapping the photo or the
// comments opens the same popup as the profile's Cooked grid.
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
    <article className="border-b border-dashed border-rule pb-3.5">
      <FeedPostHeader
        handle={photo.handle}
        avatarUrl={photo.avatarUrl}
        when={photo.at}
        verb={
          <>
            <ChefHatIcon size={16} />
            cooked
          </>
        }
      />

      <button type="button" onClick={() => setOpen(true)} aria-label="Open photo" className="block w-full bg-cream-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.photoUrl} alt={`@${photo.handle}’s ${photo.recipeTitle}`} loading="lazy" className="aspect-square w-full object-cover" />
      </button>

      <div className="flex items-center gap-4 px-5 pt-2.5">
        <div className="flex items-center gap-2">
          <KissButton photo={photo} onChange={onChange} onError={setError} />
          <span className="font-mono text-[14px] text-ink">{kissLabel(photo.kisses)}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Comments"
          className="flex items-center gap-1.5 font-mono text-[14px] text-ink"
        >
          <MessageIcon size={16} weight={0.9} />
          {photo.commentCount > 0 && photo.commentCount}
        </button>
      </div>
      {error && <div className="px-5 pt-1.5 font-mono text-[12px] text-accent">{error}</div>}

      <div className="px-5 pt-1.5 font-mono text-[14px] leading-[1.45] text-ink">
        <HandleLink handle={photo.handle} className="font-semibold" /> <span className="text-ink-mute">cooked</span>{' '}
        <Link href={`/recipe/${photo.recipeId}`} className="underline decoration-dashed underline-offset-[3px]">
          {photo.recipeTitle}
        </Link>
      </div>
      <button type="button" onClick={() => setOpen(true)} className="px-5 pt-1 font-mono text-[12px] text-ink-mute">
        {photo.commentCount === 0
          ? 'Add a comment…'
          : photo.commentCount === 1
            ? 'View 1 comment'
            : `View all ${photo.commentCount} comments`}
      </button>

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
    </article>
  );
}
