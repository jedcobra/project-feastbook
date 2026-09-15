'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CookingScreen } from '@/components/cooking/cooking-screen';
import { fetchRecipeFull } from '@/lib/supabase/queries';
import type { Recipe } from '@/lib/types';

// Fetches the real recipe client-side, then hands off to CookingScreen.
// Redirects back to the recipe page if it turns out to have no steps —
// mirrors the old static-fixture behavior, just decided after the fetch
// instead of at build time.
export function CookingScreenLoader({ id }: { id: string }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);

  useEffect(() => {
    fetchRecipeFull(id).then((data) => {
      if (!data) {
        setRecipe(null);
        return;
      }
      if (data.recipe.steps.length === 0) {
        router.replace(`/recipe/${id}`);
        return;
      }
      setRecipe(data.recipe);
    });
  }, [id, router]);

  if (recipe === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center bg-ink">
        <span className="font-mono text-[12px] text-cream/50">Loading…</span>
      </div>
    );
  }

  if (recipe === null) {
    return (
      <div className="flex flex-1 items-center justify-center bg-ink px-8 text-center">
        <span className="font-mono text-[12px] text-cream/50">Recipe not found.</span>
      </div>
    );
  }

  return <CookingScreen recipe={recipe} />;
}
