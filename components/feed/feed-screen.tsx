'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ErrorScreen } from '@/components/error-screen';
import { FeedDateBar } from '@/components/feed/feed-date-bar';
import { FeedRow } from '@/components/feed/feed-row';
import { FeedSkeleton } from '@/components/feed/feed-skeleton';
import { FeedTabs } from '@/components/feed/feed-tabs';
import { fetchFeed, type FeedScope } from '@/lib/supabase/queries';
import type { FeedActivity, Person, Recipe } from '@/lib/types';

type FeedEntry = { activity: FeedActivity; recipe: Recipe; author: Person };

const TODAY = new Date()
  .toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })
  .toUpperCase();

export function FeedScreen() {
  const { profile } = useAuth();
  const [scope, setScope] = useState<FeedScope>('for-you');
  // undefined = loading, null = fetch failed, [] = genuinely empty.
  const [entries, setEntries] = useState<FeedEntry[] | null | undefined>(undefined);

  const load = useCallback(() => {
    setEntries(undefined);
    fetchFeed(scope, profile?.id ?? null).then(setEntries);
  }, [scope, profile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <FeedTabs scope={scope} onChange={setScope} />
      {entries === undefined ? (
        <FeedSkeleton />
      ) : entries === null ? (
        <ErrorScreen
          kind={typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'server'}
          onRetry={load}
        />
      ) : (
        <>
          <FeedDateBar date={TODAY} count={entries.length} />
          <div className="min-h-0 flex-1 overflow-y-auto pb-8">
            {entries.length === 0 ? (
              <div className="px-5 pt-8 text-center font-mono text-[12px] text-ink-mute">
                {scope === 'following' ? (
                  <>
                    Nothing from people you follow yet.{' '}
                    <Link href="/discover" className="text-ink underline decoration-dashed underline-offset-[3px]">
                      Find some cooks
                    </Link>{' '}
                    to follow.
                  </>
                ) : (
                  'No activity yet — recipes people add, cook, or save will show up here.'
                )}
              </div>
            ) : (
              entries.map(({ activity, recipe, author }, i) => (
                <FeedRow key={i} item={activity} recipe={recipe} author={author} />
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}
