'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { identify, initAnalytics, resetIdentity } from '@/lib/analytics';

// Starts analytics and keeps the signed-in person attached to it (and to
// Sentry's error reports), clearing both on sign-out.
export function AnalyticsProvider() {
  const { profile, user } = useAuth();
  const identifiedRef = useRef(false);

  useEffect(() => {
    void initAnalytics();
  }, []);

  useEffect(() => {
    if (profile) {
      identify(profile.id, { handle: profile.handle, name: profile.name });
      Sentry.setUser({ id: profile.id, username: profile.handle });
      identifiedRef.current = true;
    } else if (!user && identifiedRef.current) {
      resetIdentity();
      Sentry.setUser(null);
      identifiedRef.current = false;
    }
  }, [profile, user]);

  return null;
}
