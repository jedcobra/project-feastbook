'use client';

import { useState } from 'react';
import { Label } from '@/components/label';
import { EMOJI_FONT_CLASS, FLAG_EMOJI, FOOD_EMOJI } from '@/lib/shelf-emoji';

const SETS = {
  food: {
    label: 'Food & drink',
    emoji: FOOD_EMOJI.map((emoji) => ({ emoji, name: emoji })),
  },
  flags: { label: 'Flags', emoji: FLAG_EMOJI },
};
type SetId = keyof typeof SETS;

// Picks a shelf's icon from the Food & Drink emoji or the country flags.
// Tap the square to open the grid, switch between the two sets above it,
// and tap one to choose it. With none chosen the shelf shows its
// recipe count, so the empty square shows "#" as a hint of that.
export function ShelfEmojiField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (emoji: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  // Open on whichever set the current icon came from.
  const [set, setSet] = useState<SetId>(() => (value && FLAG_EMOJI.some((f) => f.emoji === value) ? 'flags' : 'food'));
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
          {value
            ? 'Shows beside the shelf’s name.'
            : 'Optional. Without one, the shelf shows how many recipes are on it.'}
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
        <div className="mt-2.5 border border-dashed border-rule">
          <div className="flex gap-1.5 border-b border-dashed border-rule p-1.5">
            {(Object.keys(SETS) as SetId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSet(id)}
                aria-pressed={set === id}
                className={`rounded border border-ink px-2 py-[3px] font-mono text-[12px] ${
                  set === id ? 'bg-ink text-cream' : 'bg-transparent text-ink'
                }`}
              >
                {SETS[id].label}
              </button>
            ))}
          </div>
          <div className="grid max-h-[232px] grid-cols-8 gap-0.5 overflow-y-auto p-1.5">
            {SETS[set].emoji.map(({ emoji, name }) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setOpen(false);
                }}
                aria-label={name}
                aria-pressed={emoji === value}
                className={`flex aspect-square items-center justify-center rounded text-[24px] ${EMOJI_FONT_CLASS} ${
                  emoji === value ? 'bg-cream-deep ring-1 ring-ink' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
