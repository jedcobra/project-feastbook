'use client';

import { useRef, useState } from 'react';
import { CameraIcon, XIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { uploadPhoto, type PhotoKind } from '@/lib/supabase/storage';

interface PhotoFieldProps {
  label: string;
  photoUrl: string;
  onChange: (url: string) => void;
  profileId: string;
  kind: PhotoKind;
  size?: number;
}

// Upload-and-preview control shared by the composer's cover photo and each
// step's photo — picks a file, uploads it right away (drafts are plain
// JSON in localStorage, so there's nowhere to hold a raw File across a
// save/reload), and stores the resulting public URL.
export function PhotoField({ label, photoUrl, onChange, profileId, kind, size = 84 }: PhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    const result = await uploadPhoto(profileId, file, kind);
    setUploading(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    onChange(result.url);
  };

  return (
    <div className="mb-3.5">
      <Label className="mb-1 text-[9px]">{label}</Label>
      <div className="flex items-center gap-2.5">
        {photoUrl ? (
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt=""
              className="h-full w-full rounded-button border border-ink object-cover"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Remove photo"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-ink bg-cream text-ink"
            >
              <XIcon size={10} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={pick}
            disabled={uploading}
            className="flex flex-shrink-0 flex-col items-center justify-center gap-1 rounded-button border border-dashed border-rule text-ink-mute disabled:opacity-60"
            style={{ width: size, height: size }}
          >
            <CameraIcon size={18} />
            <span className="font-mono text-[9px]">{uploading ? 'Uploading…' : 'Add photo'}</span>
          </button>
        )}
        {photoUrl && (
          <button type="button" onClick={pick} disabled={uploading} className="font-mono text-[11px] text-ink-mute">
            {uploading ? 'Uploading…' : 'Change'}
          </button>
        )}
      </div>
      {error && <div className="mt-1 font-mono text-[10px] text-accent">{error}</div>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
