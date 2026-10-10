'use client';

import { useRef, useState } from 'react';
import { AutoGrowTextarea } from '@/components/auto-grow-textarea';
import { CameraIcon, XIcon } from '@/components/icons';
import { uploadPhoto } from '@/lib/supabase/storage';

// The note box shared by the recipe page and the full Notes screen: a
// camera to attach a photo (previewed above the box), the text, and Post.
// The camera, text line and button are centered on one line; as the text
// grows the camera and button stay level with its last line.
export function NoteComposer({
  id,
  profileId,
  value,
  onChange,
  placeholder,
  photoUrl,
  onPhotoUrlChange,
  onSubmit,
  submitLabel = 'Post',
  submitting = false,
  onError,
  maxHeightClassName = 'max-h-[40dvh]',
}: {
  id?: string;
  profileId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  photoUrl: string;
  onPhotoUrlChange: (url: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  onError: (message: string | null) => void;
  maxHeightClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    onError(null);
    setUploading(true);
    const result = await uploadPhoto(profileId, file, 'cooked');
    setUploading(false);
    if ('error' in result) {
      onError(result.error);
      return;
    }
    onPhotoUrlChange(result.url);
  };

  const canSubmit = !!value.trim() && !submitting && !uploading;

  return (
    <div>
      {photoUrl && (
        <div className="relative mb-2 h-16 w-16">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className="h-full w-full rounded-button border border-ink object-cover" />
          <button
            type="button"
            onClick={() => onPhotoUrlChange('')}
            aria-label="Remove photo"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-ink bg-cream text-ink"
          >
            <XIcon size={10} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-button border border-ink bg-cream-surface px-2.5 py-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Add a photo"
          className="flex flex-shrink-0 pb-[5px] text-ink-mute disabled:opacity-60"
        >
          <CameraIcon size={18} />
        </button>
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
        <AutoGrowTextarea
          id={id}
          value={value}
          rows={1}
          onChange={(e) => onChange(e.target.value)}
          placeholder={uploading ? 'Uploading photo…' : placeholder}
          className={`${maxHeightClassName} flex-1 resize-none border-none bg-transparent py-1.5 font-mono text-[16px] leading-[1.4] text-ink outline-none placeholder:text-ink-mute`}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`rounded-button border border-ink px-3 py-1.5 font-mono text-[13px] ${
            value.trim() ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
          }`}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
