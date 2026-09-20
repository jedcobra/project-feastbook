'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

// The whole app is signed-in only. Anyone without a session gets sent to
// the Landing screen and kept there — including after signing out — until
// they sign in or create an account.
export function AuthGate() {
  const { loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/account')) {
      router.replace('/account');
    }
  }, [loading, user, pathname, router]);

  return null;
}
