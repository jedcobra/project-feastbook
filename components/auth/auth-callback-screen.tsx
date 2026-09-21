'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase/client';

// Where a signup confirmation email's link lands. Supabase verifies the
// token itself and redirects here with a fresh session tucked in the URL —
// the browser client picks it up automatically (detectSessionInUrl). That
// session is only proof the link was valid, not something to act on: this
// page drops it right away and points the person at the real sign-in form,
// rather than quietly logging them in. If the session never shows up (an
// expired or already-used link), it says so instead of hanging forever.
export function AuthCallbackScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'failed'>('waiting');

  useEffect(() => {
    const id = setTimeout(() => setStatus((s) => (s === 'waiting' ? 'failed' : s)), 6000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.auth.signOut().then(() => setStatus('confirmed'));
  }, [user]);

  if (status === 'failed') {
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

  if (status === 'confirmed') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[13px] leading-relaxed text-ink-mute">
          Your email is confirmed. Sign in to get started.
        </p>
        <Link
          href="/account/sign-in"
          className="rounded-button border border-ink bg-ink px-5 py-2.5 font-mono text-[13px] font-semibold text-cream"
        >
          Sign in
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
