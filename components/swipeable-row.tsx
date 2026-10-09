'use client';

import { useRef, useState } from 'react';

export interface SwipeAction {
  label: string;
  onClick: () => void;
  className: string;
}

const ACTION_WIDTH = 72;

// A row that reveals action buttons when dragged left — the swipe-to-act
// pattern from Mail/Messages, built on pointer events (covers touch and
// mouse) rather than a drag library, since it's one gesture on one axis.
export function SwipeableRow({
  children,
  actions,
  open,
  onOpen,
  onClose,
}: {
  children: React.ReactNode;
  actions: SwipeAction[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const startX = useRef<number | null>(null);
  const startedOpen = useRef(false);
  const [dragX, setDragX] = useState<number | null>(null);
  const maxOffset = actions.length * ACTION_WIDTH;

  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startedOpen.current = open;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    const base = startedOpen.current ? -maxOffset : 0;
    setDragX(Math.min(0, Math.max(-maxOffset, base + delta)));
  };

  const finishDrag = () => {
    if (startX.current === null) return;
    startX.current = null;
    const finalX = dragX ?? (startedOpen.current ? -maxOffset : 0);
    setDragX(null);
    if (finalX < -maxOffset / 2) onOpen();
    else onClose();
  };

  const translate = dragX !== null ? dragX : open ? -maxOffset : 0;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            style={{ width: ACTION_WIDTH }}
            onClick={() => {
              onClose();
              a.onClick();
            }}
            className={`flex items-center justify-center font-mono text-[11px] font-semibold text-cream ${a.className}`}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={(e) => {
          if (open) {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
        style={{
          transform: `translateX(${translate}px)`,
          transition: dragX !== null ? 'none' : 'transform 200ms ease-out',
          touchAction: 'pan-y',
        }}
        className="relative bg-cream"
      >
        {children}
      </div>
    </div>
  );
}
