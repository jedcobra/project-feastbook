'use client';

import { useState } from 'react';
import { Label } from '@/components/label';
import { EMOJI_FONT_CLASS, FOOD_EMOJI } from '@/lib/food-emoji';

// Picks a shelf's icon from the Food & Drink emoji. Tap the square to open
// the grid; tap one to choose it. With none chosen the shelf shows its
// recipe count, so the empty square shows "#" as a hint of that.
export function ShelfEmojiField({ value, onChange }: { value: string | null; onChange: (emoji: string | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-[18px]">
      <Label className="mb-2 text-[11px]">Icon</Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={value ? `Icon ${value}, change it` : 'Choose an icon'}
          aria-expanded={open}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-ink"
        >
          {value ? (
            <span className={`text-[24px] ${EMOJI_FONT_CLASS}`}>{value}</span>
          ) : (
            <span className="font-mono text-[14px] font-semibold text-ink-mute">#</span>
          )}
        </button>
        <div className="min-w-0 flex-1 font-mono text-[12px] leading-[1.5] text-ink-mute">
          {value ? 'Shows beside the shelf’s name.' : 'Optional. Without one, the shelf shows how many recipes are on it.'}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="flex-shrink-0 font-mono text-[12px] text-ink-mute underline underline-offset-2"
          >
            Remove
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2.5 grid max-h-[232px] grid-cols-8 gap-0.5 overflow-y-auto border border-dashed border-rule p-1.5">
          {FOOD_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              aria-label={emoji}
              aria-pressed={emoji === value}
              className={`flex aspect-square items-center justify-center rounded text-[24px] ${EMOJI_FONT_CLASS} ${
                emoji === value ? 'bg-cream-deep ring-1 ring-ink' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
