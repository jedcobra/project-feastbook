'use client';

import { useState } from 'react';
import { Field } from '@/components/create/field';
import { Label } from '@/components/label';
import { useAuth } from '@/components/auth/auth-provider';
import { createShelf } from '@/lib/supabase/queries';
import type { ShelfVisibility } from '@/lib/types';
import { SHELF_VISIBILITY_OPTIONS } from '@/lib/visibility';

export interface ShelfFormValues {
  title: string;
  subtitle: string;
  visibility: ShelfVisibility;
}

const EMPTY: ShelfFormValues = { title: '', subtitle: '', visibility: 'private' };

// Name, one-line description, and privacy — used to create a shelf (the
// "New shelf" screen and the add-to-shelf sheet) and to edit one later.
// With `initial` it's an edit form: Save only lights up once something
// actually changed.
export function ShelfForm({
  initial,
  submitLabel,
  submittingLabel,
  titleLocked,
  onSubmit,
}: {
  initial?: ShelfFormValues;
  submitLabel: string;
  submittingLabel: string;
  titleLocked?: string;
  onSubmit: (values: ShelfFormValues) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(initial?.title ?? EMPTY.title);
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? EMPTY.subtitle);
  const [visibility, setVisibility] = useState<ShelfVisibility>(initial?.visibility ?? EMPTY.visibility);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty =
    !initial ||
    title.trim() !== initial.title ||
    subtitle.trim() !== initial.subtitle ||
    visibility !== initial.visibility;
  const ready = title.trim().length > 0 && dirty;

  const handleSubmit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit({ title: title.trim(), subtitle: subtitle.trim(), visibility });
    setSubmitting(false);
    setSaved(ok);
  };

  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    setSaved(false);
    set(v);
  };

  return (
    <div>
      {titleLocked ? (
        <div className="mb-[18px] border-b border-dashed border-rule pb-2">
          <Label className="mb-1.5">Name</Label>
          <div className="font-display text-[22px] font-bold text-ink">{title}</div>
          <div className="mt-1 font-mono text-[12px] text-ink-mute">{titleLocked}</div>
        </div>
      ) : (
        <Field label="Name" value={title} onChange={edit(setTitle)} placeholder="Sunday Projects" mono={false} size={22} />
      )}
      <Field
        label="One line about it"
        value={subtitle}
        onChange={edit(setSubtitle)}
        placeholder="When I have time and nothing else to do"
        hint="Optional. Shows under the name."
      />
      <div className="mt-1.5">
        <Label className="mb-2 text-[11px]">Who can see it</Label>
        {SHELF_VISIBILITY_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => edit(setVisibility)(o.id)}
            className="flex w-full items-center gap-2.5 border-t border-dashed border-rule py-[11px] text-left"
          >
            <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.2px] border-ink">
              {visibility === o.id && <span className="h-[7px] w-[7px] rounded-full bg-ink" />}
            </span>
            <span className="font-mono text-[14px] text-ink">{o.title}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!ready || submitting}
        className={`mt-5 w-full rounded-button border border-ink py-3 font-mono text-[14px] font-semibold ${
          ready ? 'bg-ink text-cream' : 'bg-transparent text-ink-mute opacity-50'
        }`}
      >
        {submitting ? submittingLabel : saved && !dirty ? 'Saved' : submitLabel}
      </button>
    </div>
  );
}

export function NewShelfForm({ onCreated }: { onCreated: (shelf: { id: string; title: string }) => void }) {
  const { profile } = useAuth();
  return (
    <ShelfForm
      submitLabel="Create shelf"
      submittingLabel="Creating…"
      onSubmit={async ({ title, subtitle, visibility }) => {
        if (!profile) return false;
        const created = await createShelf(profile.id, title, subtitle, visibility);
        if (created) onCreated(created);
        return !!created;
      }}
    />
  );
}
