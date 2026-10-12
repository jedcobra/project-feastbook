'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { CameraIcon } from '@/components/icons';
import { useImageCrop } from '@/components/image-cropper';
import { Label } from '@/components/label';
import { STICKER_CLASS } from '@/components/shelves/shelf-icon';
import { uploadPhoto } from '@/lib/supabase/storage';

export interface ShelfCover {
  // Always null now that icons are photos only; saving it clears an emoji
  // set back when those were offered.
  emoji: string | null;
  coverUrl: string | null;
  stickerUrl: string | null;
}

const NONE: ShelfCover = { emoji: null, coverUrl: null, stickerUrl: null };

export interface ShelfRecipePhoto {
  id: string;
  title: string;
  url: string;
}

// A cookbook's icon is a photo: one of its recipes' photos or one of the
// owner's own (cropped square). Without one it shows its first recipe's
// photo, or else its recipe count — the preview here shows that default.
// Tapping the icon opens the photo picker below it (or, with no recipe
// photos to offer, goes straight to the camera roll); tapping outside the
// picker closes it. A sticker from when those were offered still shows
// until it's replaced or removed.
export function ShelfCoverField({
  value,
  onChange,
  recipePhotos = [],
}: {
  value: ShelfCover;
  onChange: (cover: ShelfCover) => void;
  recipePhotos?: ShelfRecipePhoto[];
}) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { cropImage, cropper } = useImageCrop();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chosen = !!(value.coverUrl || value.stickerUrl);
  const fallback = recipePhotos[0]?.url;

  const pick = (cover: ShelfCover) => {
    onChange(cover);
    setOpen(false);
    setError(null);
  };

  const handleFile = async (picked: File | undefined) => {
    if (!picked || !profile || uploading) return;
    // Cookbook icons show square, so they're cropped square.
    const file = await cropImage(picked, 'square');
    if (!file) return;
    setError(null);
    setOpen(false);
    setUploading(true);
    const uploaded = await uploadPhoto(profile.id, file, 'shelf-cover');
    setUploading(false);
    if ('error' in uploaded) setError(uploaded.error);
    else onChange({ ...NONE, coverUrl: uploaded.url });
  };

  // The picker closes on any tap outside it — except on the icon itself,
  // which toggles it, and while a photo is still uploading.
  useEffect(() => {
    if (!open || uploading) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !iconRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, uploading]);

  const tapIcon = () => {
    if (uploading) return;
    setError(null);
    if (recipePhotos.length === 0) fileRef.current?.click();
    else setOpen((o) => !o);
  };

  const shown = value.coverUrl || (value.stickerUrl ? null : fallback);

  return (
    <div className="mb-[18px]">
      <Label className="mb-2 text-[11px]">Icon</Label>
      <div className="flex items-center gap-3">
        <button
          ref={iconRef}
          type="button"
          onClick={tapIcon}
          aria-label={chosen ? 'Change the photo' : 'Choose a photo'}
          aria-expanded={open}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center"
        >
          {uploading ? (
            <div className="flex h-full w-full items-center justify-center rounded-button border border-ink font-mono text-[12px] text-ink-mute">
              …
            </div>
          ) : shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full rounded-button object-cover" />
          ) : value.stickerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.stickerUrl} alt="" className={`h-full w-full p-px ${STICKER_CLASS}`} />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-button border border-ink text-ink-mute">
              <CameraIcon size={18} />
            </div>
          )}
        </button>
        <div className="min-w-0 flex-1 font-mono text-[12px] leading-[1.5] text-ink-mute">
          {uploading ? (
            'Uploading your photo…'
          ) : chosen ? (
            <>
              Tap it to change.{' '}
              <button type="button" onClick={() => pick(NONE)} className="text-accent">
                Remove
              </button>
            </>
          ) : fallback ? (
            'Using the first recipe’s photo. Tap to choose another.'
          ) : (
            'Optional. Tap to add a photo.'
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {open && (
        <div ref={panelRef} className="mt-2.5 border border-rule p-1.5">
          <div className="px-0.5 pb-1.5 pt-0.5 font-mono text-[11px] text-ink-mute">From this cookbook&rsquo;s recipes</div>
          <div className="grid max-h-[196px] grid-cols-4 gap-1.5 overflow-y-auto">
            {recipePhotos.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pick({ ...NONE, coverUrl: r.url })}
                aria-label={r.title}
                aria-pressed={r.url === value.coverUrl}
                className={`aspect-square overflow-hidden rounded-button bg-cream-deep ${
                  r.url === value.coverUrl ? 'ring-2 ring-ink ring-offset-1 ring-offset-cream' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-1.5 w-full rounded-button border border-ink py-2 font-mono text-[13px] text-ink disabled:opacity-60"
          >
            Upload a photo
          </button>
        </div>
      )}
      {error && <div className="mt-2 font-mono text-[12px] text-accent">{error}</div>}
      {cropper}
    </div>
  );
}
