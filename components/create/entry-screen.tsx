'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { CameraIcon, ChevronIcon, ForkIcon, LinkIcon, PencilIcon } from '@/components/icons';

const SECONDARY_ROWS = [
  { icon: PencilIcon, title: 'Type it out', sub: 'Blank page. Your words, your measurements.' },
  { icon: CameraIcon, title: 'Photograph a card', sub: 'Handwritten card or a page from a book.' },
  { icon: ForkIcon, title: 'Fork a recipe', sub: "Start from someone else's and change it." },
] as const;

// Entry picker — link paste leads, three secondary routes sit beneath a
// dashed "or" divider. No parser yet, so every path opens the blank
// composer for now instead of an import-review screen.
export function EntryScreen() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [url, setUrl] = useState('');

  const openComposer = (params?: string) => {
    router.push(`/new/edit?new=1${params ?? ''}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[13px] leading-relaxed text-ink-mute">
          Sign in to add a recipe to your cookbook.
        </p>
        <Link
          href="/account"
          className="rounded-button border border-ink bg-ink px-5 py-2.5 font-mono text-[13px] font-semibold text-cream"
        >
          Sign in / Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
      <div className="mb-[18px] border border-ink p-4">
        <div className="mb-2 font-display text-caps font-bold uppercase text-ink">
          Import from a link
        </div>
        <div className="mb-3 flex items-center gap-2 border-b border-dashed border-rule pb-2">
          <LinkIcon size={14} className="flex-shrink-0 text-ink-mute" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a recipe URL…"
            className="min-w-0 flex-1 border-none bg-transparent font-mono text-[12px] text-ink placeholder:text-ink-mute focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => openComposer(url.trim() ? `&src=link&url=${encodeURIComponent(url.trim())}` : '&src=link')}
          className="w-full rounded-button border border-ink bg-ink py-2.5 font-mono text-[13px] font-semibold text-cream"
        >
          Fetch recipe
        </button>
        <div className="mt-2 font-mono text-[10px] leading-relaxed text-ink-mute">
          We pull the ingredients and method, then you confirm every field before it saves.
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex-1 border-t border-dashed border-rule" />
        <span className="font-mono text-[10px] text-ink-mute">or</span>
        <div className="flex-1 border-t border-dashed border-rule" />
      </div>

      {SECONDARY_ROWS.map((row, i) => (
        <button
          key={row.title}
          type="button"
          onClick={() => openComposer(row.title === 'Photograph a card' ? '&src=photo' : '')}
          className={`flex w-full items-center gap-3 border-b border-dashed border-rule py-3.5 text-left ${
            i === 0 ? 'border-t' : ''
          }`}
        >
          <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center border border-ink">
            <row.icon size={16} className="text-ink" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="mb-px block font-display text-[15px] font-bold text-ink">{row.title}</span>
            <span className="block font-mono text-[11px] text-ink-mute">{row.sub}</span>
          </span>
          <ChevronIcon size={15} className="flex-shrink-0 text-ink-mute" />
        </button>
      ))}
    </div>
  );
}
