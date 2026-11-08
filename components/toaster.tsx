'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from '@/components/icons';
import { onToast } from '@/lib/toast';

const VISIBLE_MS = 2400;
const FADE_MS = 200;

// Renders whatever showToast() raised: a small pill centred just above the
// floating tab bar, fading in and out. A new toast replaces the current one.
export function Toaster() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => onToast((message) => setToast({ id: Date.now(), message })), []);

  useEffect(() => {
    if (!toast) return;
    // Mount hidden, then show on the next frame so the fade-in runs.
    const raf = requestAnimationFrame(() => setShown(true));
    const hide = setTimeout(() => setShown(false), VISIBLE_MS);
    const clear = setTimeout(() => setToast(null), VISIBLE_MS + FADE_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hide);
      clearTimeout(clear);
      setShown(false);
    };
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: 'calc(var(--tabbar-clearance, 86px) + 8px)' }}
    >
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-mono text-[13px] font-semibold text-cream shadow-lg transition-all duration-200 ${
          shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <CheckIcon size={12} weight={2} />
        {toast.message}
      </div>
    </div>
  );
}
