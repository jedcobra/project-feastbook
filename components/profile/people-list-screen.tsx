'use client';

import { useEffect, useState } from 'react';
import { CookRow } from '@/components/discover/cooks-to-follow';
import { TopBar } from '@/components/top-bar';
import { fetchFollowers, fetchFollowing, fetchProfileByHandle } from '@/lib/supabase/queries';
import type { Person } from '@/lib/types';

type Kind = 'followers' | 'following';

const COPY: Record<Kind, { title: string; empty: string }> = {
  followers: { title: 'Followers', empty: 'Nobody yet — recipes worth following bring their own audience.' },
  following: { title: 'Following', empty: 'Not following anyone yet.' },
};

export function PeopleListScreen({ handle, kind }: { handle: string; kind: Kind }) {
  const [person, setPerson] = useState<Person | null | undefined>(undefined);
  const [people, setPeople] = useState<Person[] | null>(null);

  useEffect(() => {
    setPerson(undefined);
    setPeople(null);
    fetchProfileByHandle(handle).then((data) => {
      if (!data) {
        setPerson(null);
        return;
      }
      setPerson(data.person);
      const fetcher = kind === 'followers' ? fetchFollowers : fetchFollowing;
      fetcher(data.person.id).then(setPeople);
    });
  }, [handle, kind]);

  const copy = COPY[kind];

  if (person === undefined) {
    return (
      <>
        <TopBar title={copy.title} backHref={`/${handle}`} />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (person === null) {
    return (
      <>
        <TopBar title={copy.title} backHref={`/${handle}`} />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">No one here by that handle.</span>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={copy.title} backHref={`/${handle}`} subtitle={`@${person.handle}`} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {people === null ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">Loading…</div>
        ) : people.length === 0 ? (
          <div className="mt-4 border border-dashed border-rule p-[22px] text-center font-mono text-[12px] leading-[1.55] text-ink-mute">
            {copy.empty}
          </div>
        ) : (
          people.map((p, i) => <CookRow key={p.id} person={p} first={i === 0} />)
        )}
      </div>
    </>
  );
}
