import type { ReactNode } from 'react';

interface OnboardStepProps {
  step: number;
  total: number;
  title: string;
  blurb: string;
  children: ReactNode;
  cta: string;
  ctaDisabled?: boolean;
  onNext: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}

// Shared step chrome for the four-step post-signup flow: segmented
// progress, a big serif question, then whatever field the step needs.
export function OnboardStep({
  step,
  total,
  title,
  blurb,
  children,
  cta,
  ctaDisabled,
  onNext,
  onSkip,
  skipLabel = 'Skip',
}: OnboardStepProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pt-[58px]">
        <div className="mb-[18px] flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-0.5 flex-1 ${i <= step ? 'bg-ink' : 'bg-rule-soft'}`} />
          ))}
        </div>
        <div className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-mute">
          Step {step + 1} of {total}
        </div>
        <h1 className="text-balance mb-2 font-display text-[27px] font-bold leading-[1.1] text-ink">{title}</h1>
        <div className="mb-[18px] font-mono text-[12.5px] leading-[1.6] text-ink-mute">{blurb}</div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5">{children}</div>
      <div className="flex-shrink-0 border-t border-dashed border-rule px-5 pb-[26px] pt-3.5">
        <button
          type="button"
          onClick={onNext}
          disabled={ctaDisabled}
          className={`w-full rounded-button border border-ink py-3.5 font-mono text-[13px] font-semibold ${
            ctaDisabled ? 'bg-transparent text-ink-mute opacity-45' : 'bg-ink text-cream'
          } ${onSkip ? 'mb-2.5' : ''}`}
        >
          {cta}
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} className="w-full text-center font-mono text-[12px] text-ink-mute">
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
