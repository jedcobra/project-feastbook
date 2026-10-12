'use client';

import { useState } from 'react';
import { KissButton, kissLabel } from '@/components/cooked/kiss-button';
import { MessageIcon, SendIcon } from '@/components/icons';
import { cookPhotoShareItem, ShareSheet } from '@/components/share/share-sheet';
import type { CookPhoto } from '@/lib/types';

// The row under a cook photo, wherever it's shown: a chef's kiss (with its
// count once there is one), a speech bubble that takes you to the comment
// box, and a paper plane that opens the share sheet — send it to someone in
// a message, copy its link, or pass it to another app.
export function PhotoActions({
  photo,
  onChange,
  onError,
  onComment,
  trailing,
}: {
  photo: CookPhoto;
  onChange: (photo: CookPhoto) => void;
  onError: (message: string) => void;
  onComment: () => void;
  trailing?: React.ReactNode;
}) {
  const [sharing, setSharing] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <KissButton photo={photo} onChange={onChange} onError={onError} />
        {photo.kisses > 0 && <span className="font-mono text-[14px] text-ink">{kissLabel(photo.kisses)}</span>}
      </div>
      <button type="button" onClick={onComment} aria-label="Comment" className="-m-1 p-1 text-ink">
        <MessageIcon size={17} />
      </button>
      <button type="button" onClick={() => setSharing(true)} aria-label="Share" className="-m-1 p-1 text-ink">
        <SendIcon size={16} />
      </button>
      {trailing}
      {sharing && <ShareSheet item={cookPhotoShareItem(photo)} onClose={() => setSharing(false)} />}
    </div>
  );
}
