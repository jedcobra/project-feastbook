'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronIcon, LinkIcon, PencilIcon, WandIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { TopBar } from '@/components/top-bar';

interface Params {
  reason: string;
  draftId: string;
  title: string;
  host: string;
  url: string;
}

// The real thing ss-states.jsx's SSImportFailScreen was designed for — now
// that /api/import actually tries to parse a page, this is what shows when
// it can't: what little we recovered, and three honest ways forward,
// rather than a bare error.
export function ImportFailScreen() {
  const router = useRouter();
  const [p, setP] = useState<Params | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setP({
      reason: params.get('reason') ?? '',
      draftId: params.get('draft') ?? '',
      title: params.get('title') ?? '',
      host: params.get('host') ?? '',
      url: params.get('url') ?? '',
    });
  }, []);

  if (!p) return null;

  const rows = [
    {
      icon: PencilIcon,
      label: 'Fill in the rest yourself',
      sub: 'Keeps the title and the link. You write the parts we missed.',
      onClick: () => router.push(p.draftId ? `/new/edit?draft=${p.draftId}` : '/new/edit?source=link'),
    },
    {
      icon: WandIcon,
      label: 'Paste the page text instead',
      sub: 'Select the recipe on the page, copy it, and paste it in.',
      onClick: () => router.push('/new/paste'),
    },
    {
      icon: LinkIcon,
      label: 'Just save the link',
      sub: 'Sits in your cookbook as a bookmark until you have time.',
      onClick: () => router.push('/new/drafts'),
    },
  ];

  return (
    <>
      <TopBar title="Couldn't read that page" backHref="/new" subtitle={p.host || p.url} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-[18px] border border-dashed border-rule p-[13px] font-mono text-[12px] leading-[1.6] text-ink-mute">
          {p.reason === 'fetch-failed'
            ? 'We couldn’t reach that page — it might be blocking automated requests, or temporarily down.'
            : 'We got the title, but no ingredient list we trust. Some sites hide the recipe behind a script, and guessing at quantities is worse than not guessing.'}
        </div>

        {p.title && (
          <>
            <Label className="mb-2">What we did get</Label>
            <div className="mb-[18px] border-t border-dashed border-rule pt-2.5">
              <div className="mb-0.5 font-display text-[17px] font-bold text-ink">{p.title}</div>
              {p.host && <div className="font-mono text-[11px] text-ink-mute">{p.host} · source saved</div>}
            </div>
          </>
        )}

        <Label className="mb-2">Three ways forward</Label>
        {rows.map((row, i) => (
          <button
            key={row.label}
            type="button"
            onClick={row.onClick}
            className={`flex w-full items-center gap-3 border-t border-dashed border-rule py-[13px] text-left ${
              i === rows.length - 1 ? 'border-b' : ''
            }`}
          >
            <row.icon size={17} className="flex-shrink-0 text-ink" />
            <span className="min-w-0 flex-1">
              <span className="mb-px block font-display text-[14.5px] font-bold text-ink">{row.label}</span>
              <span className="block font-mono text-[10.5px] leading-[1.45] text-ink-mute">{row.sub}</span>
            </span>
            <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
          </button>
        ))}
      </div>
    </>
  );
}
