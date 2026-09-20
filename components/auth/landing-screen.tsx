'use client';

import Link from 'next/link';

// The title page of the book — no chrome, no back button, just the
// wordmark and the two ways in.
export function LandingScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center p-5">
        <div className="text-center font-display text-[44px] font-bold leading-[1.05] text-ink">
          Special
          <br />
          Spoon
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-5 pb-[34px]">
        <Link
          href="/account/sign-up"
          className="w-full rounded-button border border-ink bg-ink py-3.5 text-center font-mono text-[13px] font-semibold text-cream"
        >
          Create an account
        </Link>
        <Link
          href="/account/sign-in"
          className="w-full rounded-button border border-ink bg-transparent py-3.5 text-center font-mono text-[13px] font-semibold text-ink"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
