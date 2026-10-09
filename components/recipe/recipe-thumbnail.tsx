import { classifyRecipeIcon, RECIPE_ICON_BY_CATEGORY } from '@/lib/recipe-icon';

interface RecipeThumbnailProps {
  recipe: { title: string; subtitle?: string; tags?: string[]; coverPhotoUrl?: string };
  size?: number;
}

// The one answer for "what does a recipe photo look like" — used
// everywhere a recipe row renders (feed, discover, profile, search,
// shelves). No cover photo gets a category icon (guessed from the title/
// tags) instead of an empty gap — a fish for salmon, a leaf for a salad,
// a bottle for a sauce, and so on, with a plain fork/utensil as the catch-all.
export function RecipeThumbnail({ recipe, size = 44 }: RecipeThumbnailProps) {
  if (recipe.coverPhotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={recipe.coverPhotoUrl}
        alt={recipe.title}
        className="flex-shrink-0 rounded-button border border-rule object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const Icon = RECIPE_ICON_BY_CATEGORY[classifyRecipeIcon(recipe)];
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-button border border-rule bg-cream-deep text-ink-mute"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.46} />
    </div>
  );
}
