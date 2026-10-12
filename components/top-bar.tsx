'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { BackButton } from '@/components/back-button';

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
// It belongs to the page: it sits at the top, and as the page scrolls down
// it scrolls away with it. It lies over the top of the screen (so it can
// move with the scrolling area right after it, which starts with a spacer
// of its height, --topbar-h — see globals.css) and follows that area's
// scroll position.
export function TopBar({ title, subtitle, trailing, backHref, onBack }: TopBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty('--topbar-h', `${el.offsetHeight}px`));
    observer.observe(el);
    // Scroll events don't bubble, so catch them on the way down, from
    // whichever scrolling area currently follows the bar.
    const onScroll = (e: Event) => {
      if (e.target === el.nextElementSibling) {
        el.style.transform = `translateY(${-(e.target as HTMLElement).scrollTop}px)`;
      }
    };
    parent.addEventListener('scroll', onScroll, true);
    return () => {
      observer.disconnect();
      parent.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-top-bar
      className="absolute inset-x-0 top-0 z-10 grid min-h-[67px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 bg-cream px-5 pb-3.5 pt-[calc(1.5rem+var(--safe-top))] print:static"
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
