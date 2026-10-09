'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Label } from '@/components/label';
import { SettingRow } from '@/components/settings/setting-row';
import { TopBar } from '@/components/top-bar';
import type { UnitSystem } from '@/lib/ingredient-scaling';
import { getKeepAwake, setKeepAwake } from '@/lib/keep-awake';
import { getServingsPreference, setServingsPreference } from '@/lib/servings-preference';
import { updateDefaultVisibility, updateWhoCanFollow } from '@/lib/supabase/queries';
import type { NotificationPrefs } from '@/lib/supabase/types';
import type { Visibility } from '@/lib/types';
import { getUnitsPreference, setUnitsPreference } from '@/lib/units-preference';
import { VISIBILITY_OPTIONS, visibilityLabel } from '@/lib/visibility';

const UNIT_LABEL: Record<UnitSystem, string> = { original: 'As written', metric: 'Metric', imperial: 'Imperial' };
const NEXT_UNIT: Record<UnitSystem, UnitSystem> = { original: 'metric', metric: 'imperial', imperial: 'original' };
const SERVINGS_OPTIONS = [2, 4, 6, 8];

function summarizePrefs(prefs: NotificationPrefs): string {
  const labels: [keyof NotificationPrefs, string][] = [
    ['notes', 'Notes'],
    ['follows', 'Follows'],
    ['messages', 'Messages'],
    ['cooked', 'Cooked'],
    ['digest', 'Digest'],
  ];
  const on = labels.filter(([k]) => prefs[k]).map(([, l]) => l);
  return on.length > 0 ? on.join(', ') : 'None';
}

// The Settings screen — plain rows, honest labels. Rows with no real
// backing (Terms/Privacy/Report with no real content behind them) show as
// fixed display rows rather than fake controls that don't do anything.
export function SettingsScreen() {
  const { profile, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [awake, setAwake] = useState(true);
  const [units, setUnits] = useState<UnitSystem>('original');
  const [servingsDefault, setServingsDefault] = useState<number | null>(null);
  const [visibilityPickerOpen, setVisibilityPickerOpen] = useState(false);
  const [servingsPickerOpen, setServingsPickerOpen] = useState(false);

  useEffect(() => {
    setAwake(getKeepAwake());
    setUnits(getUnitsPreference());
    setServingsDefault(getServingsPreference());
  }, []);

  const toggleAwake = () => {
    const next = !awake;
    setAwake(next);
    setKeepAwake(next);
  };

  const cycleUnits = () => {
    const next = NEXT_UNIT[units];
    setUnits(next);
    setUnitsPreference(next);
  };

  const chooseServingsDefault = (n: number | null) => {
    setServingsDefault(n);
    setServingsPreference(n);
    setServingsPickerOpen(false);
  };

  if (!profile) return null;

  const chooseDefaultVisibility = async (v: Visibility | null) => {
    setVisibilityPickerOpen(false);
    await updateDefaultVisibility(profile.id, v);
    await refreshProfile();
  };

  const toggleWhoCanFollow = async () => {
    const next = profile.who_can_follow === 'anyone' ? 'no_one' : 'anyone';
    await updateWhoCanFollow(profile.id, next);
    await refreshProfile();
  };

  return (
    <>
      <TopBar title="Settings" backHref="/me" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-9">
        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">You</Label>
          <SettingRow label="Account and password" onClick={() => router.push('/settings/account')} first />
          <SettingRow
            label="Who can follow you"
            value={profile.who_can_follow === 'anyone' ? 'Anyone' : 'No one'}
            onClick={toggleWhoCanFollow}
          />
        </div>

        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">Cooking</Label>
          <SettingRow label="Units" value={UNIT_LABEL[units]} onClick={cycleUnits} first />
          <SettingRow label="Keep screen awake while cooking" value={awake ? 'On' : 'Off'} onClick={toggleAwake} />
          <SettingRow
            label="Default servings"
            value={servingsDefault ? String(servingsDefault) : 'As written'}
            onClick={() => setServingsPickerOpen(true)}
          />
        </div>

        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">Publishing</Label>
          <SettingRow
            label="Default privacy for new recipes"
            value={profile.default_visibility ? visibilityLabel(profile.default_visibility) : 'Ask each time'}
            onClick={() => setVisibilityPickerOpen(true)}
            first
          />
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

      {visibilityPickerOpen && (
        <div
          className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30"
          onClick={() => setVisibilityPickerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
          >
            <h3 className="mb-3 font-display text-[17px] font-bold text-ink">Default privacy for new recipes</h3>
            <button
              type="button"
              onClick={() => chooseDefaultVisibility(null)}
              className="flex w-full items-start gap-2.5 py-[11px] text-left"
            >
              <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
                {!profile.default_visibility && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
              </span>
              <span className="flex-1">
                <span className="block font-mono text-[13px] font-semibold text-ink">Ask each time</span>
                <span className="block font-mono text-[11px] leading-snug text-ink-mute">
                  Choose who sees it every time you publish.
                </span>
              </span>
            </button>
            {VISIBILITY_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => chooseDefaultVisibility(o.id)}
                className="flex w-full items-start gap-2.5 border-t border-dotted border-rule py-[11px] text-left"
              >
                <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
                  {profile.default_visibility === o.id && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
                </span>
                <span className="flex-1">
                  <span className="block font-mono text-[13px] font-semibold text-ink">{o.title}</span>
                  <span className="block font-mono text-[11px] leading-snug text-ink-mute">{o.sub}</span>
                </span>
              </button>
            ))}
            <div className="mt-2 border-t border-dashed border-rule pt-2.5 font-mono text-[10.5px] leading-snug text-ink-mute">
              Still shown and changeable every time you publish — this just picks what starts selected.
            </div>
          </div>
        </div>
      )}

      {servingsPickerOpen && (
        <div
          className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30"
          onClick={() => setServingsPickerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
          >
            <h3 className="mb-3 font-display text-[17px] font-bold text-ink">Default servings</h3>
            <button
              type="button"
              onClick={() => chooseServingsDefault(null)}
              className="flex w-full items-start gap-2.5 py-[11px] text-left"
            >
              <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
                {!servingsDefault && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
              </span>
              <span className="flex-1">
                <span className="block font-mono text-[13px] font-semibold text-ink">As written</span>
                <span className="block font-mono text-[11px] leading-snug text-ink-mute">
                  Starts on whatever the recipe itself serves.
                </span>
              </span>
            </button>
            {SERVINGS_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => chooseServingsDefault(n)}
                className="flex w-full items-start gap-2.5 border-t border-dotted border-rule py-[11px] text-left"
              >
                <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
                  {servingsDefault === n && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
                </span>
                <span className="flex-1">
                  <span className="block font-mono text-[13px] font-semibold text-ink">{n}</span>
                </span>
              </button>
            ))}
            <div className="mt-2 border-t border-dashed border-rule pt-2.5 font-mono text-[10.5px] leading-snug text-ink-mute">
              Still shown and changeable on every recipe — this just picks what starts selected.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
