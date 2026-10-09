'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Order matches the tab bar left to right, so a swipe moves the same
// direction as the tab it would land on.
const MAIN_ROUTES = ['/feed', '/discover', '/new', '/messages', '/me'];

const SWIPE_THRESHOLD = 60;
const DIRECTION_RATIO = 1.5;

// Swipe left/right to step between the five tab roots — but only there.
// A subsection (an open recipe, a thread, settings) keeps its own gestures,
// SwipeableRow's archive/delete drag chief among them, so this only arms
// on an exact match against MAIN_ROUTES, and backs off entirely when the
// gesture started inside a SwipeableRow (marked with data-swipe-row).
export function SectionSwipeNav() {
  const pathname = usePathname();
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);
  const ignore = useRef(false);

  useEffect(() => {
    const index = MAIN_ROUTES.indexOf(pathname);
    if (index === -1) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      ignore.current = !!target?.closest('[data-swipe-row]');
      const touch = e.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const origin = start.current;
      start.current = null;
      if (!origin || ignore.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * DIRECTION_RATIO) return;

      const nextIndex = dx < 0 ? index + 1 : index - 1;
      if (nextIndex < 0 || nextIndex >= MAIN_ROUTES.length) return;
      router.push(MAIN_ROUTES[nextIndex]);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pathname, router]);

  return null;
}
