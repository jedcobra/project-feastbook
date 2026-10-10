import Link from 'next/link';
import { Avatar } from '@/components/avatar';
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

// The header every feed post shares: who, what they did, and when.
export function FeedPostHeader({
  handle,
  avatarUrl,
  verb,
  when,
}: {
  handle: string;
  avatarUrl?: string;
  verb: React.ReactNode;
  when: string;
}) {
  return (
    <div className="flex items-center gap-2 px-5 pb-2.5 pt-3.5">
      <Link href={`/${handle}`} className="flex min-w-0 items-center gap-2">
        <Avatar name={handle} src={avatarUrl} size={28} />
        <span className="truncate font-mono text-[14px] font-semibold text-ink">@{handle}</span>
      </Link>
      <span className="flex flex-shrink-0 items-center gap-1 font-mono text-meta text-ink-mute">{verb}</span>
      <span className="ml-auto flex-shrink-0 font-mono text-meta text-ink-mute">{when}</span>
    </div>
  );
}

// A recipe activity post (added / cooked / saved), led by the recipe's
// cover photo when it has one; without one, the title carries the post.
export function FeedRow({ item, recipe, author }: { item: FeedActivity; recipe: Recipe; author: Person }) {
  const VerbIcon = VERB_ICON[item.kind];
  return (
    <article className="border-b border-dashed border-rule pb-3.5">
      <FeedPostHeader
        handle={author.handle}
        avatarUrl={author.avatarUrl}
        when={item.when}
        verb={
          <>
            {item.kind === 'saved' ? <HeartIcon size={16} filled className="text-accent" /> : <VerbIcon size={16} />}
            {VERB[item.kind]}
          </>
        }
      />

      {recipe.coverPhotoUrl && (
        <Link href={`/recipe/${recipe.id}`} className="block bg-cream-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.coverPhotoUrl} alt={recipe.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </Link>
      )}

      <Link href={`/recipe/${recipe.id}`} className={`block px-5 ${recipe.coverPhotoUrl ? 'pt-3' : 'pt-0.5'}`}>
        <span className="font-display text-feed-title font-bold text-ink">{recipe.title}</span>
      </Link>

      {item.caption && (
        <div className="px-5 pt-1 font-mono text-[14px] leading-relaxed text-ink-mute">&ldquo;{item.caption}&rdquo;</div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 px-5 pt-2">
        <span className="font-mono text-meta text-ink-mute">{recipe.time}</span>
        <span className="text-rule">·</span>
        <span className="font-mono text-meta text-ink-mute">serves {recipe.serves}</span>
        <span className="text-rule">·</span>
        <span className="font-mono text-meta text-ink-mute">{recipe.madeIt} cooked</span>
        <div className="ml-auto flex gap-1">
          {recipe.tags.slice(0, 2).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>
    </article>
  );
}
