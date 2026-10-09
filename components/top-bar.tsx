import type { ReactNode } from 'react';
import { BackButton } from '@/components/back-button';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  trailing?: ReactNode;
  backHref?: string;
  onBack?: () => void;
}

// App header — screen title, plus a trailing action slot.
export function TopBar({ title, subtitle, trailing, backHref, onBack }: TopBarProps) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2.5 px-5 pb-3.5 pt-6">
      {(backHref || onBack) && (
        <span className="print:hidden">
          <BackButton fallbackHref={backHref ?? '/'} onBack={onBack} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title && <h2 className="font-display text-section font-bold text-ink">{title}</h2>}
        {subtitle && (
          <div className="mt-0.5 font-mono text-meta text-ink-mute">{subtitle}</div>
        )}
      </div>
      {trailing && <div className="flex gap-1.5 print:hidden">{trailing}</div>}
    </div>
  );
}
