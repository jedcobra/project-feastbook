'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FirstRecipeStep } from '@/components/onboarding/first-recipe-step';
import { FollowStep } from '@/components/onboarding/follow-step';
import { NotifyStep } from '@/components/onboarding/notify-step';
import { PhotoBioStep } from '@/components/onboarding/photo-bio-step';
import { TasteStep } from '@/components/onboarding/taste-step';
import type { DraftSource } from '@/lib/recipe-draft';
import { completeOnboarding, updateNotificationPrefs, updateProfile } from '@/lib/supabase/queries';
import type { NotificationPrefs } from '@/lib/supabase/types';

// Five short screens between "account created" and the feed. Each one asks
// for something the app immediately uses. Runs once — the OnboardingGate
// only routes here when profile.onboarded_at is null.
export function OnboardingFlow() {
  const { loading, user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tastes, setTastes] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/account');
  }, [loading, user, router]);

  useEffect(() => {
    if (profile?.onboarded_at) router.replace('/feed');
  }, [profile, router]);

  const finish = async (redirectTo: string, notificationPrefs?: NotificationPrefs) => {
    if (profile) {
      if (avatarUrl || bio !== profile.bio) {
        await updateProfile(profile.id, {
          name: profile.name,
          handle: profile.handle,
          bio,
          link: profile.link,
          avatarUrl: avatarUrl || undefined,
        });
      }
      await completeOnboarding(profile.id, tastes);
      if (notificationPrefs) await updateNotificationPrefs(profile.id, notificationPrefs);
      await refreshProfile();
    }
    router.push(redirectTo);
  };

  const handleImport = (source: DraftSource) => {
    finish(`/new/edit?source=${source}`);
  };

  if (loading || !user || !profile || profile.onboarded_at) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
      </div>
    );
  }

  if (step === 0) {
    return (
      <PhotoBioStep
        profileId={profile.id}
        name={profile.name}
        bio={bio}
        avatarUrl={avatarUrl}
        onBioChange={setBio}
        onAvatarChange={setAvatarUrl}
        onNext={() => setStep(1)}
        onSkip={() => setStep(1)}
      />
    );
  }
  if (step === 1) {
    return <TasteStep picked={tastes} onChange={setTastes} onNext={() => setStep(2)} onSkip={() => setStep(2)} />;
  }
  if (step === 2) {
    return (
      <FollowStep profileId={profile.id} onNext={() => setStep(3)} onSkip={() => setStep(3)} />
    );
  }
  if (step === 3) {
    return <FirstRecipeStep onImport={handleImport} onSkip={() => setStep(4)} />;
  }
  return (
    <NotifyStep
      onNext={(prefs) => finish('/feed', prefs)}
      onSkip={(prefs) => finish('/feed', prefs)}
    />
  );
}
