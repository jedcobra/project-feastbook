import { Avatar } from '@/components/avatar';
import { Label } from '@/components/label';
import { Tag } from '@/components/tag';
import type { Person, Recipe } from '@/lib/types';

// The whole recipe, readable by anyone with the link — no sign-in wall, no
// interactivity (no checklists, no cook mode, no comments). Just what's on
// the page. Server-rendered, so this is exactly what a crawler sees too.
export function PublicRecipeDocument({ recipe, author }: { recipe: Recipe; author: Person }) {
  return (
    <div className="px-5 pb-6 pt-[18px]">
      {recipe.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}

      <h1 className="mb-2 text-balance font-display text-hero font-bold text-ink">{recipe.title}</h1>
      {recipe.subtitle && (
        <div className="mb-3.5 font-mono text-[13px] leading-relaxed text-ink-mute">{recipe.subtitle}</div>
      )}

      {recipe.coverPhotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.coverPhotoUrl}
          alt=""
          className="mb-3.5 h-48 w-full rounded-button border border-rule object-cover"
        />
      )}

      <div className="mb-3.5 flex items-center gap-2">
        <Avatar name={author.name} size={24} />
        <span className="font-mono text-[13px] text-ink">{author.name}</span>
        <span className="font-mono text-meta text-ink-mute">@{author.handle}</span>
      </div>

      <div className="mb-4 grid grid-cols-3 border-y border-dashed border-rule">
        {([
          ['Time', recipe.time],
          ['Serves', recipe.serves],
          ['Level', recipe.difficulty],
        ] as [string, string | number][]).map(([k, v], i) => (
          <div key={k} className={`py-2.5 text-center ${i < 2 ? 'border-r border-dashed border-rule' : ''}`}>
            <Label className="mb-0.5 text-[9px]">{k}</Label>
            <div className="font-mono text-[12px] text-ink">{v}</div>
          </div>
        ))}
      </div>

      {recipe.intro && (
        <div className="mb-4 border-b border-dashed border-rule pb-4 font-mono text-[12.5px] leading-[1.65] text-ink-mute">
          {recipe.intro}
        </div>
      )}

      {recipe.ingredients.length > 0 && (
        <div className="mb-5">
          <Label className="mb-2">Ingredients</Label>
          {recipe.ingredients.map((section, si) => (
            <div key={si} className="mb-2.5">
              {section.section && (
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  {section.section}
                </div>
              )}
              {section.items.map((item, i) => (
                <div key={i} className="flex gap-2.5 border-t border-dotted border-rule py-1.5">
                  <span className="w-16 flex-shrink-0 font-mono text-[11px] text-ink-mute">{item.q}</span>
                  <span className="min-w-0 flex-1 break-words font-mono text-[12px] text-ink">{item.i}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {recipe.steps.length > 0 && (
        <div className="mb-5">
          <Label className="mb-2">Method</Label>
          {recipe.steps.map((step, i) => (
            <div key={i} className="flex gap-2.5 border-t border-dashed border-rule py-[11px]">
              <span className="w-5 flex-shrink-0 pt-px font-mono text-meta text-ink-mute">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div className="mb-0.5 font-display text-[15px] font-bold text-ink">{step.t}</div>
                <div className="font-mono text-[11.5px] leading-[1.55] text-ink-mute">{step.d}</div>
                {step.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={step.photoUrl}
                    alt=""
                    className="mt-1.5 h-20 w-20 rounded-button border border-rule object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-[22px] border border-ink p-4 text-center">
        <div className="mb-1.5 font-display text-[19px] font-bold text-ink">Keep this one?</div>
        <div className="mb-3.5 font-mono text-[11.5px] leading-[1.55] text-ink-mute">
          An account gives you a shelf to put it on, step-by-step cooking mode, and {author.name}&rsquo;s next one.
        </div>
        <a
          href="/account/sign-up"
          className="block w-full rounded-button border border-ink bg-ink py-3 text-center font-mono text-[12.5px] font-semibold text-cream"
        >
          Create an account — free
        </a>
      </div>

      <div className="mt-4 text-center font-mono text-[10px] leading-[1.6] text-ink-mute">
        {recipe.madeIt} {recipe.madeIt === 1 ? 'person has' : 'people have'} cooked this
      </div>
    </div>
  );
}
