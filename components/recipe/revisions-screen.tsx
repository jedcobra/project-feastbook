'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { OutlineBox } from '@/components/outline-box';
import { TopBar } from '@/components/top-bar';
import { formatRelativeTime } from '@/lib/format';
import { fetchRecipeFull, fetchRevisions, restoreRevision, type RevisionEntry } from '@/lib/supabase/queries';
import type { Recipe } from '@/lib/types';

// A ledger of past content states for a recipe you wrote. Diffing what
// changed between versions is real work the design explicitly stubs out
// (MERGE.md), so each past row just carries when it was replaced — the
// point is that it's still there and restorable, not what exactly changed.
export function RevisionsScreen({ id }: { id: string }) {
  const { profile } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [revisions, setRevisions] = useState<RevisionEntry[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipeFull(id).then((data) => setRecipe(data?.recipe ?? null));
    fetchRevisions(id).then(setRevisions);
  }, [id]);

  const handleRestore = async (revisionId: string) => {
    setRestoringId(revisionId);
    const ok = await restoreRevision(id, revisionId);
    if (ok) {
      const [data, revs] = await Promise.all([fetchRecipeFull(id), fetchRevisions(id)]);
      setRecipe(data?.recipe ?? null);
      setRevisions(revs);
      setOpenId(null);
    }
    setRestoringId(null);
  };

  if (recipe === undefined || !revisions) {
    return (
      <>
        <TopBar title="Revision history" backHref={`/recipe/${id}`} />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (recipe === null || recipe.author !== profile?.handle) {
    return (
      <>
        <TopBar title="Revision history" backHref={`/recipe/${id}`} />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">Not available.</span>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Revision history" subtitle={recipe.title} backHref={`/recipe/${id}`} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-3.5 font-mono text-[11px] leading-[1.55] text-ink-mute">
          Every save keeps the version before it. Nothing you write here is ever lost.
        </div>

        <RevisionRow label="Current" isCurrent open={false} onToggle={() => {}} />

        {revisions.map((rev) => (
          <RevisionRow
            key={rev.id}
            label={formatRelativeTime(rev.createdAt)}
            isCurrent={false}
            open={openId === rev.id}
            onToggle={() => setOpenId((o) => (o === rev.id ? null : rev.id))}
            action={
              <OutlineBox
                compact
                onClick={() => handleRestore(rev.id)}
                aria-label="Restore this version"
              >
                {restoringId === rev.id ? 'Restoring…' : 'Restore'}
              </OutlineBox>
            }
          />
        ))}
      </div>
    </>
  );
}

function RevisionRow({
  label,
  isCurrent,
  open,
  onToggle,
  action,
}: {
  label: string;
  isCurrent: boolean;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div onClick={onToggle} className="flex cursor-pointer gap-3 border-t border-dashed border-rule py-3">
      <div className="flex w-2 flex-shrink-0 flex-col items-center pt-[5px]">
        <span className={`h-[7px] w-[7px] rounded-full border border-ink ${isCurrent ? 'bg-ink' : 'bg-transparent'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[13.5px] font-bold text-ink">{label}</span>
          {isCurrent && (
            <span className="border border-ink px-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ink">
              current
            </span>
          )}
        </div>
        {open && action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
