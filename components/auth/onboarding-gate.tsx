'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

// Onboarding runs once after signup and blocks everything else (per the
// design handoff) — any signed-in profile without onboarded_at gets bounced
// there from anywhere in the tabs. A signed-out visitor is left alone. The
// auth callbacks under /auth/ are exempt too — the email one briefly holds
// a session of its own before dropping it and shouldn't get yanked away
// mid-message, and the OAuth one decides where to send a signed-in user
// itself, including straight to /onboarding when that's the right call.
export function OnboardingGate() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const exempt = pathname === '/onboarding' || pathname.startsWith('/auth/');

  useEffect(() => {
    if (profile && !profile.onboarded_at && !exempt) {
      router.replace('/onboarding');
    }
  }, [profile, exempt, router]);

  return null;
}
