'use client';

import { useRouter } from 'next/navigation';
import { FEED_IMAGE_FILL, FeedEntry, FeedEntryByline } from '@/components/feed/feed-row';
import { ChevronIcon, OpenBookIcon } from '@/components/icons';
import { ShelfIcon } from '@/components/shelves/shelf-icon';
import { Tag } from '@/components/tag';
import type { FeedShelf } from '@/lib/types';

const PREVIEW = 5;

// A cookbook its owner posted with "Tell my followers": a feed entry like
// a recipe's, led by its cover photo if it has one, or else a 2×2 grid of
// its recipes' photos (a sticker from when those were offered sits beside
// the name either way), with a peek at what's in it. Tapping it opens the cookbook where it
// lives, on its owner's profile.
export function FeedShelfPost({ shelf }: { shelf: FeedShelf }) {
  const router = useRouter();
  const open = () => router.push(`/${shelf.ownerHandle}?shelf=${shelf.id}`);
  const photos = shelf.recipes.filter((r) => r.coverPhotoUrl).slice(0, PREVIEW);
  const count = shelf.recipes.length;
  // With no cover photo, up to four of its recipes' photos stand in for
  // one: a 2×2 grid filling the picture space down the left.
  const grid = !shelf.coverUrl && photos.length > 0 ? photos.slice(0, 4) : null;

  return (
    <article className="border-b border-rule-soft">
      <div
        role="link"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter') open();
        }}
        className="cursor-pointer"
      >
        <FeedEntry
          image={
            shelf.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shelf.coverUrl} alt="" loading="lazy" className={`${FEED_IMAGE_FILL} object-cover`} />
            ) : (
              grid && (
                <div className={`${FEED_IMAGE_FILL} grid grid-cols-2 grid-rows-2 gap-px bg-cream`}>
                  {[0, 1, 2, 3].map((i) =>
                    grid[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={grid[i].id}
                        src={grid[i].coverPhotoUrl}
                        alt={grid[i].title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div key={`empty-${i}`} className="bg-cream-deep" />
                    ),
                  )}
                </div>
              )
            )
          }
          byline={
            <FeedEntryByline
              handle={shelf.ownerHandle}
              avatarUrl={shelf.ownerAvatarUrl}
              when={shelf.when}
              verb={
                <>
                  <OpenBookIcon size={14} />
                  made a cookbook
                </>
              }
            />
          }
        >
          <div className="flex items-center gap-2.5">
            {!shelf.coverUrl && shelf.stickerUrl && <ShelfIcon stickerUrl={shelf.stickerUrl} count={count} />}
            <h3 className="min-w-0 flex-1 font-display text-[19px] font-bold leading-tight text-ink">{shelf.title}</h3>
            <ChevronIcon size={13} className="flex-shrink-0 text-ink-mute" />
          </div>
          {shelf.subtitle && (
            <div className="mt-1 font-mono text-[14px] leading-relaxed text-ink-mute">{shelf.subtitle}</div>
          )}
          <div className="mt-1.5 font-mono text-meta text-ink-mute">
            {count === 0 ? 'Nothing in it yet' : `${count} recipe${count === 1 ? '' : 's'}`}
          </div>
          {grid ? null : photos.length > 0 ? (
            <div className="mt-2 flex gap-1.5">
              {photos.map((r) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={r.id}
                  src={r.coverPhotoUrl}
                  alt={r.title}
                  loading="lazy"
                  className="h-11 w-11 rounded-button border border-rule object-cover"
                />
              ))}
            </div>
          ) : (
            count > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {shelf.recipes.slice(0, 3).map((r) => (
                  <Tag key={r.id}>{r.title}</Tag>
                ))}
              </div>
            )
          )}
        </FeedEntry>
      </div>
    </article>
  );
}
