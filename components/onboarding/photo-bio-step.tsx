'use client';

import { useRef, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { Field } from '@/components/create/field';
import { CameraIcon } from '@/components/icons';
import { OnboardStep } from '@/components/onboarding/onboard-step';
import { AvatarCropper } from '@/components/settings/avatar-cropper';
import { uploadPhoto } from '@/lib/supabase/storage';

// Step 1 of 5 — a face and a line of bio before anything else, so a brand
// new profile isn't just a blank monogram circle the moment someone else
// looks at it. Both persist on Next *or* Skip (the caller writes whatever's
// in state either way) — this step only ever collects it.
export function PhotoBioStep({
  profileId,
  name,
  bio,
  avatarUrl,
  onBioChange,
  onAvatarChange,
  onNext,
  onSkip,
}: {
  profileId: string;
  name: string;
  bio: string;
  avatarUrl: string;
  onBioChange: (bio: string) => void;
  onAvatarChange: (url: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    const result = await uploadPhoto(profileId, file, 'avatar');
    setUploading(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    onAvatarChange(result.url);
  };

  const handleCropped = (blob: Blob) => {
    setPendingFile(null);
    void handleFile(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
  };

  return (
    <>
      <OnboardStep
        step={0}
        total={5}
        title="Put a face to the name"
        blurb="A photo and a line about you — optional, but it's the first thing people see."
        cta="Continue"
        onNext={onNext}
        onSkip={onSkip}
        skipLabel="I'll do this later"
      >
        <div className="pb-5">
          <div className="mb-5 flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-label="Add a profile photo"
              className="relative flex-shrink-0 disabled:opacity-60"
            >
              <Avatar name={name} src={avatarUrl || undefined} size={58} />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-ink bg-cream text-ink">
                <CameraIcon size={11} />
              </span>
            </button>
            <div className="min-w-0 flex-1 font-mono text-[10.5px] leading-[1.5] text-ink-mute">
              {uploading ? 'Uploading…' : 'Tap to add a photo.'}
            </div>
            <input
              ref={inputRef}
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
          <Field
            label="Bio"
            value={bio}
            onChange={onBioChange}
            multiline
            rows={3}
            hint="One or two lines. What you cook, where you cook it."
          />
        </div>
      </OnboardStep>
      {pendingFile && (
        <AvatarCropper file={pendingFile} onCancel={() => setPendingFile(null)} onCropped={handleCropped} />
      )}
    </>
  );
}
