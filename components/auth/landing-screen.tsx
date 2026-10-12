'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { InstallHint } from '@/components/auth/install-hint';

// The title page of the book — no chrome, no back button, just the
// wordmark and the two ways in. It's a fixed card: in a phone's browser the
// page underneath can't be scrolled, dragged or bounced while it's up
// (html.scroll-locked in globals.css), and the screen itself takes no pan
// gestures — taps still work.
export function LandingScreen() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('scroll-locked');
    return () => root.classList.remove('scroll-locked');
  }, []);

  return (
    <div className="flex min-h-0 flex-1 touch-none flex-col overscroll-none">
      <div className="flex flex-1 items-center justify-center p-5 pt-[calc(1.25rem+var(--safe-top))]">
        <div className="text-center font-display text-[60px] font-bold leading-[0.9] text-ink">
          Special
          <br />
          Spoon
        </div>
      </div>
      <InstallHint />
      <div className="flex flex-col gap-2.5 px-5 pb-[34px]">
        <Link
          href="/account/sign-up"
          className="w-full rounded-button border border-ink bg-ink py-3.5 text-center font-mono text-[14px] font-semibold text-cream"
        >
          Create an account
        </Link>
        <Link
          href="/account/sign-in"
          className="w-full rounded-button border border-ink bg-transparent py-3.5 text-center font-mono text-[14px] font-semibold text-ink"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
