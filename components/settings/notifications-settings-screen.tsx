'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Checkbox } from '@/components/checkbox';
import { TopBar } from '@/components/top-bar';
import { updateNotificationPrefs } from '@/lib/supabase/queries';
import type { NotificationPrefs } from '@/lib/supabase/types';

const ROWS: { key: keyof NotificationPrefs; label: string; sub: string }[] = [
  { key: 'notes', label: 'Someone notes on your recipe', sub: 'Including replies to your own notes' },
  { key: 'follows', label: 'Someone follows you', sub: '' },
  { key: 'cooked', label: 'Someone cooks your recipe', sub: 'Can get busy if a recipe takes off' },
  { key: 'digest', label: 'Weekly: what your people cooked', sub: 'Not sent yet — saved for when it is' },
];

// The real settings screen the onboarding NotifyStep pointed at — "change
// any time in settings" now actually does something.
export function NotificationsSettingsScreen() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const toggle = async (key: keyof NotificationPrefs) => {
    const next = { ...profile.notification_prefs, [key]: !profile.notification_prefs[key] };
    setSaving(true);
    await updateNotificationPrefs(profile.id, next);
    await refreshProfile();
    setSaving(false);
  };

  return (
    <>
      <TopBar title="Notifications" backHref="/settings" subtitle={saving ? 'Saving…' : undefined} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
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
              <span className="block font-mono text-[12.5px] text-ink">{row.label}</span>
              {row.sub && <span className="mt-0.5 block font-mono text-[10.5px] text-ink-mute">{row.sub}</span>}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
