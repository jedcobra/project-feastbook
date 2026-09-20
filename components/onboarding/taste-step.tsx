'use client';

import { OnboardStep } from '@/components/onboarding/onboard-step';

const TASTES = [
  'weeknight',
  'baking',
  'vegetarian',
  'one-pot',
  'slow cooking',
  'sourdough',
  'grilling',
  'preserves',
  'desserts',
  'south asian',
  'west african',
  'japanese',
  'italian',
  'mexican',
  'no dairy',
  'low effort',
];

// Step 1 of 4 — seeds Discover ranking later; the app never treats it as a
// gate on what you're allowed to save.
export function TasteStep({
  picked,
  onChange,
  onNext,
  onSkip,
}: {
  picked: string[];
  onChange: (picked: string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const toggle = (t: string) => onChange(picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t]);

  return (
    <OnboardStep
      step={0}
      total={4}
      title="What do you actually cook?"
      blurb="Pick a few. This decides what shows up in Discover — not what you're allowed to save."
      cta={picked.length < 3 ? `Pick ${3 - picked.length} more` : 'Continue'}
      ctaDisabled={picked.length < 3}
      onNext={onNext}
      onSkip={onSkip}
      skipLabel="I'll decide later"
    >
      <div className="flex flex-wrap gap-1.5 pb-5">
        {TASTES.map((t) => {
          const on = picked.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={`rounded border border-ink px-[11px] py-1.5 font-mono text-[12px] ${
                on ? 'bg-ink text-cream' : 'bg-transparent text-ink'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </OnboardStep>
  );
}
