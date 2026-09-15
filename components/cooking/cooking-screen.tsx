'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BackIcon, ChevronIcon, XIcon } from '@/components/icons';
import type { Recipe } from '@/lib/types';

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

// Full-screen, hands-free step-by-step cooking. Dark indigo, no tab bar —
// this route lives outside the (tabs) group.
export function CookingScreen({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const current = recipe.steps[step];
  const total = recipe.steps.length;
  const progress = ((step + 1) / total) * 100;
  const allIngredients = recipe.ingredients.flatMap((section) => section.items);

  useEffect(() => {
    if (!timerActive || timeLeft === null) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => (t !== null ? t - 1 : t)), 1000);
    return () => clearTimeout(id);
  }, [timerActive, timeLeft]);

  const exit = () => router.push(`/recipe/${recipe.id}`);

  const startTimer = () => {
    if (!current.timer) return;
    setTimeLeft(current.timer * 60);
    setTimerActive(true);
  };

  const goNext = () => {
    if (step < total - 1) {
      setStep((s) => s + 1);
      setTimerActive(false);
      setTimeLeft(null);
    } else {
      exit();
    }
  };

  const goPrev = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
    setTimerActive(false);
    setTimeLeft(null);
  };

  return (
    <div className="flex flex-1 flex-col bg-ink font-mono text-cream">
      <div className="flex items-center gap-2.5 px-5 pt-6">
        <button
          type="button"
          onClick={exit}
          aria-label="Close"
          className="flex items-center rounded-button border border-cream/25 px-2.5 py-1.5"
        >
          <XIcon size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-px font-mono text-[10px] uppercase tracking-wide text-cream/45">
            Now cooking
          </div>
          <div className="truncate font-display text-[14px] font-bold text-cream/80">
            {recipe.title}
          </div>
        </div>
        <div className="flex-shrink-0 font-mono text-[12px] text-cream/40">
          {step + 1}/{total}
        </div>
      </div>

      <div className="mx-5 mt-3.5 h-0.5 bg-cream/10">
        <div
          className="h-full bg-cream transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-4 pt-7">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-cream/35">
          Step {String(step + 1).padStart(2, '0')}
        </div>

        <div className="mb-[18px] text-balance font-display text-cook-step font-bold text-cream">
          {current.t}
        </div>

        <div className="mb-6 font-mono text-[14px] leading-[1.65] text-cream/65">{current.d}</div>

        {current.timer && (
          <div className="mb-5 flex items-center gap-4 border border-cream/[0.18] px-5 py-4">
            <div className="flex-1">
              <div
                className={`font-mono text-[32px] font-semibold leading-none tracking-tight ${
                  timerActive ? 'text-cream' : 'text-cream/50'
                }`}
              >
                {timeLeft !== null ? formatTime(timeLeft) : `${String(current.timer).padStart(2, '0')}:00`}
              </div>
              <div className="mt-[3px] font-mono text-[10px] text-cream/35">
                {timerActive ? 'running' : 'timer'}
              </div>
            </div>
            {!timerActive ? (
              <button
                type="button"
                onClick={startTimer}
                className="rounded-button border border-cream px-4 py-2 font-mono text-[12px] text-cream"
              >
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTimerActive(false)}
                className="rounded-button border border-cream/30 px-4 py-2 font-mono text-[12px] text-cream/60"
              >
                Pause
              </button>
            )}
          </div>
        )}

        {step === 0 && allIngredients.length > 0 && (
          <div className="mt-auto border border-dashed border-cream/15 px-3.5 py-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-cream/35">
              You&rsquo;ll need
            </div>
            {allIngredients.slice(0, 4).map((item, i) => (
              <div key={i} className="flex gap-2.5 py-1 font-mono text-[12px]">
                <span className="w-[60px] flex-shrink-0 text-cream/35">{item.q}</span>
                <span className="text-cream/70">{item.i}</span>
              </div>
            ))}
            {allIngredients.length > 4 && (
              <div className="mt-1 font-mono text-[11px] text-cream/30">
                + {allIngredients.length - 4} more
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 gap-2.5 border-t border-cream/[0.08] px-5 pb-8 pt-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={step === 0}
          aria-label="Previous step"
          className={`flex items-center rounded-lg border border-cream/20 px-[18px] py-[13px] ${
            step === 0 ? 'cursor-default opacity-25' : 'cursor-pointer opacity-100'
          }`}
        >
          <BackIcon size={16} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-cream bg-cream py-[13px] font-mono text-[13px] font-semibold text-ink"
        >
          {step < total - 1 ? 'Next step' : 'Done'}
          <ChevronIcon size={16} weight={2} />
        </button>
      </div>
    </div>
  );
}
