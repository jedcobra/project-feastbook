'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

// Where Google/Facebook sign-in redirects back to. Unlike the email
// confirmation callback, the whole point here is to land signed in —
// Supabase hands back a session in the URL (detectSessionInUrl picks it
// up automatically) and this just waits for it, then forwards on like any
// other successful sign-in. Waits for the profile too, not just the
// session — deciding "onboarded or not" from a still-null profile would
// send a returning user through onboarding again every time.
export function OAuthCallbackScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (user && profile) router.replace(profile.onboarded_at ? '/feed' : '/onboarding');
  }, [user, profile, router]);

  if (timedOut && !user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[13px] leading-relaxed text-ink-mute">
          That didn&rsquo;t go through — try signing in again.
        </p>
        <Link
          href="/account"
          className="rounded-button border border-ink bg-ink px-5 py-2.5 font-mono text-[13px] font-semibold text-cream"
        >
          Back to Special Spoon
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
      <p className="font-mono text-[13px] text-ink-mute">Signing you in…</p>
    </div>
  );
}
