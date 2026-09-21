'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Label } from '@/components/label';
import { SettingRow } from '@/components/settings/setting-row';
import { TopBar } from '@/components/top-bar';
import { downloadTextFile, formatCookbookExport } from '@/lib/export';
import { supabase } from '@/lib/supabase/client';
import { deleteAccount, fetchAccountDeleteImpact, fetchMyRecipesFull } from '@/lib/supabase/queries';

// Account — email (read-only; changing it needs a reconfirmation flow this
// app doesn't have), a real password change, real data export, and real
// account deletion. No "Connected accounts" row: Google and Facebook
// sign-in are real (see components/auth/provider-button.tsx), but nothing
// here yet lets someone link one to an account they made with a password,
// or see which one they used — Apple stays decorative (needs a paid
// developer account for Sign in with Apple).
export function AccountScreen() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordDone, setPasswordDone] = useState(false);

  const [exporting, setExporting] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [impact, setImpact] = useState<{ recipes: number; shelves: number; comments: number; saves: number } | null>(
    null,
  );
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!profile || !user) return null;

  const savePassword = async () => {
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError('At least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords don’t match.');
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPasswordDone(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setChangingPassword(false);
      setPasswordDone(false);
    }, 1200);
  };

  const handleExport = async () => {
    setExporting(true);
    const recipes = await fetchMyRecipesFull(profile.id);
    const text = formatCookbookExport(profile.name, recipes);
    downloadTextFile(`${profile.handle}-cookbook.txt`, text);
    setExporting(false);
  };

  const startDelete = async () => {
    setConfirmingDelete(true);
    setImpact(await fetchAccountDeleteImpact(profile.id));
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const ok = await deleteAccount(profile.id);
    if (ok) {
      await signOut();
    } else {
      setDeleting(false);
    }
  };

  return (
    <>
      <TopBar title="Account" backHref="/settings" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-9">
        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">Sign in</Label>
          <SettingRow label="Email" value={user.email ?? ''} first />
          {!changingPassword ? (
            <SettingRow label="Password" value="Change" onClick={() => setChangingPassword(true)} />
          ) : (
            <div className="border-b border-dashed border-rule py-3">
              <div className="mb-2 font-mono text-[12.5px] text-ink">Change password</div>
              {passwordDone ? (
                <div className="font-mono text-[11.5px] text-ink-mute">Password changed.</div>
              ) : (
                <>
                  {passwordError && <div className="mb-2 font-mono text-[11px] text-accent">{passwordError}</div>}
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="mb-2 w-full rounded-button border border-ink bg-cream-surface px-2.5 py-2 font-mono text-[12px] text-ink outline-none"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="mb-2.5 w-full rounded-button border border-ink bg-cream-surface px-2.5 py-2 font-mono text-[12px] text-ink outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false);
                        setPasswordError(null);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="flex-1 rounded-button border border-ink bg-transparent py-2 font-mono text-[12px] text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={savePassword}
                      disabled={passwordSaving}
                      className="flex-1 rounded-button border border-ink bg-ink py-2 font-mono text-[12px] text-cream disabled:opacity-60"
                    >
                      {passwordSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mb-[22px]">
          <Label className="mb-0.5 text-[9px] tracking-[0.12em]">Your writing</Label>
          <SettingRow label="Export everything" value={exporting ? 'Exporting…' : '.txt'} onClick={handleExport} first />
          <SettingRow label="Print your cookbook" value="Print" onClick={() => router.push('/settings/print')} />
          <div className="mt-2 font-mono text-[10.5px] leading-[1.55] text-ink-mute">
            Your recipes are yours. Export is plain text — no photos to include, and no account needed to read
            it.
          </div>
        </div>

        <div className="border border-accent p-3.5">
          <div className="mb-1.5 font-display text-[15px] font-bold text-accent">Delete your account</div>
          <div className="mb-3 font-mono text-[11.5px] leading-[1.55] text-ink">
            {impact
              ? `Deletes ${impact.recipes} recipe${impact.recipes === 1 ? '' : 's'}, ${impact.shelves} shelf${impact.shelves === 1 ? '' : 'es'}, and ${impact.comments} note${impact.comments === 1 ? '' : 's'} you’ve written. ${impact.saves} ${impact.saves === 1 ? 'person who' : 'people who'} saved your recipes will lose them. This can’t be undone — export first if you want a copy.`
              : 'Deletes your recipes, shelves, and everything you’ve written. This can’t be undone — export first if you want a copy.'}
          </div>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={startDelete}
              className="rounded-button border border-accent px-3 py-1.5 font-mono text-[12px] text-accent"
            >
              Delete account
            </button>
          ) : (
            <>
              <div className="mb-1.5 font-mono text-[11px] text-ink-mute">Type DELETE to confirm</div>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="mb-2.5 w-full rounded-button border border-ink bg-cream-surface px-2.5 py-2 font-mono text-[12px] text-ink outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setTyped('');
                  }}
                  className="flex-1 rounded-button border border-ink bg-transparent py-2 font-mono text-[12px] text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={typed !== 'DELETE' || deleting}
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-button border border-accent bg-accent py-2 font-mono text-[12px] text-cream disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete for good'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
