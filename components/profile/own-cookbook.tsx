'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { supabase } from '@/lib/supabase/client';
import type { ProfileStatsRow } from '@/lib/supabase/types';
import type { Person } from '@/lib/types';

// The real, auth-backed Cookbook screen. Shelves/Recipes come back empty
// for now — recipe creation and shelf management aren't wired up yet, so
// a signed-in account genuinely has none, and that's the correct state
// to show rather than borrowing the fixture content.
export function OwnCookbook() {
  const { loading, user, profile, signOut } = useAuth();
  const [stats, setStats] = useState<ProfileStatsRow | null>(null);

  useEffect(() => {
    if (!profile) {
      setStats(null);
      return;
    }
    supabase
      .from('profile_stats')
      .select('*')
      .eq('id', profile.id)
      .maybeSingle()
      .then(({ data }) => setStats(data as ProfileStatsRow | null));
  }, [profile]);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[13px] leading-relaxed text-ink-mute">
          Sign in to see your own cookbook — your recipes, shelves, and what you&rsquo;ve made.
        </p>
        <Link
          href="/account"
          className="rounded-button border border-ink bg-ink px-5 py-2.5 font-mono text-[13px] font-semibold text-cream"
        >
          Sign in / Create account
        </Link>
      </div>
    );
  }

  const person: Person = {
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    bio: profile.bio,
    recipes: stats?.recipe_count ?? 0,
    followers: stats?.follower_count ?? 0,
    following: stats?.following_count ?? 0,
    seed: 0,
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ProfileHeader person={person} />
      <div className="mb-5 px-5">
        <button
          type="button"
          onClick={signOut}
          className="font-mono text-[12px] text-ink-mute underline decoration-dashed underline-offset-[3px]"
        >
          Sign out
        </button>
      </div>
      <ProfileTabs shelves={[]} recipes={[]} firstName={person.name.split(' ')[0]} isOwn />
    </div>
  );
}
