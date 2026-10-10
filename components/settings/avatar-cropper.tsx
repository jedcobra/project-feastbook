'use client';

import { useEffect, useRef, useState } from 'react';

const BOX = 280; // preview viewport, CSS px
const OUTPUT = 480; // exported square image size, px
const MAX_ZOOM = 3;

interface AvatarCropperProps {
  file: File;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}

// A minimal pan-and-zoom cropper — drag to reposition, slider to zoom, the
// circular mask previews exactly what gets exported. No library: the image
// is always scaled to at least cover the box, and position is clamped so
// it can never show a gap, same as a native photo picker's crop step.
export function AvatarCropper({ file, onCancel, onCropped }: AvatarCropperProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const dragRef = useRef<{ startX: number; startY: number; left: number; top: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const baseScale = natural ? Math.max(BOX / natural.w, BOX / natural.h) : 1;
  const displayScale = baseScale * zoom;
  const dispW = natural ? natural.w * displayScale : 0;
  const dispH = natural ? natural.h * displayScale : 0;

  const clamp = (left: number, top: number, w: number, h: number) => ({
    left: Math.min(0, Math.max(BOX - w, left)),
    top: Math.min(0, Math.max(BOX - h, top)),
  });

  const handleLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNatural({ w, h });
    const scale = Math.max(BOX / w, BOX / h);
    setPos({ left: (BOX - w * scale) / 2, top: (BOX - h * scale) / 2 });
  };

  const handleZoom = (next: number) => {
    setZoom(next);
    if (!natural) return;
    const newScale = baseScale * next;
    const newW = natural.w * newScale;
    const newH = natural.h * newScale;
    setPos((p) => {
      // Keep whatever image point is currently centered in the box still
      // centered after the resize, rather than growing from the corner.
      const oldW = natural.w * baseScale * zoom;
      const oldH = natural.h * baseScale * zoom;
      const fracX = (BOX / 2 - p.left) / oldW;
      const fracY = (BOX / 2 - p.top) / oldH;
      return clamp(BOX / 2 - fracX * newW, BOX / 2 - fracY * newH, newW, newH);
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, left: pos.left, top: pos.top };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos(clamp(dragRef.current.left + dx, dragRef.current.top + dy, dispW, dispH));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleUse = () => {
    const img = imgRef.current;
    if (!natural || !img) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = OUTPUT / BOX;
    ctx.drawImage(img, pos.left * ratio, pos.top * ratio, dispW * ratio, dispH * ratio);
    canvas.toBlob((blob) => blob && onCropped(blob), 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-column flex-col justify-end bg-ink/40" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4">
        <h3 className="mb-3 font-display text-[17px] font-bold text-ink">Crop photo</h3>
        <div
          className="relative mx-auto touch-none overflow-hidden rounded-full border border-ink bg-cream-deep"
          style={{ width: BOX, height: BOX }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={handleLoad}
              className="absolute max-w-none select-none"
              style={{ left: pos.left, top: pos.top, width: dispW || undefined, height: dispH || undefined }}
            />
          )}
        </div>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => handleZoom(Number(e.target.value))}
          disabled={!natural}
          className="mt-4 w-full"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-button border border-ink bg-transparent py-2.5 font-mono text-[14px] text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUse}
            disabled={!natural}
            className="flex-1 rounded-button border border-ink bg-ink py-2.5 font-mono text-[14px] font-semibold text-cream disabled:opacity-60"
          >
            Use photo
          </button>
        </div>
      </div>
    </div>
  );
}
