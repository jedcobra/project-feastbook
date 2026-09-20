'use client';

import { CameraIcon, ChevronIcon, LinkIcon, PencilIcon } from '@/components/icons';
import { OnboardStep } from '@/components/onboarding/onboard-step';
import type { DraftSource } from '@/lib/recipe-draft';

const WAYS: { icon: typeof LinkIcon; label: string; sub: string; source: DraftSource }[] = [
  { icon: LinkIcon, label: 'Paste a link', sub: 'From any recipe site. We pull out the parts.', source: 'link' },
  { icon: CameraIcon, label: 'Photograph a card', sub: 'Handwritten, torn from a magazine, whatever it is.', source: 'photo' },
  { icon: PencilIcon, label: 'Type it out', sub: 'The one you know by heart.', source: 'manual' },
];

// Step 3 of 4 — picking a way in exits onboarding straight into the
// composer rather than making you finish the last step first.
export function FirstRecipeStep({
  onImport,
  onSkip,
}: {
  onImport: (source: DraftSource) => void;
  onSkip: () => void;
}) {
  return (
    <OnboardStep
      step={2}
      total={4}
      title="Put one recipe in"
      blurb="A cookbook with nothing in it is just a feed. Start with the thing you cooked last week."
      cta="Add it now"
      onNext={() => onImport('manual')}
      onSkip={onSkip}
      skipLabel="Not yet — take me to the feed"
    >
      <div className="pb-5">
        {WAYS.map((w, i) => (
          <button
            key={w.label}
            type="button"
            onClick={() => onImport(w.source)}
            className={`flex w-full items-center gap-3 border-t border-dashed border-rule py-3.5 text-left ${
              i === WAYS.length - 1 ? 'border-b' : ''
            }`}
          >
            <w.icon size={17} className="flex-shrink-0 text-ink" />
            <span className="min-w-0 flex-1">
              <span className="mb-px block font-display text-[14.5px] font-bold text-ink">{w.label}</span>
              <span className="block font-mono text-[10.5px] text-ink-mute">{w.sub}</span>
            </span>
            <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
          </button>
        ))}
      </div>
    </OnboardStep>
  );
}
