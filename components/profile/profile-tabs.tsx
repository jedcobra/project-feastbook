'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookmarkIcon, ChevronIcon, PlusIcon } from '@/components/icons';
import { Tag } from '@/components/tag';
import type { Recipe, Shelf } from '@/lib/types';

type TabId = 'recipes' | 'shelves' | 'cooked';

export function ProfileTabs({
  shelves,
  recipes,
  savedRecipes = [],
  cookedRecipes = [],
  firstName,
  isOwn,
}: {
  shelves: Shelf[];
  recipes: Recipe[];
  savedRecipes?: Recipe[];
  cookedRecipes?: Recipe[];
  firstName: string;
  isOwn: boolean;
}) {
  const [tab, setTab] = useState<TabId>('recipes');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'recipes', label: 'Recipes' },
    { id: 'shelves', label: 'Shelves' },
    { id: 'cooked', label: 'Cooked' },
  ];

  return (
    <div>
      <div className="mx-5 flex gap-[22px] border-b border-dashed border-rule">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 py-2.5 font-mono text-[12px] ${
              tab === t.id
                ? 'border-ink font-semibold text-ink'
                : 'border-transparent font-normal text-ink-mute'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'recipes' && <RecipesTab recipes={recipes} savedRecipes={savedRecipes} />}
      {tab === 'shelves' && <ShelvesTab shelves={shelves} isOwn={isOwn} />}
      {tab === 'cooked' && <CookedTab recipes={cookedRecipes} firstName={firstName} />}
    </div>
  );
}

function ShelvesTab({ shelves, isOwn }: { shelves: Shelf[]; isOwn: boolean }) {
  return (
    <div className="mx-5 pb-8">
      {shelves.map((shelf) => (
        <Link
          key={shelf.id}
          href={`/shelf/${shelf.id}`}
          className="flex items-start gap-3.5 border-b border-dashed border-rule py-3.5"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-ink">
            <span className="font-mono text-[14px] font-semibold text-ink">{shelf.count}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 font-display text-[17px] font-bold text-ink">{shelf.title}</h3>
            <div className="mb-1.5 font-mono text-meta text-ink-mute">{shelf.subtitle}</div>
            <div className="flex flex-wrap gap-1.5">
              {shelf.recipes.slice(0, 3).map((r) => (
                <Tag key={r.id}>{r.title}</Tag>
              ))}
              {shelf.count > 3 && <Tag>+{shelf.count - 3} more</Tag>}
            </div>
          </div>
          <ChevronIcon size={16} className="mt-2.5 flex-shrink-0 text-ink-mute" />
        </Link>
      ))}
      {isOwn && (
        <Link
          href="/new-shelf"
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 border border-dashed border-rule py-3 font-mono text-[12px] text-ink-mute"
        >
          <PlusIcon size={13} />
          New shelf
        </Link>
      )}
    </div>
  );
}

// Authored recipes and recipes saved from other cooks, in one list — a
// saved-from-someone-else row carries a bookmark badge with their handle
// instead of a saves count, rather than living in a separate tab.
function RecipesTab({ recipes, savedRecipes }: { recipes: Recipe[]; savedRecipes: Recipe[] }) {
  const rows = [
    ...recipes.map((r) => ({ recipe: r, saved: false })),
    ...savedRecipes.map((r) => ({ recipe: r, saved: true })),
  ];

  if (rows.length === 0) {
    return (
      <div className="mx-5 pb-8 pt-6">
        <div className="border border-dashed border-rule p-5 text-center font-mono text-[12px] leading-relaxed text-ink-mute">
          Recipes written or saved here will show up here.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-5 pb-8">
      {rows.map(({ recipe: r, saved }) => (
        <Link
          key={r.id}
          href={`/recipe/${r.id}`}
          className="block border-b border-dashed border-rule py-3.5"
        >
          <div className="flex items-baseline gap-2.5">
            <h3 className="min-w-0 flex-1 font-display text-[17px] font-bold text-ink">{r.title}</h3>
            {saved ? (
              <span className="flex flex-shrink-0 items-center gap-1 font-mono text-meta text-ink-mute">
                <BookmarkIcon size={10} />@{r.author}
              </span>
            ) : (
              <span className="flex-shrink-0 font-mono text-meta text-ink-mute">{r.saves} saves</span>
            )}
          </div>
          <div className="mt-1 flex gap-2.5 font-mono text-meta text-ink-mute">
            <span>{r.time}</span>
            <span>·</span>
            <span>{r.madeIt} cooked</span>
            <span>·</span>
            <span>{r.difficulty}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CookedTab({ recipes, firstName }: { recipes: Recipe[]; firstName: string }) {
  if (recipes.length === 0) {
    return (
      <div className="mx-5 pb-8 pt-6">
        <div className="border border-dashed border-rule p-5 text-center font-mono text-[12px] leading-relaxed text-ink-mute">
          Recipes {firstName} has cooked
          <br />
          will appear here.
        </div>
      </div>
    );
  }
  return (
    <div className="mx-5 pb-8">
      {recipes.map((r) => (
        <Link
          key={r.id}
          href={`/recipe/${r.id}`}
          className="block border-b border-dashed border-rule py-3.5"
        >
          <div className="flex items-baseline gap-2.5">
            <h3 className="min-w-0 flex-1 font-display text-[17px] font-bold text-ink">{r.title}</h3>
            <span className="flex-shrink-0 font-mono text-meta text-ink-mute">@{r.author}</span>
          </div>
          <div className="mt-1 flex gap-2.5 font-mono text-meta text-ink-mute">
            <span>{r.time}</span>
            <span>·</span>
            <span>{r.madeIt} cooked</span>
            <span>·</span>
            <span>{r.difficulty}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
