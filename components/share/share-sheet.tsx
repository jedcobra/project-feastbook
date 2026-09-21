'use client';

import { useState } from 'react';
import { LinkIcon, ShareIcon } from '@/components/icons';
import type { Recipe } from '@/lib/types';

interface ShareSheetProps {
  recipe: Recipe;
  onClose: () => void;
}

const SOCIAL_LINKS = (url: string, text: string) => [
  { label: 'X (Twitter)', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
  { label: 'Email', href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`, mailto: true },
];

// The Share button's menu: copy the public /r/[id] link, hand off to the
// device's own share sheet when one exists, or go straight to a specific
// platform. No brand-colored logos here — the design's palette is ink and
// cream, one accent, so these are plain mono rows like everything else.
export function ShareSheet({ recipe, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/r/${recipe.id}`;
  const text = recipe.subtitle ? `${recipe.title} — ${recipe.subtitle}` : recipe.title;
  const canNativeShare = typeof navigator.share === 'function';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied — nothing else we can do about it.
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: recipe.title, text, url });
      onClose();
    } catch {
      // Cancelled by the person, or blocked mid-call — either way, no error to show.
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
      >
        <h3 className="mb-0.5 truncate font-display text-[17px] font-bold text-ink">{recipe.title}</h3>
        <div className="mb-1 font-mono text-[11px] text-ink-mute">Anyone with the link can read it, signed in or not</div>

        <button
          type="button"
          onClick={copyLink}
          className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[11px] text-left"
        >
          <LinkIcon size={16} className="flex-shrink-0 text-ink" />
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[12.5px] text-ink">Copy link</span>
            <span className="block truncate font-mono text-[10.5px] text-ink-mute">{copied ? 'Copied' : url}</span>
          </span>
        </button>

        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[11px] text-left"
          >
            <ShareIcon size={16} className="flex-shrink-0 text-ink" />
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[12.5px] text-ink">Share via…</span>
              <span className="block truncate font-mono text-[10.5px] text-ink-mute">
                Messages, mail, or any app on this device
              </span>
            </span>
          </button>
        )}

        <div className="mb-0.5 mt-3 border-t border-dashed border-rule pt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-mute">
          Or share to
        </div>
        {SOCIAL_LINKS(url, text).map((s) =>
          s.mailto ? (
            <a
              key={s.label}
              href={s.href}
              onClick={onClose}
              className="block border-t border-dotted border-rule py-2.5 font-mono text-[12.5px] text-ink"
            >
              {s.label}
            </a>
          ) : (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                window.open(s.href, '_blank', 'noopener,noreferrer');
                onClose();
              }}
              className="block w-full border-t border-dotted border-rule py-2.5 text-left font-mono text-[12.5px] text-ink"
            >
              {s.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
