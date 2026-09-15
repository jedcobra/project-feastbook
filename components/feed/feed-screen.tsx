'use client';

import { useEffect, useState } from 'react';
import { FeedDateBar } from '@/components/feed/feed-date-bar';
import { FeedRow } from '@/components/feed/feed-row';
import { fetchFeed } from '@/lib/supabase/queries';
import type { FeedActivity, Person, Recipe } from '@/lib/types';

type FeedEntry = { activity: FeedActivity; recipe: Recipe; author: Person };

const TODAY = new Date()
  .toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })
  .toUpperCase();

export function FeedScreen() {
  const [entries, setEntries] = useState<FeedEntry[] | null>(null);

  useEffect(() => {
    fetchFeed().then(setEntries);
  }, []);

  if (entries === null) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <FeedDateBar date={TODAY} count={entries.length} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        {entries.length === 0 ? (
          <div className="px-5 pt-8 text-center font-mono text-[12px] text-ink-mute">
            No activity yet — recipes people add, cook, or save will show up here.
          </div>
        ) : (
          entries.map(({ activity, recipe, author }, i) => (
            <FeedRow key={i} item={activity} recipe={recipe} author={author} />
          ))
        )}
      </div>
    </>
  );
}
