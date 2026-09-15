'use client';

import { useState } from 'react';
import { Label } from '@/components/label';
import type { IngredientSection } from '@/lib/types';

// Square outlined checkbox — tap to check off, ephemeral per-view state.
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-[13px] w-[13px] flex-shrink-0 items-center justify-center rounded-checkbox border-[1.2px] border-ink ${
        checked ? 'bg-ink' : 'bg-transparent'
      }`}
    >
      {checked && (
        <svg width={9} height={9} viewBox="0 0 10 10" fill="none" className="stroke-cream">
          <path d="M2 5l2 2 4-5" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export function IngredientsBlock({ sections }: { sections: IngredientSection[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div>
      <Label className="mb-2.5">Ingredients</Label>
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
            return (
              <div
                key={i}
                onClick={() => toggle(key)}
                className={`flex cursor-pointer items-start gap-2 py-1.5 transition-opacity ${
                  noTopBorder ? '' : 'border-t border-dotted border-rule'
                } ${done ? 'opacity-40' : 'opacity-100'}`}
              >
                <Checkbox checked={done} />
                <span className="w-16 flex-shrink-0 font-mono text-[11px] leading-snug text-ink-mute">
                  {item.q}
                </span>
                <span
                  className={`flex-1 font-mono text-[12px] leading-snug text-ink ${
                    done ? 'line-through' : ''
                  }`}
                >
                  {item.i}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
