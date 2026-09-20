import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { CommentsBlock } from '@/components/recipe/comments-block';
import { CookButton } from '@/components/recipe/cook-button';
import { IngredientsBlock } from '@/components/recipe/ingredients-block';
import { Label } from '@/components/label';
import { MethodBlock } from '@/components/recipe/method-block';
import { RecipeMeta } from '@/components/recipe/recipe-meta';
import { Tag } from '@/components/tag';
import type { Person, Recipe } from '@/lib/types';

// The default Recipe Detail layout — a single scrolling document, noods-style.
export function DocumentDetail({ recipe, author }: { recipe: Recipe; author: Person }) {
  return (
    <>
      <div className="flex-1 px-5">
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          {recipe.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>

        <h1 className="mb-2 text-balance font-display text-hero font-bold text-ink">
          {recipe.title}
        </h1>
        <div className="mb-4 font-mono text-[13px] leading-relaxed text-ink-mute">
          {recipe.subtitle}
        </div>

        <Link href={`/${author.handle}`} className="flex items-center gap-2">
          <Avatar name={author.name} size={24} />
          <span className="font-mono text-[13px] text-ink underline decoration-dashed underline-offset-[3px]">
            {author.name}
          </span>
          <span className="font-mono text-meta text-ink-mute">@{author.handle}</span>
        </Link>

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
            <MethodBlock steps={recipe.steps} />
          </div>
        )}

        {recipe.notes.length > 0 && (
          <div className="mb-5 border border-dashed border-rule bg-cream-deep p-3.5">
            <Label className="mb-2">Author&rsquo;s notes</Label>
            {recipe.notes.map((note, i) => (
              <div key={i} className="mb-1 font-mono text-[12px] leading-relaxed text-ink-mute">
                — {note.text}
              </div>
            ))}
          </div>
        )}

        <CommentsBlock recipeId={recipe.id} comments={recipe.comments} />
      </div>
      <CookButton recipeId={recipe.id} hasSteps={recipe.steps.length > 0} />
    </>
  );
}
