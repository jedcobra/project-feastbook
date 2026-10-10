'use client';

import { useRef, useState } from 'react';
import { CameraIcon, ChefHatIcon } from '@/components/icons';
import { addCookPhoto } from '@/lib/supabase/queries';
import { uploadPhoto } from '@/lib/supabase/storage';

// Shown right after someone marks a recipe cooked (the Cooked it button, or
// reaching Done in cooking mode): an invitation to photograph their version.
// A photo goes on their profile's Cooked grid; skipping leaves just the
// cooked mark, which has already been saved by the time this opens.
export function CookedPhotoPrompt({
  profileId,
  recipeId,
  recipeTitle,
  onClose,
}: {
  profileId: string;
  recipeId: string;
  recipeTitle: string;
  onClose: (added: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setError(null);
    setBusy(true);
    setPreview(URL.createObjectURL(file));
    const uploaded = await uploadPhoto(profileId, file, 'cooked');
    if ('error' in uploaded) {
      setBusy(false);
      setPreview(null);
      setError(uploaded.error);
      return;
    }
    const id = await addCookPhoto(profileId, recipeId, uploaded.url);
    setBusy(false);
    if (!id) {
      setPreview(null);
      setError("Couldn't add that photo — try again.");
      return;
    }
    onClose(true);
  };

  const fileInput = (ref: React.RefObject<HTMLInputElement>, capture: boolean) => (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      {...(capture ? { capture: 'environment' as const } : {})}
      className="hidden"
      onChange={(e) => {
        void handleFile(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  return (
    <div
      className="fixed inset-0 z-40 mx-auto flex max-w-column flex-col justify-end bg-ink/30"
      onClick={() => !busy && onClose(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cooked-prompt-title"
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-5 font-mono text-ink"
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-ink">
            <ChefHatIcon size={16} />
          </span>
          <div className="min-w-0">
            <h3 id="cooked-prompt-title" className="font-display text-[18px] font-bold leading-tight">
              You cooked it!
            </h3>
            <div className="truncate text-[12px] text-ink-mute">{recipeTitle}</div>
          </div>
        </div>
        <p className="mb-4 text-[14px] leading-[1.5] text-ink-mute">
          Snap your version of the dish and it&rsquo;ll go on your Cooked grid.
        </p>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="mb-3 h-40 w-full rounded-button border border-ink object-cover" />
        )}
        {error && <div className="mb-3 text-[12px] text-accent">{error}</div>}

        <button
          type="button"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-button border border-ink bg-ink py-3 text-[14px] font-semibold text-cream disabled:opacity-60"
        >
          <CameraIcon size={16} />
          {busy ? 'Adding your photo…' : 'Take a photo'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => libraryRef.current?.click()}
          className="mb-2 w-full rounded-button border border-ink py-3 text-[14px] text-ink disabled:opacity-60"
        >
          Choose from your photos
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onClose(false)}
          className="w-full py-2.5 text-[14px] text-ink-mute disabled:opacity-60"
        >
          Not now
        </button>
        {fileInput(cameraRef, true)}
        {fileInput(libraryRef, false)}
      </div>
    </div>
  );
}
