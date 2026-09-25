'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/checkbox';
import { Label } from '@/components/label';
import { suggestSubstitution, type DietMode } from '@/lib/diet-substitutions';
import { scaleIngredientText, type UnitSystem } from '@/lib/ingredient-scaling';
import type { IngredientSection } from '@/lib/types';
import { getUnitsPreference } from '@/lib/units-preference';

const UNIT_OPTIONS: { id: UnitSystem; label: string }[] = [
  { id: 'original', label: 'As written' },
  { id: 'metric', label: 'Metric' },
  { id: 'imperial', label: 'Imperial' },
];

const DIET_OPTIONS: { id: DietMode; label: string }[] = [
  { id: 'original', label: 'As written' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
];

// Scaling, unit conversion, and diet substitutions only ever touch the
// displayed text — never the stored recipe. All three reset to "as
// published" every time you open the recipe again; only the units default
// (Settings > Units) carries over.
export function IngredientsBlock({ sections, servings }: { sections: IngredientSection[]; servings: number }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [targetServings, setTargetServings] = useState(servings);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('original');
  const [dietMode, setDietMode] = useState<DietMode>('original');

  useEffect(() => {
    setUnitSystem(getUnitsPreference());
  }, []);

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));
  const scale = servings > 0 ? targetServings / servings : 1;
  const needsRewrite = scale !== 1 || unitSystem !== 'original';

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between">
        <Label>Ingredients</Label>
        {servings > 0 && (
          <div className="flex items-center gap-1.5 print:hidden">
            <button
              type="button"
              onClick={() => setTargetServings((s) => Math.max(1, s - 1))}
              aria-label="Fewer servings"
              className="flex h-5 w-5 items-center justify-center rounded border border-ink font-mono text-[13px] leading-none text-ink"
            >
              −
            </button>
            <span className="font-mono text-[11px] text-ink-mute">Serves {targetServings}</span>
            <button
              type="button"
              onClick={() => setTargetServings((s) => s + 1)}
              aria-label="More servings"
              className="flex h-5 w-5 items-center justify-center rounded border border-ink font-mono text-[13px] leading-none text-ink"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="mb-2 flex gap-1 print:hidden">
        {UNIT_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setUnitSystem(o.id)}
            className={`rounded border border-ink px-2 py-[3px] font-mono text-[10.5px] ${
              unitSystem === o.id ? 'bg-ink text-cream' : 'bg-transparent text-ink'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex gap-1 print:hidden">
        {DIET_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setDietMode(o.id)}
            className={`rounded border px-2 py-[3px] font-mono text-[10.5px] ${
              dietMode === o.id ? 'border-accent-2 bg-accent-2 text-cream' : 'border-accent-2 text-accent-2'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {dietMode !== 'original' && (
        <div className="mb-3 font-mono text-[10.5px] leading-snug text-ink-mute print:hidden">
          Suggested swaps only — you may need to adjust cook time or technique for what you use instead.
        </div>
      )}

      {sections.map((section, si) => (
        <div key={si} className="mb-3">
          {section.section && (
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-mute">
              {section.section}
            </div>
          )}
          {section.items.map((item, i) => {
            const key = `${si}-${i}`;
            const done = !!checked[key];
            const noTopBorder = i === 0 && !section.section;
            const displayQuantity = needsRewrite ? scaleIngredientText(item.q, scale, unitSystem) : item.q;
            const suggestion = suggestSubstitution(item.i, dietMode);
            return (
              <div
                key={i}
                onClick={() => toggle(key)}
                className={`flex cursor-pointer items-start gap-2 py-1.5 transition-opacity ${
                  noTopBorder ? '' : 'border-t border-dotted border-rule'
                } ${done ? 'opacity-40' : 'opacity-100'}`}
              >
                <Checkbox checked={done} className="mt-0.5" />
                <span className="w-20 flex-shrink-0 font-mono text-[11px] leading-snug text-ink-mute">
                  {displayQuantity}
                </span>
                <div className="min-w-0 flex-1">
                  <span
                    className={`break-words font-mono text-[12px] leading-snug text-ink ${done ? 'line-through' : ''}`}
                  >
                    {item.i}
                  </span>
                  {suggestion && (
                    <div className="mt-0.5 break-words font-mono text-[10.5px] leading-snug text-accent-2">
                      → try {suggestion}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
