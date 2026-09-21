'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CameraIcon, LinkIcon, PencilIcon, TrashIcon, WandIcon } from '@/components/icons';
import { SwipeableRow } from '@/components/swipeable-row';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import { deleteDraft, draftProgress, listUnstartedDrafts, type RecipeDraft } from '@/lib/recipe-draft';

const SOURCE_ICON = { manual: PencilIcon, link: LinkIcon, photo: CameraIcon, paste: WandIcon } as const;

export function DraftsScreen() {
  const [drafts, setDrafts] = useState<RecipeDraft[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(listUnstartedDrafts());
  }, []);

  const confirmingDraft = confirmingId ? (drafts ?? []).find((d) => d.id === confirmingId) : undefined;

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDrafts((ds) => (ds ? ds.filter((d) => d.id !== id) : ds));
    setConfirmingId(null);
  };

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
          const row = (
            <Link
              href={`/new/edit?draft=${draft.id}`}
              className={`block border-b border-dashed border-rule bg-cream py-3.5 ${i === 0 ? 'border-t' : ''}`}
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

          return (
            <SwipeableRow
              key={draft.id}
              open={openId === draft.id}
              onOpen={() => setOpenId(draft.id)}
              onClose={() => setOpenId((cur) => (cur === draft.id ? null : cur))}
              actions={[{ label: 'Delete', className: 'bg-accent', onClick: () => setConfirmingId(draft.id) }]}
            >
              {row}
            </SwipeableRow>
          );
        })}
      </div>

      {confirmingDraft && (
        <div
          className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30"
          onClick={() => setConfirmingId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
          >
            <h3 className="mb-2 flex items-center gap-2 font-display text-[17px] font-bold text-ink">
              <TrashIcon size={16} />
              Discard &ldquo;{confirmingDraft.title.trim() || 'Untitled recipe'}&rdquo;?
            </h3>
            <div className="mb-3.5 font-mono text-[11.5px] leading-[1.55] text-ink-mute">
              This can&rsquo;t be undone — everything typed into it goes with it.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingId(null)}
                className="flex-1 rounded-button border border-ink bg-transparent py-2 font-mono text-[12px] text-ink"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmingDraft.id)}
                className="flex-1 rounded-button border border-accent bg-accent py-2 font-mono text-[12px] text-cream"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
