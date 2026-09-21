'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FollowActions } from '@/components/profile/follow-actions';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { fetchCookedRecipes, fetchProfileByHandle, isFollowing, setFollowing } from '@/lib/supabase/queries';
import type { Person, Recipe, Shelf } from '@/lib/types';

export function FriendProfileScreen({ handle }: { handle: string }) {
  const { profile } = useAuth();
  const [data, setData] = useState<
    { person: Person; recipes: Recipe[]; shelves: Shelf[] } | null | undefined
  >(undefined);
  const [following, setFollowingState] = useState(false);
  const [cookedRecipes, setCookedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetchProfileByHandle(handle).then(setData);
  }, [handle]);

  useEffect(() => {
    if (data) fetchCookedRecipes(data.person.id).then(setCookedRecipes);
  }, [data]);

  useEffect(() => {
    if (profile && data) {
      isFollowing(profile.id, data.person.id).then(setFollowingState);
    } else {
      setFollowingState(false);
    }
  }, [profile, data]);

  const toggleFollow = async () => {
    if (!profile || !data) return;
    const next = !following;
    setFollowingState(next);
    await setFollowing(profile.id, data.person.id, next);
  };

  if (data === undefined) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
        <span className="font-mono text-[12px] text-ink-mute">No one here by that handle.</span>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ProfileHeader person={data.person} />
      {profile ? (
        <FollowActions
          personId={data.person.id}
          myId={profile.id}
          following={following}
          onToggleFollow={toggleFollow}
        />
      ) : (
        <div className="px-5 pb-[18px]">
          <Link
            href="/account"
            className="block w-full rounded-button border border-ink bg-ink py-2.5 text-center font-mono text-[13px] font-semibold text-cream"
          >
            Sign in to follow
          </Link>
        </div>
      )}
      <ProfileTabs
        shelves={data.shelves}
        recipes={data.recipes}
        cookedRecipes={cookedRecipes}
        firstName={data.person.name.split(' ')[0]}
        isOwn={false}
      />
    </div>
  );
}
