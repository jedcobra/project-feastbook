'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { OnboardStep } from '@/components/onboarding/onboard-step';
import { fetchDiscoverPeople, setFollowing } from '@/lib/supabase/queries';
import type { Person } from '@/lib/types';

// Step 2 of 4 — a feed needs people in it. Follows are written immediately
// as you tap, same as everywhere else in the app; nothing here is
// pre-selected for you.
export function FollowStep({
  profileId,
  onNext,
  onSkip,
}: {
  profileId: string;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [following, setFollowingState] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDiscoverPeople(profileId, 5).then(setPeople);
  }, [profileId]);

  const toggle = async (personId: string) => {
    const next = !following.has(personId);
    setFollowingState((f) => {
      const s = new Set(f);
      if (next) s.add(personId);
      else s.delete(personId);
      return s;
    });
    await setFollowing(profileId, personId, next);
  };

  return (
    <OnboardStep
      step={1}
      total={4}
      title="Cooks worth following"
      blurb={`You're following ${following.size}.`}
      cta={following.size ? 'Continue' : 'Continue without following anyone'}
      onNext={onNext}
      onSkip={onSkip}
      skipLabel="Find people later"
    >
      <div className="pb-5">
        {people?.map((p) => {
          const on = following.has(p.id);
          return (
            <div key={p.id} className="flex items-center gap-2.5 border-t border-dashed border-rule py-[11px]">
              <Avatar name={p.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-[14.5px] font-bold text-ink">{p.name}</div>
                <div className="truncate font-mono text-[10.5px] leading-[1.45] text-ink-mute">{p.bio}</div>
              </div>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className={`flex-shrink-0 rounded-button border border-ink px-2.5 py-1.5 font-mono text-[11px] ${
                  on ? 'bg-ink text-cream' : 'bg-transparent text-ink'
                }`}
              >
                {on ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </OnboardStep>
  );
}
