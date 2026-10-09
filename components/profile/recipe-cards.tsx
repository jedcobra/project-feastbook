import Link from 'next/link';
import { ForkIcon } from '@/components/icons';
import type { Recipe } from '@/lib/types';

const PLACEHOLDER_TINTS = ['bg-accent/15', 'bg-accent-2/15', 'bg-accent-3/15', 'bg-ink/10'];

// Option 2 for the Recipes tab: full-width magazine cards (photo on top,
// title and meta below) instead of list rows or a square grid — bigger,
// fewer per screen, but each recipe gets more room to actually look like
// something you'd want to cook.
export function RecipeCards({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="flex flex-col gap-3.5 px-5 pb-8 pt-3.5">
      {recipes.map((r, i) => (
        <Link key={r.id} href={`/recipe/${r.id}`} className="block overflow-hidden rounded-button border border-ink">
          <div className="relative h-36 w-full">
            {r.coverPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.coverPhotoUrl} alt={r.title} className="h-full w-full object-cover" />
            ) : (
              <div className={`flex h-full w-full items-center justify-center ${PLACEHOLDER_TINTS[i % PLACEHOLDER_TINTS.length]}`}>
                <ForkIcon size={28} className="text-ink-mute" />
              </div>
            )}
          </div>
          <div className="px-3.5 py-2.5">
            <h3 className="font-display text-[16px] font-bold text-ink">{r.title}</h3>
            <div className="mt-0.5 font-mono text-[10.5px] text-ink-mute">
              {r.time} · {r.madeIt} cooked · {r.difficulty}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
