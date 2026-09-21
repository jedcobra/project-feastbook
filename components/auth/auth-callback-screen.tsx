'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

// Where a signup confirmation email's link lands. Supabase verifies the
// token itself and redirects here with the new session tucked in the URL —
// the browser client picks it up automatically (detectSessionInUrl), so
// this page just waits for that to land and forwards on. If it never does
// (an expired or already-used link), it says so instead of hanging forever.
export function AuthCallbackScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (user) router.replace(profile?.onboarded_at ? '/feed' : '/onboarding');
  }, [user, profile, router]);

  if (timedOut && !user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[13px] leading-relaxed text-ink-mute">
          That confirmation link didn&rsquo;t go through — it may have expired or already been used.
        </p>
        <Link
          href="/account/sign-in"
          className="rounded-button border border-ink bg-ink px-5 py-2.5 font-mono text-[13px] font-semibold text-cream"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
      <p className="font-mono text-[13px] text-ink-mute">Confirming your email…</p>
    </div>
  );
}
