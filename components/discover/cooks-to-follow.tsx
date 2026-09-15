'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { Label } from '@/components/label';
import { OutlineBox, outlineBoxClasses } from '@/components/outline-box';
import { formatCount } from '@/lib/format';
import { isFollowing, setFollowing } from '@/lib/supabase/queries';
import type { Person } from '@/lib/types';

export function CooksToFollow({ people }: { people: Person[] }) {
  return (
    <div className="mb-6">
      <Label className="mb-2.5">Cooks to follow</Label>
      {people.map((person, i) => (
        <CookRow key={person.id} person={person} first={i === 0} />
      ))}
    </div>
  );
}

function CookRow({ person, first }: { person: Person; first: boolean }) {
  const { profile } = useAuth();
  const [following, setFollowingState] = useState(false);

  useEffect(() => {
    if (profile) isFollowing(profile.id, person.id).then(setFollowingState);
  }, [profile, person.id]);

  const toggleFollow = async () => {
    if (!profile) return;
    const next = !following;
    setFollowingState(next);
    await setFollowing(profile.id, person.id, next);
  };

  return (
    <div className={`flex items-center gap-2.5 border-b border-dashed border-rule py-3 ${first ? 'border-t' : ''}`}>
      <Link href={`/${person.handle}`} className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar name={person.name} size={30} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-bold text-ink">{person.name}</div>
          <div className="mt-px font-mono text-meta text-ink-mute">
            {person.recipes} recipes · {formatCount(person.followers)} followers
          </div>
        </div>
      </Link>
      {profile ? (
        <OutlineBox compact filled={following} onClick={toggleFollow}>
          {following ? 'Following' : 'Follow'}
        </OutlineBox>
      ) : (
        <Link href="/account" className={outlineBoxClasses(true)}>
          Follow
        </Link>
      )}
    </div>
  );
}
