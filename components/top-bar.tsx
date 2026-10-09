import type { ReactNode } from 'react';
import { BackButton } from '@/components/back-button';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  trailing?: ReactNode;
  backHref?: string;
  onBack?: () => void;
}

// App header — screen title, plus a trailing action slot. Three equal
// columns rather than a flex row, so the title sits dead-center on the
// page regardless of whether a back button or trailing action is present
// on either side, instead of centering only between whatever's there.
export function TopBar({ title, subtitle, trailing, backHref, onBack }: TopBarProps) {
  return (
    <div className="grid min-h-[67px] flex-shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 px-5 pb-3.5 pt-6">
      <div className="flex justify-start">
        {(backHref || onBack) && (
          <span className="print:hidden">
            <BackButton fallbackHref={backHref ?? '/'} onBack={onBack} />
          </span>
        )}
      </div>
      <div className="min-w-0 text-center">
        {title && (
          <h2 className="truncate font-display text-[18px] font-bold leading-[1.35] tracking-[-0.005em] text-ink">
            {title}
          </h2>
        )}
        {subtitle && (
          <div className="mt-0.5 truncate font-mono text-meta text-ink-mute">{subtitle}</div>
        )}
      </div>
      <div className="flex justify-end">
        {trailing && <div className="flex gap-1.5 print:hidden">{trailing}</div>}
      </div>
    </div>
  );
}
