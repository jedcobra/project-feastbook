import type { Recipe } from '@/lib/types';

export function RecipeMeta({ recipe }: { recipe: Recipe }) {
  const cols: [string, string | number][] = [
    ['Time', recipe.time],
    ['Serves', recipe.serves],
    ['Level', recipe.difficulty],
    ['Rating', recipe.ratingCount > 0 ? `${recipe.rating} ★` : '—'],
  ];

  return (
    <div className="my-3.5 grid grid-cols-4 border-y border-dashed border-rule">
      {cols.map(([k, v], i) => (
        <div
          key={k}
          className={`px-1 py-2.5 text-center ${i < cols.length - 1 ? 'border-r border-dashed border-rule' : ''}`}
        >
          <div className="mb-[3px] font-display text-[9px] font-bold uppercase tracking-wide text-ink">
            {k}
          </div>
          <div className="font-mono text-[12px] text-ink">{v}</div>
        </div>
      ))}
    </div>
  );
}
