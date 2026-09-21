'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { EmptyCookbook } from '@/components/profile/empty-cookbook';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { fetchCookedRecipes, fetchProfileByHandle, fetchSavedRecipes } from '@/lib/supabase/queries';
import type { Person, Recipe, Shelf } from '@/lib/types';

// The real, auth-backed Cookbook screen.
export function OwnCookbook() {
  const { loading, user, profile, signOut } = useAuth();
  const [data, setData] = useState<{ person: Person; recipes: Recipe[]; shelves: Shelf[] } | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [cookedRecipes, setCookedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!profile) {
      setData(null);
      setSavedRecipes([]);
      setCookedRecipes([]);
      return;
    }
    fetchProfileByHandle(profile.handle).then(setData);
    fetchSavedRecipes(profile.id).then(setSavedRecipes);
    fetchCookedRecipes(profile.id).then(setCookedRecipes);
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

  if (!data) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
      </div>
    );
  }

  const signOutLink = (
    <div className="mb-5 px-5">
      <button
        type="button"
        onClick={signOut}
        className="font-mono text-[12px] text-ink-mute underline decoration-dashed underline-offset-[3px]"
      >
        Sign out
      </button>
    </div>
  );

  if (data.recipes.length === 0 && savedRecipes.length === 0 && cookedRecipes.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        {signOutLink}
        <EmptyCookbook name={data.person.name.split(' ')[0]} />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ProfileHeader person={data.person} />
      {signOutLink}
      <ProfileTabs
        shelves={data.shelves}
        recipes={data.recipes}
        savedRecipes={savedRecipes}
        cookedRecipes={cookedRecipes}
        firstName={data.person.name.split(' ')[0]}
        isOwn
      />
    </div>
  );
}
