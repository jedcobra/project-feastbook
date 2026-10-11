// Turns an image of a cut-out (an iPhone "Copy subject", or any PNG with a
// see-through background) into a small sticker: transparent edges trimmed
// so the subject fills its space, scaled down, saved as PNG so the
// transparency survives.

const SCAN_MAX = 1024; // decode no bigger than this before scanning pixels
const OUT_MAX = 320; // the sticker's longest side
const ALPHA_EDGE = 12; // pixels fainter than this count as background

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

export async function prepareSticker(
  blob: Blob,
): Promise<{ file: File; transparent: boolean } | { error: string }> {
  if (!blob.type.startsWith('image/')) return { error: 'That’s not an image.' };
  let img: HTMLImageElement;
  try {
    img = await loadImage(blob);
  } catch {
    return { error: 'Couldn’t open that image — try a PNG.' };
  }

  const scale = Math.min(1, SCAN_MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const scan = document.createElement('canvas');
  scan.width = w;
  scan.height = h;
  const ctx = scan.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { error: 'Couldn’t open that image — try again.' };
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Bounds of everything that isn't background, and whether there's any
  // see-through background at all.
  let top = h;
  let left = w;
  let right = -1;
  let bottom = -1;
  let transparent = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a < 250) transparent = true;
      if (a > ALPHA_EDGE) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return { error: 'That image is completely see-through.' };

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;
  const outScale = Math.min(1, OUT_MAX / Math.max(cropW, cropH));
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(cropW * outScale));
  out.height = Math.max(1, Math.round(cropH * outScale));
  const outCtx = out.getContext('2d');
  if (!outCtx) return { error: 'Couldn’t open that image — try again.' };
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(scan, left, top, cropW, cropH, 0, 0, out.width, out.height);

  const png = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'));
  if (!png) return { error: 'Couldn’t save that sticker — try again.' };
  return { file: new File([png], 'sticker.png', { type: 'image/png' }), transparent };
}
