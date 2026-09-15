import Link from 'next/link';
import { CookIcon } from '@/components/icons';

const buttonClasses =
  'flex w-full items-center justify-center gap-2 rounded-button border py-[13px] font-mono text-sm font-semibold tracking-wide';

export function CookButton({ recipeId, hasSteps }: { recipeId: string; hasSteps: boolean }) {
  return (
    <div className="sticky bottom-0 z-10 flex-shrink-0 border-t border-dashed border-rule bg-cream px-5 pb-5 pt-3">
      {hasSteps ? (
        <Link href={`/cook/${recipeId}`} className={`${buttonClasses} border-ink bg-ink text-cream`}>
          <CookIcon size={16} weight={2} />
          Start cooking
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className={`${buttonClasses} cursor-not-allowed border-ink bg-ink text-cream opacity-40`}
        >
          <CookIcon size={16} weight={2} />
          Start cooking
        </button>
      )}
    </div>
  );
}
