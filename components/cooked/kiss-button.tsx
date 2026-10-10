'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ChefKissIcon } from '@/components/icons';
import { setCookPhotoKiss } from '@/lib/supabase/queries';
import type { CookPhoto } from '@/lib/types';

export const kissLabel = (n: number) => `${n} kiss${n === 1 ? '' : 'es'}`;

// The kiss toggle on a cooked photo, shared by the feed and the photo popup.
// Thin lines until you've kissed the photo, then the filled hand. Updates
// optimistically through onChange and rolls back (with onError) if the save
// fails.
export function KissButton({
  photo,
  onChange,
  onError,
}: {
  photo: CookPhoto;
  onChange: (photo: CookPhoto) => void;
  onError?: (message: string) => void;
}) {
  const { profile } = useAuth();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!profile || busy) return;
    const next = !photo.kissedByMe;
    setBusy(true);
    onChange({ ...photo, kissedByMe: next, kisses: Math.max(0, photo.kisses + (next ? 1 : -1)) });
    const ok = await setCookPhotoKiss(photo, profile.id, next);
    setBusy(false);
    if (!ok) {
      onChange(photo);
      onError?.(next ? "Couldn't send that kiss — try again." : "Couldn't take that kiss back — try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!profile}
      aria-pressed={photo.kissedByMe}
      aria-label={photo.kissedByMe ? 'Take back kiss' : 'Send a kiss'}
      className="-m-1 p-1 text-ink"
    >
      <ChefKissIcon size={16} weight={photo.kissedByMe ? 1 : 0.8} filled={photo.kissedByMe} />
    </button>
  );
}
