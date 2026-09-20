'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

// Onboarding runs once after signup and blocks everything else (per the
// design handoff) — any signed-in profile without onboarded_at gets bounced
// there from anywhere in the tabs. A signed-out visitor is left alone.
export function OnboardingGate() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (profile && !profile.onboarded_at && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [profile, pathname, router]);

  return null;
}
