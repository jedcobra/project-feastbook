import Link from 'next/link';
import type { ReactNode } from 'react';
import { BackIcon } from '@/components/icons';
import { outlineBoxClasses } from '@/components/outline-box';

interface TopBarProps {
  title?: string;
  trailing?: ReactNode;
  variant?: 'brand' | 'default';
  backHref?: string;
}

// App header — brand wordmark or screen title, plus a trailing action slot.
export function TopBar({ title, trailing, variant = 'default', backHref }: TopBarProps) {
  return (
    <div className="flex items-center gap-2.5 px-5 pb-3.5 pt-6">
      {backHref && (
        <Link href={backHref} aria-label="Back" className={outlineBoxClasses(true)}>
          <BackIcon size={14} weight={1.8} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {variant === 'brand' ? (
          <div className="font-display text-[26px] font-bold leading-none text-ink">
            Special Spoon
          </div>
        ) : (
          title && <h2 className="font-display text-section font-bold text-ink">{title}</h2>
        )}
      </div>
      {trailing && <div className="flex gap-1.5">{trailing}</div>}
    </div>
  );
}
