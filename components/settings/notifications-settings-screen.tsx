'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Checkbox } from '@/components/checkbox';
import { Label } from '@/components/label';
import { TopBar } from '@/components/top-bar';
import {
  getExistingSubscriptionEndpoint,
  getNotificationPermission,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push-subscribe';
import { deletePushSubscription, savePushSubscription, updateNotificationPrefs } from '@/lib/supabase/queries';
import type { NotificationPrefs } from '@/lib/supabase/types';

const ROWS: { key: keyof NotificationPrefs; label: string; sub: string }[] = [
  { key: 'notes', label: 'Someone notes on your recipe', sub: 'Including replies to your own notes' },
  { key: 'follows', label: 'Someone follows you', sub: '' },
  { key: 'messages', label: 'Someone sends you a message', sub: '' },
  { key: 'cooked', label: 'Someone cooks your recipe', sub: 'Can get busy if a recipe takes off' },
  { key: 'digest', label: 'Weekly: what your people cooked', sub: 'Not sent yet — saved for when it is' },
];

// The real settings screen the onboarding NotifyStep pointed at — "change
// any time in settings" now actually does something.
export function NotificationsSettingsScreen() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    getExistingSubscriptionEndpoint().then((endpoint) => setPushOn(!!endpoint));
  }, []);

  if (!profile) return null;

  const toggle = async (key: keyof NotificationPrefs) => {
    const next = { ...profile.notification_prefs, [key]: !profile.notification_prefs[key] };
    setSaving(true);
    await updateNotificationPrefs(profile.id, next);
    await refreshProfile();
    setSaving(false);
  };

  const togglePush = async () => {
    setPushError(null);
    setPushBusy(true);
    if (pushOn) {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await deletePushSubscription(endpoint);
      setPushOn(false);
    } else {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setPushError('Push isn’t set up on this server yet.');
      } else {
        const result = await subscribeToPush(vapidKey);
        if ('error' in result) {
          setPushError(result.error);
        } else {
          const ok = await savePushSubscription(profile.id, result);
          setPushOn(ok);
          if (!ok) setPushError('Couldn’t save that — try again.');
        }
      }
    }
    setPushBusy(false);
  };

  const permission = getNotificationPermission();
  const pushSupported = isPushSupported();

  return (
    <>
      <TopBar title="Notifications" backHref="/settings" subtitle={saving ? 'Saving…' : undefined} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <Label className="mb-0.5 mt-1 text-[11px] tracking-[0.12em]">On this device</Label>
        {pushSupported ? (
          <button
            type="button"
            onClick={togglePush}
            disabled={pushBusy || permission === 'denied'}
            className="flex w-full items-start gap-2.5 border-y border-dashed border-rule py-3 text-left disabled:opacity-60"
          >
            <Checkbox checked={pushOn} className="mt-0.5" />
            <span className="flex-1">
              <span className="block font-mono text-[14px] text-ink">Push notifications</span>
              <span className="mt-0.5 block font-mono text-[12px] text-ink-mute">
                {permission === 'denied'
                  ? 'Blocked — allow notifications for this site in your browser settings first.'
                  : pushBusy
                    ? 'Working…'
                    : 'A real notification from your browser or phone, even when Special Spoon isn’t open.'}
              </span>
              {pushError && <span className="mt-1 block font-mono text-[12px] text-accent">{pushError}</span>}
            </span>
          </button>
        ) : (
          <div className="border-y border-dashed border-rule py-3 font-mono text-[12px] text-ink-mute">
            Push notifications aren’t supported in this browser.
          </div>
        )}

        <Label className="mb-0.5 mt-5 text-[11px] tracking-[0.12em]">In the app</Label>
        {ROWS.map((row, i) => (
          <button
            key={row.key}
            type="button"
            onClick={() => toggle(row.key)}
            className={`flex w-full items-start gap-2.5 border-b border-dashed border-rule py-3 text-left ${
              i === 0 ? 'border-t' : ''
            }`}
          >
            <Checkbox checked={profile.notification_prefs[row.key]} className="mt-0.5" />
            <span className="flex-1">
              <span className="block font-mono text-[14px] text-ink">{row.label}</span>
              {row.sub && <span className="mt-0.5 block font-mono text-[12px] text-ink-mute">{row.sub}</span>}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
