'use client';

import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper, { type Area } from 'react-easy-crop';

// What a photo is for decides the crop it gets: a profile photo is a
// circle, a shelf cover a square, and everything else (recipe and step
// photos, notes, messages, cooked dishes) starts as the photo's own shape
// with square and the common ratios a tap away.
export type CropShape = 'avatar' | 'square' | 'free';

type Ratio = { label: string; value: number | 'original' };
const FREE_RATIOS: Ratio[] = [
  { label: 'Original', value: 'original' },
  { label: 'Square', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

// Longest side of the saved image: plenty for a full-screen look on a
// phone, and it keeps uploads well under the 8MB limit.
const MAX_SIDE: Record<CropShape, number> = { avatar: 640, square: 1600, free: 2048 };

// Opens the cropper for a picked file and resolves with the cropped image,
// or null if the person cancels. Render `cropper` somewhere in the
// component; it's portalled to <body> so it sits above any sheet.
export function useImageCrop() {
  const [job, setJob] = useState<{ file: File; shape: CropShape; resolve: (file: File | null) => void } | null>(
    null,
  );

  const cropImage = useCallback(
    (file: File, shape: CropShape) => new Promise<File | null>((resolve) => setJob({ file, shape, resolve })),
    [],
  );

  const finish = (file: File | null) => {
    job?.resolve(file);
    setJob(null);
  };

  const cropper = job ? (
    <ImageCropper key={`${job.file.name}-${job.file.lastModified}`} file={job.file} shape={job.shape} onDone={finish} />
  ) : null;

  return { cropImage, cropper };
}

function ImageCropper({
  file,
  shape,
  onDone,
}: {
  file: File;
  shape: CropShape;
  onDone: (file: File | null) => void;
}) {
  const [src] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [ratio, setRatio] = useState<Ratio['value']>(shape === 'free' ? 'original' : 1);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const areaRef = useRef<Area | null>(null);

  const aspect = ratio === 'original' ? (natural ? natural.width / natural.height : 1) : ratio;

  const close = (result: File | null) => {
    URL.revokeObjectURL(src);
    onDone(result);
  };

  const use = async () => {
    const area = areaRef.current;
    if (!area) return close(file);
    setSaving(true);
    const img = new Image();
    img.src = src;
    try {
      await img.decode();
    } catch {
      return close(file);
    }
    const scale = Math.min(1, MAX_SIDE[shape] / Math.max(area.width, area.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(area.width * scale));
    canvas.height = Math.max(1, Math.round(area.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return close(file);
    // A see-through PNG would otherwise turn black as a JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    const name = file.name.replace(/\.[^.]+$/, '') || 'photo';
    close(blob ? new File([blob], `${name}.jpg`, { type: 'image/jpeg' }) : file);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 mx-auto flex max-w-column flex-col justify-end bg-night/50"
      onClick={(e) => {
        e.stopPropagation();
        if (!saving) close(null);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crop photo"
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
      >
        <h3 className="mb-3 font-display text-[17px] font-bold text-ink">Crop photo</h3>

        <div className="relative h-[min(52dvh,340px)] overflow-hidden rounded-button bg-night">
          {failed ? (
            <div className="flex h-full items-center justify-center px-6 text-center font-mono text-[13px] leading-[1.5] text-paper">
              This photo can&rsquo;t be previewed here to crop it, but it can still be used as it is.
            </div>
          ) : (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              minZoom={1}
              maxZoom={4}
              cropShape={shape === 'avatar' ? 'round' : 'rect'}
              showGrid={false}
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => {
                areaRef.current = pixels;
              }}
              onMediaLoaded={(size) => setNatural({ width: size.naturalWidth, height: size.naturalHeight })}
              mediaProps={{ onError: () => setFailed(true) }}
              style={{ cropAreaStyle: { border: '1.5px solid rgba(255,255,255,0.9)' } }}
            />
          )}
        </div>

        {shape === 'free' && !failed && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FREE_RATIOS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  setRatio(r.value);
                  setCrop({ x: 0, y: 0 });
                }}
                aria-pressed={ratio === r.value}
                className={`rounded border border-ink px-2 py-[3px] font-mono text-[12px] ${
                  ratio === r.value ? 'bg-ink text-cream' : 'bg-transparent text-ink'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {!failed && (
          <>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="mt-3.5 w-full accent-ink"
            />
            <div className="mt-1 font-mono text-[11px] text-ink-mute">Drag to move · pinch or slide to zoom</div>
          </>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => close(null)}
            disabled={saving}
            className="flex-1 rounded-button border border-ink bg-transparent py-2.5 font-mono text-[14px] text-ink disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={failed ? () => close(file) : use}
            disabled={saving || (!failed && !natural)}
            className="flex-1 rounded-button border border-ink bg-ink py-2.5 font-mono text-[14px] font-semibold text-cream disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Use photo'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
