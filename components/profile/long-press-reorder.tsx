'use client';

import { useEffect, useRef, useState } from 'react';
import { DragIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { moveItem } from '@/lib/cookbook-order';

const LONG_PRESS_MS = 450;
const PRESS_MOVE_TOLERANCE = 8;

// Long press a row to switch a list into reorder mode, then drag rows by
// their handle; every drop that changes the order is reported through
// onReorder. Without onReorder the list never enters reorder mode.
export function useLongPressReorder({
  ids,
  onReorder,
  onStart,
}: {
  ids: string[];
  onReorder?: (ids: string[]) => void;
  onStart?: () => void;
}) {
  // Non-null while reordering: the live order, ahead of what's saved.
  const [reorderIds, setReorderIds] = useState<string[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const idsRef = useRef(ids);
  const reorderIdsRef = useRef<string[] | null>(null);
  const dragStartIds = useRef<string[]>([]);
  const rowEls = useRef(new Map<string, HTMLElement>());
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);

  idsRef.current = ids;
  reorderIdsRef.current = reorderIds;

  // While a row is held, follow the pointer on the window rather than the
  // handle: reordering moves the row's DOM node, which would drop any
  // pointer capture taken on the handle itself.
  useEffect(() => {
    if (!draggingId) return;
    const onMove = (e: PointerEvent) => {
      const current = reorderIdsRef.current;
      if (!current) return;
      let target = 0;
      for (const id of current) {
        if (id === draggingId) continue;
        const rect = rowEls.current.get(id)?.getBoundingClientRect();
        if (rect && rect.top + rect.height / 2 < e.clientY) target++;
      }
      const from = current.indexOf(draggingId);
      if (target !== from) setReorderIds(moveItem(current, from, target));
    };
    const onUp = () => {
      setDraggingId(null);
      const current = reorderIdsRef.current;
      if (current && current.join() !== dragStartIds.current.join()) onReorder?.(current);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [draggingId, onReorder]);

  const clearPress = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };

  useEffect(() => clearPress, []);

  // Spread on the wrapper around each normal (non-reorder) row. Also stops
  // iOS's link preview and Android's context menu from claiming the hold.
  const pressProps = onReorder
    ? {
        onPointerDown: (e: React.PointerEvent) => {
          if (e.button !== 0) return;
          clearPress();
          press.current = {
            x: e.clientX,
            y: e.clientY,
            timer: setTimeout(() => {
              press.current = null;
              onStart?.();
              setReorderIds(idsRef.current);
              navigator.vibrate?.(15);
            }, LONG_PRESS_MS),
          };
        },
        onPointerMove: (e: React.PointerEvent) => {
          const p = press.current;
          if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > PRESS_MOVE_TOLERANCE) clearPress();
        },
        onPointerUp: clearPress,
        onPointerCancel: clearPress,
        onPointerLeave: clearPress,
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
        className: 'select-none [-webkit-touch-callout:none]',
      }
    : {};

  return {
    reorderIds,
    draggingId,
    stop: () => setReorderIds(null),
    pressProps,
    rowRef: (id: string) => (el: HTMLElement | null) => {
      if (el) rowEls.current.set(id, el);
      else rowEls.current.delete(id);
    },
    startDrag: (id: string) => {
      dragStartIds.current = reorderIdsRef.current ?? [];
      setDraggingId(id);
    },
  };
}

export function ReorderBar({ label, onDone }: { label: string; onDone: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-rule py-2.5">
      <span className="font-mono text-meta text-ink-mute">{label}</span>
      <OutlineBox compact filled onClick={onDone}>
        Done
      </OutlineBox>
    </div>
  );
}

export function DragHandle({ label, onStart }: { label: string; onStart: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      data-own-swipe
      onPointerDown={(e) => {
        e.preventDefault();
        // Keep a surrounding swipe-to-delete row from treating the drag as
        // a sideways swipe.
        e.stopPropagation();
        onStart();
      }}
      className="-mr-1 flex-shrink-0 cursor-grab touch-none p-1.5 text-ink-mute active:cursor-grabbing"
    >
      <DragIcon size={16} />
    </button>
  );
}
