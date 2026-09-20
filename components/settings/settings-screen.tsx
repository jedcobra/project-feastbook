'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Label } from '@/components/label';
import { SettingRow } from '@/components/settings/setting-row';
import { TopBar } from '@/components/top-bar';
import { getKeepAwake, setKeepAwake } from '@/lib/keep-awake';
import type { NotificationPrefs } from '@/lib/supabase/types';

function summarizePrefs(prefs: NotificationPrefs): string {
  const labels: [keyof NotificationPrefs, string][] = [
    ['notes', 'Notes'],
    ['follows', 'Follows'],
    ['cooked', 'Cooked'],
    ['digest', 'Digest'],
  ];
  const on = labels.filter(([k]) => prefs[k]).map(([, l]) => l);
  return on.length > 0 ? on.join(', ') : 'None';
}

// The Settings screen — plain rows, honest labels. Rows with no real
// backing (who can follow you, units conversion, a default privacy that
// would contradict "ask each time", Terms/Privacy/Report with no real
// content behind them) show as fixed display rows rather than fake
// controls that don't do anything.
export function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [awake, setAwake] = useState(true);

  useEffect(() => {
    setAwake(getKeepAwake());
  }, []);

  const toggleAwake = () => {
    const next = !awake;
    setAwake(next);
    setKeepAwake(next);
  };

  if (!profile) return null;

  return (
    <>
      <TopBar title="Settings" backHref="/me" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-9">
        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">You</Label>
          <SettingRow label="Edit profile" value={`${profile.name} · @${profile.handle}`} onClick={() => router.push('/settings/profile')} first />
          <SettingRow label="Account and password" onClick={() => router.push('/settings/account')} />
          <SettingRow label="Who can follow you" value="Anyone" />
        </div>

        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">Cooking</Label>
          <SettingRow label="Units" value="As written" first />
          <SettingRow label="Keep screen awake while cooking" value={awake ? 'On' : 'Off'} onClick={toggleAwake} />
          <SettingRow label="Default servings" value="As written" />
        </div>

        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">Publishing</Label>
          <SettingRow label="Default privacy for new recipes" value="Ask each time" first />
          <SettingRow label="Notifications" value={summarizePrefs(profile.notification_prefs)} onClick={() => router.push('/settings/notifications')} />
        </div>

        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">About</Label>
          <SettingRow label="Version" value="1.0" first />
        </div>

        <div className="mb-[22px]">
          <SettingRow label="Sign out" onClick={signOut} first />
          <SettingRow label="Delete account" danger onClick={() => router.push('/settings/account')} />
        </div>

        <div className="text-center font-mono text-[10.5px] leading-[1.55] text-ink-mute">
          Special Spoon · made for people who cook the same eight things
        </div>
      </div>
    </>
  );
}
