'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/checkbox';
import { Field } from '@/components/create/field';
import { Label } from '@/components/label';
import { ShelfCoverField, type ShelfRecipePhoto } from '@/components/shelves/shelf-cover-field';
import type { ShelfVisibility } from '@/lib/types';
import { SHELF_VISIBILITY_OPTIONS } from '@/lib/visibility';

export interface ShelfFormValues {
  title: string;
  subtitle: string;
  visibility: ShelfVisibility;
  emoji: string | null;
  coverUrl: string | null;
  stickerUrl: string | null;
}

const EMPTY: ShelfFormValues = {
  title: '',
  subtitle: '',
  visibility: 'private',
  emoji: null,
  coverUrl: null,
  stickerUrl: null,
};

// Name, icon, one-line description, privacy, and whether to tell followers —
// used to create a shelf (the New shelf sheet and the add-to-shelf sheet)
// and to edit one later.
// With `initial` it's an edit form: Save only lights up once something
// actually changed.
export function ShelfForm({
  initial,
  submitLabel,
  submittingLabel,
  titleLocked,
  recipePhotos,
  posted = false,
  onSubmit,
}: {
  initial?: ShelfFormValues;
  submitLabel: string;
  submittingLabel: string;
  titleLocked?: string;
  // The shelf's recipes' photos, offered as covers when editing a shelf.
  recipePhotos?: ShelfRecipePhoto[];
  // Already posted to the feed: "Tell my followers" has been used up.
  posted?: boolean;
  onSubmit: (values: ShelfFormValues & { tellFollowers: boolean }) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(initial?.title ?? EMPTY.title);
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? EMPTY.subtitle);
  const [visibility, setVisibility] = useState<ShelfVisibility>(initial?.visibility ?? EMPTY.visibility);
  const [cover, setCover] = useState({
    emoji: initial?.emoji ?? EMPTY.emoji,
    coverUrl: initial?.coverUrl ?? EMPTY.coverUrl,
    stickerUrl: initial?.stickerUrl ?? EMPTY.stickerUrl,
  });
  const [tell, setTell] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  // Only a shelf other people can see can be posted, and only once.
  const canTell = visibility !== 'private' && !posted;

  const dirty =
    !initial ||
    title.trim() !== initial.title ||
    subtitle.trim() !== initial.subtitle ||
    visibility !== initial.visibility ||
    cover.emoji !== initial.emoji ||
    cover.coverUrl !== initial.coverUrl ||
    cover.stickerUrl !== initial.stickerUrl ||
    (tell && canTell);
  const ready = title.trim().length > 0 && dirty;

  const handleSubmit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    const ok = await onSubmit({
      title: title.trim(),
      subtitle: subtitle.trim(),
      visibility,
      ...cover,
      tellFollowers: tell && canTell,
    });
    setSubmitting(false);
    setSaved(ok);
    if (ok) setTell(false);
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
      <ShelfCoverField value={cover} onChange={edit(setCover)} recipePhotos={recipePhotos} />
      <Field
        label="One line about it"
        value={subtitle}
        // Grows as you type, like the other text boxes, but stays one line
        // of text: it shows as a single line under the shelf's name.
        multiline
        rows={1}
        onChange={(v) => edit(setSubtitle)(v.replace(/\s*\n+\s*/g, ' '))}
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
      {visibility !== 'private' &&
        (posted ? (
          <div className="border-t border-dashed border-rule py-[11px] font-mono text-[12px] text-ink-mute">
            Posted to your followers&rsquo; feed.
          </div>
        ) : (
          <button
            type="button"
            onClick={() => edit(setTell)(!tell)}
            aria-pressed={tell}
            className="mt-1.5 flex w-full items-start gap-2.5 border-y border-dashed border-rule py-[11px] text-left"
          >
            <Checkbox checked={tell} size={14} className="mt-[3px]" />
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[14px] text-ink">Tell my followers</span>
              <span className="block font-mono text-[12px] leading-[1.5] text-ink-mute">
                Posts it to the feed and lets them know.
              </span>
            </span>
          </button>
        ))}
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
