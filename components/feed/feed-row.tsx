import Link from 'next/link';
import { HandleLink } from '@/components/handle-link';
import { ChefHatIcon, HeartIcon, PlusIcon } from '@/components/icons';
import { Tag } from '@/components/tag';
import type { FeedActivity, Person, Recipe } from '@/lib/types';

const VERB: Record<FeedActivity['kind'], string> = {
  new: 'added',
  madeit: 'cooked',
  saved: 'saved',
};

// A quick visual tell for which kind of activity this is, at a glance —
// the New tab's plus, a chef hat for a cook, the save heart.
const VERB_ICON: Record<FeedActivity['kind'], (props: { size?: number }) => React.ReactElement> = {
  new: PlusIcon,
  madeit: ChefHatIcon,
  saved: HeartIcon,
};

// Every feed post is a horizontal entry, like a page in a recipe book: the
// picture bleeds to the left edge and to the entry's top and bottom across
// the first quarter, and the details fill the other three. The image is at
// least square and grows with the entry if the text runs taller. Entries
// without a picture are just the text.
export function FeedEntry({ image, children }: { image?: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="flex border-b border-dashed border-rule">
      {image && (
        <div className="relative w-1/4 flex-shrink-0 bg-cream-deep">
          <div className="aspect-square" aria-hidden />
          {image}
        </div>
      )}
      <div className={`min-w-0 flex-1 py-4 pr-5 ${image ? 'pl-3.5' : 'pl-5'}`}>{children}</div>
    </article>
  );
}

// The image (or the link/button wrapping it) fills the whole left quarter.
export const FEED_IMAGE_FILL = 'absolute inset-0 block h-full w-full';

// Who did what, and when — the first line of every entry.
export function FeedEntryByline({ handle, verb, when }: { handle: string; verb: React.ReactNode; when: string }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-meta text-ink-mute">
      <HandleLink handle={handle} className="min-w-0 truncate font-semibold text-ink" />
      <span className="flex flex-shrink-0 items-center gap-1">{verb}</span>
      <span className="ml-auto flex-shrink-0">{when}</span>
    </div>
  );
}

// A recipe activity entry (added / cooked / saved), led by the recipe's
// cover photo when it has one.
export function FeedRow({ item, recipe, author }: { item: FeedActivity; recipe: Recipe; author: Person }) {
  const VerbIcon = VERB_ICON[item.kind];
  return (
    <FeedEntry
      image={
        recipe.coverPhotoUrl && (
          <Link href={`/recipe/${recipe.id}`} className={FEED_IMAGE_FILL}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={recipe.coverPhotoUrl} alt={recipe.title} loading="lazy" className="h-full w-full object-cover" />
          </Link>
        )
      }
    >
      <FeedEntryByline
        handle={author.handle}
        when={item.when}
        verb={
          <>
            {item.kind === 'saved' ? <HeartIcon size={14} filled className="text-accent" /> : <VerbIcon size={14} />}
            {VERB[item.kind]}
          </>
        }
      />
      <Link href={`/recipe/${recipe.id}`} className="mt-1 block font-display text-[19px] font-bold leading-tight text-ink">
        {recipe.title}
      </Link>
      {item.caption && (
        <div className="mt-1 font-mono text-[14px] leading-relaxed text-ink-mute">&ldquo;{item.caption}&rdquo;</div>
      )}
      <div className="mt-1.5 font-mono text-meta text-ink-mute">
        {recipe.time} <span className="text-rule">·</span> serves {recipe.serves}{' '}
        <span className="text-rule">·</span> {recipe.madeIt} cooked
      </div>
      {recipe.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
    </FeedEntry>
  );
}
