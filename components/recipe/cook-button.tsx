import { CookIcon } from '@/components/icons';

// Cooking Mode isn't built yet — this stays a static call-to-action for now.
export function CookButton() {
  return (
    <div className="sticky bottom-0 z-10 border-t border-dashed border-rule bg-cream px-5 pb-5 pt-3">
      <button className="flex w-full items-center justify-center gap-2 rounded-button border border-ink bg-ink py-[13px] font-mono text-sm font-semibold tracking-wide text-cream">
        <CookIcon size={16} weight={2} />
        Start cooking
      </button>
    </div>
  );
}
