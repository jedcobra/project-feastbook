'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/checkbox';
import { OnboardStep } from '@/components/onboarding/onboard-step';

const ROWS: { key: string; label: string; sub: string }[] = [
  { key: 'notes', label: 'Someone notes on your recipe', sub: 'Including answers to your questions' },
  { key: 'follows', label: 'Someone follows you', sub: '' },
  { key: 'cooked', label: 'Someone cooks your recipe', sub: 'Can get busy if a recipe takes off' },
  { key: 'digest', label: 'Weekly: what your people cooked', sub: 'One message, Sunday morning' },
];

// Step 4 of 4 — preferences only; there's no notifications table yet
// (that's a later phase), so this doesn't persist anything server-side.
export function NotifyStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [on, setOn] = useState<Record<string, boolean>>({ notes: true, follows: true, cooked: false, digest: false });

  return (
    <OnboardStep
      step={3}
      total={4}
      title="What's worth interrupting you for?"
      blurb="Pick now, change any time in settings. We'll only ask the phone for permission if you say yes to something."
      cta="Done — take me in"
      onNext={onNext}
      onSkip={onSkip}
      skipLabel="None of it"
    >
      <div className="pb-5">
        {ROWS.map((row) => (
          <button
            key={row.key}
            type="button"
            onClick={() => setOn((o) => ({ ...o, [row.key]: !o[row.key] }))}
            className="flex w-full items-start gap-2.5 border-t border-dashed border-rule py-3 text-left"
          >
            <Checkbox checked={!!on[row.key]} className="mt-0.5" />
            <span className="flex-1">
              <span className="block font-mono text-[12.5px] text-ink">{row.label}</span>
              {row.sub && <span className="mt-0.5 block font-mono text-[10.5px] text-ink-mute">{row.sub}</span>}
            </span>
          </button>
        ))}
      </div>
    </OnboardStep>
  );
}
