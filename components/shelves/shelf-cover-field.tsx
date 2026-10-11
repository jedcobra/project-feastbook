'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Label } from '@/components/label';
import { EMOJI_FONT_CLASS, FLAG_EMOJI, FOOD_EMOJI } from '@/lib/shelf-emoji';
import { uploadPhoto } from '@/lib/supabase/storage';

export interface ShelfCover {
  emoji: string | null;
  coverUrl: string | null;
}

export interface ShelfRecipePhoto {
  id: string;
  title: string;
  url: string;
}

type Panel = 'emoji' | 'recipe';

// A shelf's cover: an emoji (food or flag), one of its recipes' photos, or
// a photo of the owner's own. Picking one replaces whichever was there.
// With none the shelf shows its recipe count, so the empty preview shows
// "#" in a rounded square as a hint of that. Recipe photos are only on
// offer once the shelf has recipes with photos.
export function ShelfCoverField({
  value,
  onChange,
  recipePhotos = [],
}: {
  value: ShelfCover;
  onChange: (cover: ShelfCover) => void;
  recipePhotos?: ShelfRecipePhoto[];
}) {
  const { profile } = useAuth();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chosen = !!(value.emoji || value.coverUrl);

  const pick = (cover: ShelfCover) => {
    onChange(cover);
    setPanel(null);
    setError(null);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !profile || uploading) return;
    setError(null);
    setPanel(null);
    setUploading(true);
    const uploaded = await uploadPhoto(profile.id, file, 'shelf-cover');
    setUploading(false);
    if ('error' in uploaded) setError(uploaded.error);
    else onChange({ emoji: null, coverUrl: uploaded.url });
  };

  const chip = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded border border-ink px-2 py-[3px] font-mono text-[12px] ${
        active ? 'bg-ink text-cream' : 'bg-transparent text-ink'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mb-[18px]">
      <Label className="mb-2 text-[11px]">Cover</Label>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center">
          {uploading ? (
            <div className="flex h-full w-full items-center justify-center rounded-button border border-dashed border-ink font-mono text-[12px] text-ink-mute">
              …
            </div>
          ) : value.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.coverUrl} alt="" className="h-full w-full rounded-button object-cover" />
          ) : value.emoji ? (
            <span className={`text-[34px] ${EMOJI_FONT_CLASS}`}>{value.emoji}</span>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-button border border-ink font-mono text-[14px] font-semibold text-ink-mute">
              #
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 font-mono text-[12px] leading-[1.5] text-ink-mute">
          {uploading
            ? 'Uploading your photo…'
            : chosen
              ? 'Shows beside the shelf’s name.'
              : 'Optional. Without one, the shelf shows how many recipes are on it.'}
        </div>
        {chosen && !uploading && (
          <button
            type="button"
            onClick={() => pick({ emoji: null, coverUrl: null })}
            className="flex-shrink-0 font-mono text-[12px] text-ink-mute underline underline-offset-2"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {chip('Emoji', panel === 'emoji', () => setPanel((p) => (p === 'emoji' ? null : 'emoji')))}
        {recipePhotos.length > 0 &&
          chip('Recipe photo', panel === 'recipe', () => setPanel((p) => (p === 'recipe' ? null : 'recipe')))}
        {chip(uploading ? 'Uploading…' : 'Upload photo', false, () => fileRef.current?.click())}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {panel === 'emoji' && (
        <EmojiGrid value={value.emoji} onPick={(emoji) => pick({ emoji, coverUrl: null })} />
      )}
      {panel === 'recipe' && (
        <div className="mt-2.5 grid max-h-[232px] grid-cols-4 gap-1.5 overflow-y-auto border border-dashed border-rule p-1.5">
          {recipePhotos.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => pick({ emoji: null, coverUrl: r.url })}
              aria-label={r.title}
              aria-pressed={r.url === value.coverUrl}
              className={`aspect-square overflow-hidden rounded-button bg-cream-deep ${
                r.url === value.coverUrl ? 'ring-2 ring-ink ring-offset-1 ring-offset-cream' : ''
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {error && <div className="mt-2 font-mono text-[12px] text-accent">{error}</div>}
    </div>
  );
}

const GROUPS = [
  { id: 'food', label: 'Food & drink', emoji: FOOD_EMOJI.map((emoji) => ({ emoji, name: emoji })) },
  { id: 'flags', label: 'Flags', emoji: FLAG_EMOJI },
] as const;
type GroupId = (typeof GROUPS)[number]['id'];

// Food & drink and flags in one scrolling grid, like the emoji keyboard:
// the buttons above jump to where each group starts, and the one for the
// group in view stays highlighted as you scroll.
function EmojiGrid({ value, onPick }: { value: string | null; onPick: (emoji: string) => void }) {
  const [active, setActive] = useState<GroupId>('food');
  const gridRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<GroupId, HTMLElement>());

  // Opening with an emoji already chosen scrolls it into view.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !value) return;
    const selected = grid.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (selected) grid.scrollTop = selected.offsetTop - grid.clientHeight / 2 + selected.offsetHeight / 2;
    // Only on opening — a pick closes the grid anyway.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const jumpTo = (id: GroupId) => {
    const grid = gridRef.current;
    const heading = groupRefs.current.get(id);
    // Leave the grid's top padding above the heading.
    if (grid && heading) grid.scrollTo({ top: Math.max(0, heading.offsetTop - 6), behavior: 'smooth' });
  };

  const onScroll = () => {
    const grid = gridRef.current;
    if (!grid) return;
    // The last group whose heading has reached the top of the grid; at the
    // very bottom, the last group, even if its heading can't scroll that far.
    const atBottom = grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 2;
    let current: GroupId = GROUPS[0].id;
    for (const g of GROUPS) {
      const heading = groupRefs.current.get(g.id);
      if (heading && (heading.offsetTop <= grid.scrollTop + 8 || atBottom)) current = g.id;
    }
    setActive(current);
  };

  return (
    <div className="mt-2.5 border border-dashed border-rule">
      <div className="flex gap-1.5 border-b border-dashed border-rule p-1.5">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => jumpTo(g.id)}
            aria-current={active === g.id ? 'true' : undefined}
            className={`rounded px-2 py-[3px] font-mono text-[12px] ${
              active === g.id ? 'bg-cream-deep text-ink' : 'text-ink-mute'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div
        ref={gridRef}
        onScroll={onScroll}
        className="relative grid max-h-[232px] grid-cols-8 gap-0.5 overflow-y-auto p-1.5"
      >
        {GROUPS.map((g) => [
          <div
            key={`${g.id}-heading`}
            ref={(el) => {
              if (el) groupRefs.current.set(g.id, el);
              else groupRefs.current.delete(g.id);
            }}
            className="col-span-8 px-0.5 pb-0.5 pt-1.5 font-mono text-[11px] text-ink-mute first:pt-0.5"
          >
            {g.label}
          </div>,
          ...g.emoji.map(({ emoji, name }) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onPick(emoji)}
              aria-label={name}
              aria-pressed={emoji === value}
              className={`flex aspect-square items-center justify-center rounded text-[24px] ${EMOJI_FONT_CLASS} ${
                emoji === value ? 'bg-cream-deep ring-1 ring-ink' : ''
              }`}
            >
              {emoji}
            </button>
          )),
        ])}
      </div>
    </div>
  );
}
