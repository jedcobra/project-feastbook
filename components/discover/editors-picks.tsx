import Link from 'next/link';
import { Label } from '@/components/label';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { Tag } from '@/components/tag';
import type { Recipe } from '@/lib/types';

export function EditorsPicks({ recipes }: { recipes: Recipe[] }) {
  return (
    <div>
      <Label className="mb-2.5">Editor&rsquo;s picks</Label>
      {recipes.map((recipe, i) => (
        <Link
          key={recipe.id}
          href={`/recipe/${recipe.id}`}
          className={`flex items-baseline gap-2.5 border-b border-dashed border-rule py-2.5 ${
            i === 0 ? 'border-t' : ''
          }`}
        >
          {recipe.coverPhotoUrl && <RecipeThumbnail src={recipe.coverPhotoUrl} alt={recipe.title} />}
          <div className="min-w-0 flex-1">
            <h3 className="mb-0.5 font-display text-[16px] font-bold text-ink">{recipe.title}</h3>
            <div className="font-mono text-meta text-ink-mute">
              {recipe.time} · {recipe.difficulty} · {recipe.madeIt} cooked
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-1">
            {recipe.tags.slice(0, 1).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
