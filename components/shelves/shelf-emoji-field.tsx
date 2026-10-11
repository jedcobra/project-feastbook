'use client';

import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/label';
import { EMOJI_FONT_CLASS, FLAG_EMOJI, FOOD_EMOJI } from '@/lib/shelf-emoji';

const GROUPS = [
  { id: 'food', label: 'Food & drink', emoji: FOOD_EMOJI.map((emoji) => ({ emoji, name: emoji })) },
  { id: 'flags', label: 'Flags', emoji: FLAG_EMOJI },
] as const;
type GroupId = (typeof GROUPS)[number]['id'];

// Picks a shelf's icon from the Food & Drink emoji or the country flags,
// all in one scrolling grid like the emoji keyboard. Tap the icon to open
// it; the buttons above jump to where each group starts, and the one for
// the group in view stays highlighted as you scroll. Matching ShelfIcon, a
// chosen emoji stands on its own; with none, the shelf shows its recipe
// count, so an empty rounded square shows "#" as a hint of that.
export function ShelfEmojiField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (emoji: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<GroupId>('food');
  const gridRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<GroupId, HTMLElement>());

  // Opening with an icon already chosen scrolls it into view.
  useEffect(() => {
    const grid = gridRef.current;
    if (!open || !grid || !value) return;
    const selected = grid.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (selected) grid.scrollTop = selected.offsetTop - grid.clientHeight / 2 + selected.offsetHeight / 2;
  }, [open, value]);

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
    <div className="mb-[18px]">
      <Label className="mb-2 text-[11px]">Icon</Label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={value ? `Icon ${value}, change it` : 'Choose an icon'}
          aria-expanded={open}
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center ${
            value ? '' : 'rounded-button border border-ink'
          }`}
        >
          {value ? (
            <span className={`text-[34px] ${EMOJI_FONT_CLASS}`}>{value}</span>
          ) : (
            <span className="font-mono text-[14px] font-semibold text-ink-mute">#</span>
          )}
        </button>
        <div className="min-w-0 flex-1 font-mono text-[12px] leading-[1.5] text-ink-mute">
          {value
            ? 'Shows beside the shelf’s name. Tap it to change.'
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
            {GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => jumpTo(g.id)}
                aria-current={active === g.id ? 'true' : undefined}
                className={`rounded border border-ink px-2 py-[3px] font-mono text-[12px] ${
                  active === g.id ? 'bg-ink text-cream' : 'bg-transparent text-ink'
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
              )),
            ])}
          </div>
        </div>
      )}
    </div>
  );
}
