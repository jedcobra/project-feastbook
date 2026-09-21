'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

// The whole app is signed-in only, with two exceptions: a shared recipe
// link (/r/[id]) is meant to be readable by anyone, no account required —
// that's the whole point of a public share page — and the auth callbacks
// under /auth/ (email confirmation, OAuth sign-in), which have to run
// before a session exists yet are the thing that creates one. Everything
// else still sends a signed-out visitor to the Landing screen and keeps
// them there.
export function AuthGate() {
  const { loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const exempt = pathname.startsWith('/account') || pathname.startsWith('/r/') || pathname.startsWith('/auth/');

  useEffect(() => {
    if (!loading && !user && !exempt) {
      router.replace('/account');
    }
  }, [loading, user, exempt, router]);

  return null;
}
