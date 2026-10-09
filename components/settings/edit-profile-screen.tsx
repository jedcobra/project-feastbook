'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar } from '@/components/avatar';
import { Field } from '@/components/create/field';
import { CameraIcon } from '@/components/icons';
import { AvatarCropper } from '@/components/settings/avatar-cropper';
import { TopBar } from '@/components/top-bar';
import { checkHandleAvailable, updateProfile } from '@/lib/supabase/queries';
import { uploadPhoto } from '@/lib/supabase/storage';

// Edit profile — photo, name, handle, bio, link.
export function EditProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(profile?.name ?? '');
  const [handle, setHandle] = useState(profile?.handle ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [link, setLink] = useState(profile?.link ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const touch = <T,>(fn: (v: T) => void) => (v: T) => {
    setDirty(true);
    setError(null);
    fn(v);
  };

  if (!profile) return null;

  const handleAvatarFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setAvatarUploading(true);
    const result = await uploadPhoto(profile.id, file, 'avatar');
    setAvatarUploading(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setAvatarUrl(result.url);
    setDirty(true);
  };

  const handleCropped = (blob: Blob) => {
    setPendingFile(null);
    void handleAvatarFile(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
  };

  const handleSave = async () => {
    const trimmedHandle = handle.trim().replace(/^@/, '').toLowerCase();
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
      avatarUrl,
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
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            aria-label="Change profile photo"
            className="relative flex-shrink-0 disabled:opacity-60"
          >
            <Avatar name={name || profile.name} src={avatarUrl || undefined} size={58} />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-ink bg-cream text-ink">
              <CameraIcon size={11} />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10.5px] leading-[1.5] text-ink-mute">
              {avatarUploading ? 'Uploading…' : 'Tap to change your photo.'}
            </div>
            {avatarUrl && !avatarUploading && (
              <button
                type="button"
                onClick={() => {
                  setAvatarUrl('');
                  setDirty(true);
                }}
                className="mt-1 font-mono text-[10.5px] text-ink-mute underline decoration-dashed underline-offset-2"
              >
                Remove photo
              </button>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              setPendingFile(e.target.files?.[0] ?? null);
              e.target.value = '';
            }}
          />
        </div>
        {error && <div className="mb-3.5 font-mono text-[11.5px] text-accent">{error}</div>}
        <Field label="Name" value={name} onChange={touch(setName)} mono={false} size={20} />
        <Field
          label="Handle"
          value={handle}
          onChange={touch((v: string) => setHandle(v.toLowerCase()))}
          hint={`specialspoon.app/@${handle || 'you'}`}
        />
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
      {pendingFile && (
        <AvatarCropper file={pendingFile} onCancel={() => setPendingFile(null)} onCropped={handleCropped} />
      )}
    </>
  );
}
