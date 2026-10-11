import Link from 'next/link';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import type { Recipe } from '@/lib/types';
import { Subheading } from '@/components/subheading';

// Same row format as a recipe row on the profile page's Recipes tab — one
// answer for what a recipe list item looks like, not a Discover-specific
// variant with its own tag chip and inline meta line.
export function TrendingRecipes({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="mb-6">
      <Subheading className="mb-2.5">Trending recipes</Subheading>
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/recipe/${recipe.id}`}
          className="flex items-center gap-2.5 border-b border-rule-soft bg-cream py-3.5"
        >
          {recipe.coverPhotoUrl && <RecipeThumbnail src={recipe.coverPhotoUrl} alt={recipe.title} />}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2.5">
              <h3 className="min-w-0 flex-1 font-display text-[17px] font-bold text-ink">{recipe.title}</h3>
              <span className="flex-shrink-0 font-mono text-meta text-ink-mute">{recipe.saves} saves</span>
            </div>
            <div className="mt-1 flex gap-2.5 font-mono text-meta text-ink-mute">
              <span>{recipe.time}</span>
              <span>·</span>
              <span>{recipe.madeIt} cooked</span>
              <span>·</span>
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
