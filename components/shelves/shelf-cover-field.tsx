'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { CameraIcon } from '@/components/icons';
import { useImageCrop } from '@/components/image-cropper';
import { Label } from '@/components/label';
import { STICKER_CLASS } from '@/components/shelves/shelf-icon';
import { EMOJI_FONT_CLASS, FLAG_EMOJI, FOOD_EMOJI } from '@/lib/shelf-emoji';
import { uploadPhoto } from '@/lib/supabase/storage';

export interface ShelfCover {
  emoji: string | null;
  coverUrl: string | null;
  stickerUrl: string | null;
}

const NONE: ShelfCover = { emoji: null, coverUrl: null, stickerUrl: null };

export interface ShelfRecipePhoto {
  id: string;
  title: string;
  url: string;
}

type Panel = 'emoji' | 'photo';

// A shelf's icon: an emoji (food or flag), one of its recipes' photos, or a
// photo of the owner's own. Picking one replaces whichever was there
// (including a sticker from when stickers were offered — one already set
// still shows). Tapping the icon opens a menu of the kinds; choosing one
// opens its picker below. With none chosen the preview is a rounded
// square with a camera, inviting a tap (on the shelf itself it shows the
// recipe count). Recipe photos are only on offer once the shelf has
// recipes with photos; until then, Photo goes straight to uploading one.
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { cropImage, cropper } = useImageCrop();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chosen = !!(value.emoji || value.coverUrl || value.stickerUrl);

  const pick = (cover: ShelfCover) => {
    onChange(cover);
    setPanel(null);
    setError(null);
  };

  const handleFile = async (picked: File | undefined) => {
    if (!picked || !profile || uploading) return;
    // Shelf covers show square, so they're cropped square.
    const file = await cropImage(picked, 'square');
    if (!file) return;
    setError(null);
    setPanel(null);
    setUploading(true);
    const uploaded = await uploadPhoto(profile.id, file, 'shelf-cover');
    setUploading(false);
    if ('error' in uploaded) setError(uploaded.error);
    else onChange({ ...NONE, coverUrl: uploaded.url });
  };

  // The menu closes on any tap outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  // So does an open emoji or photo picker — except a tap on the icon
  // itself, which opens the menu to switch kinds, and while a photo is
  // still uploading.
  useEffect(() => {
    if (!panel || uploading) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !menuRef.current?.contains(target)) setPanel(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [panel, uploading]);

  const choose = (next: Panel | 'remove') => {
    setMenuOpen(false);
    setError(null);
    if (next === 'remove') pick(NONE);
    // With no recipe photos to offer, Photo goes straight to the camera roll.
    else if (next === 'photo' && recipePhotos.length === 0) fileRef.current?.click();
    else setPanel(next);
  };

  const menuItem = (label: string, onClick: () => void, className = 'text-ink') => (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`block w-full border-t border-dashed border-rule px-3 py-2.5 text-left font-mono text-[14px] first:border-t-0 ${className}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mb-[18px]">
      <Label className="mb-2 text-[11px]">Icon</Label>
      <div className="flex items-center gap-3">
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => !uploading && setMenuOpen((o) => !o)}
            aria-label={chosen ? 'Change the icon' : 'Choose an icon'}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center"
          >
            {uploading ? (
              <div className="flex h-full w-full items-center justify-center rounded-button border border-dashed border-ink font-mono text-[12px] text-ink-mute">
                …
              </div>
            ) : value.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.coverUrl} alt="" className="h-full w-full rounded-button object-cover" />
            ) : value.stickerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.stickerUrl} alt="" className={`h-full w-full p-px ${STICKER_CLASS}`} />
            ) : value.emoji ? (
              <span className={`text-[34px] ${EMOJI_FONT_CLASS}`}>{value.emoji}</span>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-button border border-ink text-ink-mute">
                <CameraIcon size={18} />
              </div>
            )}
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full z-10 mt-1.5 w-44 overflow-hidden rounded-button border border-ink bg-cream shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
            >
              {menuItem('Emoji', () => choose('emoji'))}
              {menuItem('Photo', () => choose('photo'))}
                            {chosen && menuItem('Remove', () => choose('remove'), 'text-accent')}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 font-mono text-[12px] leading-[1.5] text-ink-mute">
          {uploading
            ? 'Uploading your photo…'
            : chosen
              ? 'Shows beside the cookbook’s name. Tap it to change.'
              : 'Optional. Tap to add an emoji or photo.'}
        </div>
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

      <div ref={panelRef}>
        {panel === 'emoji' && <EmojiGrid value={value.emoji} onPick={(emoji) => pick({ ...NONE, emoji })} />}
        {panel === 'photo' && (
          <div className="mt-2.5 border border-dashed border-rule p-1.5">
            <div className="px-0.5 pb-1.5 pt-0.5 font-mono text-[11px] text-ink-mute">
              From this cookbook&rsquo;s recipes
            </div>
            <div className="grid max-h-[196px] grid-cols-4 gap-1.5 overflow-y-auto">
              {recipePhotos.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => pick({ ...NONE, coverUrl: r.url })}
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
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-1.5 w-full rounded-button border border-ink py-2 font-mono text-[13px] text-ink disabled:opacity-60"
            >
              Upload a photo
            </button>
          </div>
        )}
      </div>
      {error && <div className="mt-2 font-mono text-[12px] text-accent">{error}</div>}
      {cropper}
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
