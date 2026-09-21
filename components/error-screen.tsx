import Link from 'next/link';
import { BookIcon, TrashIcon, WarnIcon } from '@/components/icons';
import { TopBar } from '@/components/top-bar';

export type ErrorKind = 'offline' | 'server' | 'gone' | 'private';

const ICON = { offline: WarnIcon, server: WarnIcon, gone: TrashIcon, private: BookIcon };

const DEFAULTS: Record<ErrorKind, { title: string; body: string; cta: string }> = {
  offline: {
    title: 'No connection',
    body: 'You can still read anything you’ve opened before. New recipes will load when you’re back.',
    cta: 'Try again',
  },
  server: {
    title: 'Something broke on our end',
    body: 'Not your fault and not your data. Try again in a moment.',
    cta: 'Try again',
  },
  gone: {
    title: 'This recipe is gone',
    body: 'The person who wrote it deleted it, or the link is wrong.',
    cta: 'Back to feed',
  },
  private: {
    title: 'This one is private',
    body: 'The person who wrote it keeps it to themselves.',
    cta: 'Back to feed',
  },
};

interface ErrorScreenProps {
  kind: ErrorKind;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onRetry?: () => void;
  backHref?: string;
  onBack?: () => void;
  /** Skip the TopBar — the public share page has its own masthead. */
  bare?: boolean;
}

// One component, four honest variants — offline, a real server error, a
// deleted recipe, and one you don't have access to. Each says what
// happened and gives a real next step, never just "something went wrong."
export function ErrorScreen({
  kind,
  title,
  body,
  ctaLabel,
  ctaHref,
  onRetry,
  backHref,
  onBack,
  bare,
}: ErrorScreenProps) {
  const copy = DEFAULTS[kind];
  const Icon = ICON[kind];
  const label = ctaLabel ?? copy.cta;
  const buttonClasses =
    'mb-1 inline-block rounded-button border border-ink bg-ink px-[22px] py-3 font-mono text-[12.5px] font-semibold text-cream';

  return (
    <>
      {!bare && (backHref || onBack) && <TopBar backHref={backHref} onBack={onBack} />}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-7 pb-14 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-ink">
          <Icon size={20} className="text-ink" />
        </div>
        <h2 className="mb-2.5 text-balance font-display text-[24px] font-bold text-ink">{title ?? copy.title}</h2>
        <div className="mb-5 max-w-[270px] font-mono text-[12.5px] leading-[1.65] text-ink-mute">
          {body ?? copy.body}
        </div>
        {onRetry ? (
          <button type="button" onClick={onRetry} className={buttonClasses}>
            {label}
          </button>
        ) : (
          <Link href={ctaHref ?? '/feed'} className={buttonClasses}>
            {label}
          </Link>
        )}
      </div>
    </>
  );
}
