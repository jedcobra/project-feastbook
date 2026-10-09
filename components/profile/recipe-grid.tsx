import Link from 'next/link';
import { ForkIcon } from '@/components/icons';
import type { Recipe } from '@/lib/types';

const PLACEHOLDER_TINTS = ['bg-accent/15', 'bg-accent-2/15', 'bg-accent-3/15', 'bg-ink/10'];

// Option: a 2-up photo grid for the Recipes tab instead of a text list —
// a recipe without a cover photo still gets a tinted placeholder (cycling
// through the accent palette) rather than an empty square.
export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-5 pb-8 pt-3.5">
      {recipes.map((r, i) => (
        <Link
          key={r.id}
          href={`/recipe/${r.id}`}
          className="group relative aspect-square overflow-hidden rounded-button border border-ink"
        >
          {r.coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.coverPhotoUrl} alt={r.title} className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${PLACEHOLDER_TINTS[i % PLACEHOLDER_TINTS.length]}`}>
              <ForkIcon size={22} className="text-ink-mute" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-2 pt-6">
            <div className="line-clamp-2 font-display text-[13px] font-bold leading-tight text-cream">{r.title}</div>
            <div className="mt-0.5 font-mono text-[9px] text-cream/80">
              {r.time} · {r.madeIt} cooked
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
