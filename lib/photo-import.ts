// Client wrapper around /api/photo-import — the actual reading happens
// server-side via Claude's vision API (see that route), since a browser
// can't call the Anthropic API directly without exposing the key. This
// only resizes the photo down to something reasonable before sending it —
// a phone camera shot is often several megabytes, far more than reading
// text needs, and would otherwise cost more (image tokens) and risk
// hitting request size limits.

import type { ImportedRecipe } from '@/lib/recipe-import';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function resizeToJpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', JPEG_QUALITY),
  );
  return blobToBase64(blob);
}

export type PhotoImportFailureReason = 'invalid-image' | 'not-configured' | 'no-recipe' | 'request-failed' | 'client-error';

export type PhotoImportResult =
  | { ok: true; recipe: Partial<ImportedRecipe> }
  | { ok: false; reason: PhotoImportFailureReason };

export async function importRecipeFromPhoto(file: File): Promise<PhotoImportResult> {
  try {
    const image = await resizeToJpeg(file);
    const res = await fetch('/api/photo-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });
    return (await res.json()) as PhotoImportResult;
  } catch (err) {
    console.error('importRecipeFromPhoto', err);
    return { ok: false, reason: 'client-error' };
  }
}
