'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { CooksToFollow } from '@/components/discover/cooks-to-follow';
import { SearchInput } from '@/components/discover/search-input';
import { TrendingRecipes } from '@/components/discover/trending-recipes';
import { fetchDiscoverPeople, fetchTrendingRecipes } from '@/lib/supabase/queries';
import type { Person, Recipe } from '@/lib/types';

export function DiscoverScreen() {
  const { profile } = useAuth();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  useEffect(() => {
    fetchDiscoverPeople(profile?.id ?? null).then(setPeople);
    fetchTrendingRecipes().then(setRecipes);
  }, [profile?.id]);

  if (!people || !recipes) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span className="font-mono text-[14px] text-ink-mute">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
      <SearchInput placeholder="Search recipes, cooks, tags…" />
      {recipes.length > 0 && <TrendingRecipes recipes={recipes} />}
      {people.length > 0 && <CooksToFollow people={people} />}
    </div>
  );
}
