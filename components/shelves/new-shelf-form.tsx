'use client';

import { useState } from 'react';
import { Field } from '@/components/create/field';
import { Label } from '@/components/label';
import { useAuth } from '@/components/auth/auth-provider';
import { createShelf } from '@/lib/supabase/queries';
import type { ShelfVisibility } from '@/lib/types';
import { SHELF_VISIBILITY_OPTIONS } from '@/lib/visibility';

// Name, one-line description, and privacy — shared by the standalone
// "New shelf" screen and the add-to-shelf sheet's inline second view.
export function NewShelfForm({ onCreated }: { onCreated: (shelf: { id: string; title: string }) => void }) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [visibility, setVisibility] = useState<ShelfVisibility>('private');
  const [creating, setCreating] = useState(false);
  const ready = title.trim().length > 0;

  const handleCreate = async () => {
    if (!ready || !profile || creating) return;
    setCreating(true);
    const created = await createShelf(profile.id, title.trim(), subtitle.trim(), visibility);
    setCreating(false);
    if (created) onCreated(created);
  };

  return (
    <div>
      <Field label="Name" value={title} onChange={setTitle} placeholder="Sunday Projects" mono={false} size={22} />
      <Field
        label="One line about it"
        value={subtitle}
        onChange={setSubtitle}
        placeholder="When I have time and nothing else to do"
        hint="Optional. Shows under the name."
      />
      <div className="mt-1.5">
        <Label className="mb-2 text-[9px]">Who can see it</Label>
        {SHELF_VISIBILITY_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setVisibility(o.id)}
            className="flex w-full items-center gap-2.5 border-t border-dashed border-rule py-[11px] text-left"
          >
            <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
              {visibility === o.id && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
            </span>
            <span className="font-mono text-[12.5px] text-ink">{o.title}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleCreate}
        disabled={!ready || creating}
        className={`mt-5 w-full rounded-button border border-ink py-3 font-mono text-[13px] font-semibold ${
          ready ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
        }`}
      >
        {creating ? 'Creating…' : 'Create shelf'}
      </button>
    </div>
  );
}
