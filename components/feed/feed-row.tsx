import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { Tag } from '@/components/tag';
import { byHandle, recipeById } from '@/lib/fixtures';
import type { FeedActivity } from '@/lib/types';

const VERB: Record<FeedActivity['kind'], string> = {
  new: 'added',
  madeit: 'cooked',
  saved: 'saved',
};

// Index feed row — noods-style activity line: author + verb, title, optional
// caption, meta + tags. The default Feed layout.
export function FeedRow({ item }: { item: FeedActivity }) {
  const recipe = recipeById(item.recipe);
  const author = byHandle(item.who);

  return (
    <div className="rule-y">
      <div className="flex items-center gap-2 px-5 pt-3">
        <Link href={`/${author.handle}`} className="flex items-center gap-2">
          <Avatar name={author.name} size={22} />
          <span className="font-mono text-[12px] text-ink underline decoration-dashed underline-offset-[3px]">
            {author.name}
          </span>
        </Link>
        <span className="font-mono text-meta text-ink-mute">{VERB[item.kind]}</span>
        <span className="ml-auto font-mono text-meta text-ink-mute">{item.when}</span>
      </div>

      <Link
        href={`/recipe/${recipe.id}`}
        className="block px-5 pb-1 pt-2 font-display text-feed-title font-bold text-ink"
      >
        {recipe.title}
      </Link>

      {item.caption && (
        <div className="px-5 pb-1 font-mono text-[12px] leading-relaxed text-ink-mute">
          &ldquo;{item.caption}&rdquo;
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 px-5 pb-3.5 pt-1.5">
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
    </div>
  );
}
