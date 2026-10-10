'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '@/components/icons';

// Full-screen look at a photo, styled like the profile-photo enlarge.
// Tap anywhere (or press Escape) to close. Portalled to <body> so no
// transformed or overflow-clipped ancestor can trap it.
export function PhotoViewer({ src, alt = '', onClose }: { src: string; alt?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-30 mx-auto flex max-w-column items-center justify-center bg-ink/95 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-cream text-cream"
      >
        <XIcon size={14} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-full max-w-full rounded-button object-contain" />
    </div>,
    document.body,
  );
}

// A thumbnail that opens the photo full screen when tapped.
export function ZoomablePhoto({ src, alt = '', className }: { src: string; alt?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="View photo" className="mt-2 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
      </button>
      {open && <PhotoViewer src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}
