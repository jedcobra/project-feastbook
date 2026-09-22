'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorScreen } from '@/components/error-screen';
import { FeedDateBar } from '@/components/feed/feed-date-bar';
import { FeedRow } from '@/components/feed/feed-row';
import { FeedSkeleton } from '@/components/feed/feed-skeleton';
import { fetchFeed } from '@/lib/supabase/queries';
import type { FeedActivity, Person, Recipe } from '@/lib/types';

type FeedEntry = { activity: FeedActivity; recipe: Recipe; author: Person };

const TODAY = new Date()
  .toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })
  .toUpperCase();

export function FeedScreen() {
  // undefined = loading, null = fetch failed, [] = genuinely empty.
  const [entries, setEntries] = useState<FeedEntry[] | null | undefined>(undefined);

  const load = useCallback(() => {
    setEntries(undefined);
    fetchFeed().then(setEntries);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (entries === undefined) {
    return <FeedSkeleton />;
  }

  if (entries === null) {
    return (
      <ErrorScreen
        kind={typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'server'}
        onRetry={load}
      />
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
