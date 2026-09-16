'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CameraIcon, LinkIcon, PencilIcon } from '@/components/icons';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import { draftProgress, listDrafts, type RecipeDraft } from '@/lib/recipe-draft';

const SOURCE_ICON = { manual: PencilIcon, link: LinkIcon, photo: CameraIcon } as const;

export function DraftsScreen() {
  const [drafts, setDrafts] = useState<RecipeDraft[] | null>(null);

  useEffect(() => {
    setDrafts(listDrafts());
  }, []);

  return (
    <>
      <TopBar
        title="Drafts"
        backHref="/new"
        subtitle={drafts ? `${drafts.length} unfinished` : undefined}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {drafts && drafts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
            <span className="font-mono text-[12px] text-ink-mute">No drafts yet.</span>
          </div>
        )}
        {drafts?.map((draft, i) => {
          const Icon = SOURCE_ICON[draft.source];
          const pct = draftProgress(draft);
          const title = draft.title.trim() || 'Untitled recipe';
          return (
            <Link
              key={draft.id}
              href={`/new/edit?draft=${draft.id}`}
              className={`block border-b border-dashed border-rule py-3.5 ${i === 0 ? 'border-t' : ''}`}
            >
              <div className="mb-1.5 flex items-baseline gap-2">
                <h4
                  className={`min-w-0 flex-1 truncate font-display text-[16px] font-bold ${
                    draft.title.trim() ? 'text-ink' : 'text-ink-mute'
                  }`}
                >
                  {title}
                </h4>
                <Icon size={12} className="flex-shrink-0 text-ink-mute" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-0.5 flex-1 bg-rule-soft">
                  <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
                </div>
                <span className="flex-shrink-0 font-mono text-[10px] text-ink-mute">
                  {pct}% · {formatRelativeTime(draft.updatedAt)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
