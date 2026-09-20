'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { IngredientsBlock } from '@/components/recipe/ingredients-block';
import { Label } from '@/components/label';
import { RecipeMeta } from '@/components/recipe/recipe-meta';
import { TopBar } from '@/components/top-bar';
import { fetchMyRecipesFull } from '@/lib/supabase/queries';
import type { Recipe } from '@/lib/types';

// One long printable document: every recipe you've written, one per page.
// No cooking-mode chrome, no comments, no bookmark buttons — just the
// content, the same way the single-recipe "Print or save as PDF" row does.
export function PrintCookbookScreen() {
  const { profile } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  useEffect(() => {
    if (profile) fetchMyRecipesFull(profile.id).then(setRecipes);
  }, [profile]);

  useEffect(() => {
    if (recipes && recipes.length > 0) {
      const id = setTimeout(() => window.print(), 300);
      return () => clearTimeout(id);
    }
  }, [recipes]);

  if (!profile) return null;

  return (
    <>
      <TopBar title="Print your cookbook" backHref="/settings/account" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {recipes === null ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">Gathering your recipes…</div>
        ) : recipes.length === 0 ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">
            You haven’t written any recipes yet.
          </div>
        ) : (
          recipes.map((recipe, i) => (
            <div key={recipe.id} className={i > 0 ? 'break-before-page pt-6' : ''}>
              <h1 className="mb-1.5 text-balance font-display text-hero font-bold text-ink">{recipe.title}</h1>
              {recipe.subtitle && (
                <div className="mb-3 font-mono text-[13px] leading-relaxed text-ink-mute">{recipe.subtitle}</div>
              )}
              <RecipeMeta recipe={recipe} />
              {recipe.intro && (
                <div className="mb-5 border-b border-dashed border-rule pb-5 font-mono text-[13px] leading-[1.65] text-ink-mute">
                  {recipe.intro}
                </div>
              )}
              {recipe.ingredients.length > 0 && (
                <div className="mb-5">
                  <IngredientsBlock sections={recipe.ingredients} />
                </div>
              )}
              {recipe.steps.length > 0 && (
                <div className="mb-5">
                  <Label className="mb-2.5">Method</Label>
                  {recipe.steps.map((step, si) => (
                    <div key={si} className="border-t border-dashed border-rule py-3">
                      <div className="flex items-start gap-3">
                        <span className="w-5 flex-shrink-0 pt-px font-mono text-meta text-ink-mute">
                          {String(si + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <div className="mb-1.5 font-display text-[16px] font-bold leading-tight text-ink">
                            {step.t}
                          </div>
                          {step.d && (
                            <div className="font-mono text-[12px] leading-relaxed text-ink-mute">{step.d}</div>
                          )}
                        </div>
                        {step.timer && (
                          <span className="flex-shrink-0 rounded-[3px] border border-accent px-[5px] py-0.5 font-mono text-[10px] text-accent">
                            {step.timer}m
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {recipe.notes.length > 0 && (
                <div className="mb-5 border border-dashed border-rule bg-cream-deep p-3.5">
                  <Label className="mb-2">Author’s notes</Label>
                  {recipe.notes.map((note, ni) => (
                    <div key={ni} className="mb-1 font-mono text-[12px] leading-relaxed text-ink-mute">
                      — {note.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
