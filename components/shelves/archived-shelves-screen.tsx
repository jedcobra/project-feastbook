'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ChevronIcon } from '@/components/icons';
import { SwipeableRow } from '@/components/swipeable-row';
import { Tag } from '@/components/tag';
import { TopBar } from '@/components/top-bar';
import { deleteShelf, fetchArchivedShelves, setShelfArchived } from '@/lib/supabase/queries';
import type { Shelf } from '@/lib/types';

export function ArchivedShelvesScreen() {
  const { profile } = useAuth();
  const [shelves, setShelves] = useState<Shelf[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) fetchArchivedShelves(profile.id).then(setShelves);
  }, [profile]);

  const remove = (id: string) => setShelves((s) => (s ? s.filter((sh) => sh.id !== id) : s));

  const handleUnarchive = async (id: string) => {
    remove(id);
    await setShelfArchived(id, false);
  };

  const handleDelete = async (id: string) => {
    remove(id);
    await deleteShelf(id);
  };

  return (
    <>
      <TopBar title="Archived shelves" backHref="/me" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {shelves === null ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">Loading…</div>
        ) : shelves.length === 0 ? (
          <div className="mt-4 border border-dashed border-rule p-[22px] text-center font-mono text-[12px] leading-relaxed text-ink-mute">
            Nothing archived.
          </div>
        ) : (
          shelves.map((shelf, i) => (
            <SwipeableRow
              key={shelf.id}
              open={openId === shelf.id}
              onOpen={() => setOpenId(shelf.id)}
              onClose={() => setOpenId((id) => (id === shelf.id ? null : id))}
              actions={[
                { label: 'Delete', className: 'bg-accent', onClick: () => handleDelete(shelf.id) },
                { label: 'Unarchive', className: 'bg-ink', onClick: () => handleUnarchive(shelf.id) },
              ]}
            >
              <Link
                href={`/shelf/${shelf.id}`}
                className={`flex items-start gap-3.5 border-b border-dashed border-rule bg-cream py-3.5 ${i === 0 ? 'border-t' : ''}`}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-ink">
                  <span className="font-mono text-[14px] font-semibold text-ink">{shelf.count}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-0.5 font-display text-[17px] font-bold text-ink">{shelf.title}</h3>
                  <div className="mb-1.5 font-mono text-meta text-ink-mute">{shelf.subtitle}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {shelf.recipes.slice(0, 3).map((r) => (
                      <Tag key={r.id}>{r.title}</Tag>
                    ))}
                    {shelf.count > 3 && <Tag>+{shelf.count - 3} more</Tag>}
                  </div>
                </div>
                <ChevronIcon size={16} className="mt-2.5 flex-shrink-0 text-ink-mute" />
              </Link>
            </SwipeableRow>
          ))
        )}
      </div>
    </>
  );
}
