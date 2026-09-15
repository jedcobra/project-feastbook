'use client';

import { useState } from 'react';
import { Label } from '@/components/label';
import { OutlineBox } from '@/components/outline-box';
import type { RecipeStep } from '@/lib/types';

export function MethodBlock({ steps }: { steps: RecipeStep[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <Label className="mb-2.5">Method</Label>
      {steps.map((step, i) => {
        const isActive = active === i;
        return (
          <div
            key={i}
            onClick={() => setActive(isActive ? null : i)}
            className="cursor-pointer border-t border-dashed border-rule py-3"
          >
            <div className="flex items-start gap-3">
              <span className="w-5 flex-shrink-0 pt-px font-mono text-meta text-ink-mute">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div
                  className={`font-display text-[16px] font-bold leading-tight text-ink ${
                    isActive ? 'mb-1.5' : ''
                  }`}
                >
                  {step.t}
                </div>
                {isActive && (
                  <div className="font-mono text-[12px] leading-relaxed text-ink-mute">
                    {step.d}
                  </div>
                )}
              </div>
              {step.timer && (
                <span className="flex-shrink-0 rounded-[3px] border border-accent px-[5px] py-0.5 font-mono text-[10px] text-accent">
                  {step.timer}m
                </span>
              )}
            </div>
            {isActive && step.timer && (
              <div className="ml-8 mt-2">
                <OutlineBox compact onClick={(e) => e.stopPropagation()}>
                  Start timer — {step.timer} min
                </OutlineBox>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
