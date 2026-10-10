'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HandleLink } from '@/components/handle-link';
import { ChefHatIcon, ChevronIcon, HeartIcon, PlusIcon } from '@/components/icons';
import { Tag } from '@/components/tag';
import { fetchRecipeOverview } from '@/lib/supabase/queries';
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

// Recipe posts are horizontal entries, like a page in a recipe book: the
// picture bleeds to the left edge and to the entry's top and bottom across
// the first quarter, and the details fill the other three. The image is at
// least square and grows with the entry if the text runs taller. Entries
// without a picture are just the text. (Cooked photos get their own
// full-width post — see FeedPhotoPost.)
export function FeedEntry({ image, children }: { image?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex">
      {image && (
        <div className="relative w-1/4 flex-shrink-0 bg-cream-deep">
          <div className="aspect-square" aria-hidden />
          {image}
        </div>
      )}
      <div className={`min-w-0 flex-1 py-4 pr-5 ${image ? 'pl-3.5' : 'pl-5'}`}>{children}</div>
    </div>
  );
}

// The image fills the whole left quarter.
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

type Overview = { ingredients: string[]; stepCount: number } | null | undefined;

// A recipe activity entry (added / cooked / saved), led by the recipe's
// cover photo when it has one. Tapping it expands a short overview of the
// recipe in place, with a "Make it" button through to the full recipe.
export function FeedRow({ item, recipe, author }: { item: FeedActivity; recipe: Recipe; author: Person }) {
  const VerbIcon = VERB_ICON[item.kind];
  const [expanded, setExpanded] = useState(false);
  // undefined = not loaded yet, null = couldn't load.
  const [overview, setOverview] = useState<Overview>(undefined);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && overview === undefined) fetchRecipeOverview(recipe.id).then(setOverview);
  };

  return (
    <article className="border-b border-dashed border-rule">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className="cursor-pointer"
      >
        <FeedEntry
          image={
            recipe.coverPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.coverPhotoUrl}
                alt={recipe.title}
                loading="lazy"
                className={`${FEED_IMAGE_FILL} object-cover`}
              />
            )
          }
        >
          <FeedEntryByline
            handle={author.handle}
            when={item.when}
            verb={
              <>
                {item.kind === 'saved' ? (
                  <HeartIcon size={14} filled className="text-accent" />
                ) : (
                  <VerbIcon size={14} />
                )}
                {VERB[item.kind]}
              </>
            }
          />
          <div className="mt-1 flex items-start gap-2">
            <h3 className="min-w-0 flex-1 font-display text-[19px] font-bold leading-tight text-ink">{recipe.title}</h3>
            <ChevronIcon
              size={13}
              className={`mt-1 flex-shrink-0 text-ink-mute transition-transform ${expanded ? '-rotate-90' : 'rotate-90'}`}
            />
          </div>
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
      </div>

      {expanded && <RecipeOverview recipe={recipe} overview={overview} />}
    </article>
  );
}

const INGREDIENT_PREVIEW = 6;

function RecipeOverview({ recipe, overview }: { recipe: Recipe; overview: Overview }) {
  const facts = [
    recipe.difficulty,
    overview ? `${overview.stepCount} step${overview.stepCount === 1 ? '' : 's'}` : null,
    recipe.ratingCount > 0 ? `${recipe.rating.toFixed(1)} ★ (${recipe.ratingCount})` : null,
    `${recipe.saves} save${recipe.saves === 1 ? '' : 's'}`,
  ].filter(Boolean);

  return (
    <div className="border-t border-dashed border-rule bg-cream-surface px-5 pb-4 pt-3.5">
      {recipe.subtitle && <p className="font-mono text-[14px] leading-[1.5] text-ink">{recipe.subtitle}</p>}
      {recipe.intro && (
        <p className="mt-1.5 line-clamp-4 font-mono text-[14px] leading-[1.55] text-ink-mute">{recipe.intro}</p>
      )}

      <div className="mt-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-mute">Ingredients</div>
      <p className="mt-1 font-mono text-[14px] leading-[1.5] text-ink">
        {overview === undefined
          ? 'Loading…'
          : overview === null
            ? 'Couldn’t load them — open the recipe to see everything.'
            : overview.ingredients.length === 0
              ? 'None listed yet.'
              : overview.ingredients.slice(0, INGREDIENT_PREVIEW).join(', ') +
                (overview.ingredients.length > INGREDIENT_PREVIEW
                  ? ` + ${overview.ingredients.length - INGREDIENT_PREVIEW} more`
                  : '')}
      </p>

      <div className="mt-2.5 font-mono text-meta text-ink-mute">{facts.join(' · ')}</div>

      <Link
        href={`/recipe/${recipe.id}`}
        className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-button border border-ink bg-ink py-2.5 font-mono text-[14px] font-semibold text-cream"
      >
        Make it
        <ChevronIcon size={13} weight={2} />
      </Link>
    </div>
  );
}
