'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { Field } from '@/components/create/field';
import { TopBar } from '@/components/top-bar';
import { checkHandleAvailable, updateProfile } from '@/lib/supabase/queries';

// Edit profile — name, handle, bio, link. "Change monogram" has nothing to
// change to: there's no photography anywhere in this app, avatars are
// always the first letter of your name, so that row is a fixed statement
// of that fact rather than a button that pretends to do something.
export function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(profile?.name ?? '');
  const [handle, setHandle] = useState(profile?.handle ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [link, setLink] = useState(profile?.link ?? '');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const touch = <T,>(fn: (v: T) => void) => (v: T) => {
    setDirty(true);
    setError(null);
    fn(v);
  };

  if (!profile) return null;

  const handleSave = async () => {
    const trimmedHandle = handle.trim().replace(/^@/, '');
    if (!trimmedHandle) {
      setError('Handle can’t be empty.');
      return;
    }
    setSaving(true);
    const available = await checkHandleAvailable(trimmedHandle, profile.id);
    if (!available) {
      setSaving(false);
      setError('That handle is taken.');
      return;
    }
    const { error: saveError } = await updateProfile(profile.id, {
      name: name.trim() || profile.name,
      handle: trimmedHandle,
      bio,
      link,
    });
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    await refreshProfile();
    router.back();
  };

  return (
    <>
      <TopBar
        title="Edit profile"
        backHref="/settings"
        trailing={
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`rounded-button border border-ink px-3 py-1.5 font-mono text-[11.5px] ${
              dirty && !saving ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
            }`}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-5 flex items-center gap-3.5">
          <Avatar name={name || profile.name} size={58} />
          <div className="font-mono text-[10.5px] leading-[1.5] text-ink-mute">
            No photographs anywhere in Special Spoon — including here. Your monogram is the first letter of
            your name.
          </div>
        </div>
        {error && <div className="mb-3.5 font-mono text-[11.5px] text-accent">{error}</div>}
        <Field label="Name" value={name} onChange={touch(setName)} mono={false} size={20} />
        <Field label="Handle" value={handle} onChange={touch(setHandle)} hint={`specialspoon.app/@${handle || 'you'}`} />
        <Field
          label="Bio"
          value={bio}
          onChange={touch(setBio)}
          multiline
          rows={3}
          hint="One or two lines. What you cook, where you cook it."
        />
        <Field label="Link" value={link} onChange={touch(setLink)} placeholder="Optional" />
      </div>
    </>
  );
}
