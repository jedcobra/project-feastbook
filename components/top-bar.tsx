'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { BackButton } from '@/components/back-button';
import { useGlassDistort } from '@/components/glass';

interface TopBarProps {
  title?: ReactNode;
  subtitle?: string;
  trailing?: ReactNode;
  backHref?: string;
  onBack?: () => void;
}

// App header — screen title, plus a trailing action slot. Three equal
// columns rather than a flex row, so the title sits dead-center on the
// page regardless of whether a back button or trailing action is present
// on either side, instead of centering only between whatever's there.
// It's a band of the same glass as the tab bar, laid over the top of the
// screen so the page scrolls on underneath it; its height goes into
// --topbar-h, which the page below uses to start clear of it (globals.css).
export function TopBar({ title, subtitle, trailing, backHref, onBack }: TopBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const distort = useGlassDistort();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty('--topbar-h', `${el.offsetHeight}px`));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-top-bar
      className={`glass-band absolute inset-x-0 top-0 z-10 grid min-h-[67px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 px-5 pb-3.5 pt-6 print:static ${
        distort ? 'glass-distort' : ''
      }`}
    >
      <div className="flex justify-start">
        {(backHref || onBack) && (
          <span className="print:hidden">
            <BackButton fallbackHref={backHref ?? '/'} onBack={onBack} />
          </span>
        )}
      </div>
      <div className="min-w-0 text-center">
        {title && (
          <h2 className="truncate font-display text-[24px] font-bold leading-[1.25] tracking-[-0.005em] text-ink">
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
