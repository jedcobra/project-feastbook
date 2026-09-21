'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, PencilIcon } from '@/components/icons';
import { TopBar } from '@/components/top-bar';
import { draftFromImport, saveDraft } from '@/lib/recipe-draft';
import { importRecipeFromPhoto } from '@/lib/photo-import';

type Stage = 'pick' | 'reading' | 'failed';

// Photographs a printed page or a handwritten card and reads it with
// Claude's vision API (see /api/photo-import) — far more reliable on both
// print and handwriting than traditional OCR. Always lands in the
// composer for review rather than saving straight through, same as the
// URL importer.
export function PhotoImportScreen() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('pick');

  const handleFile = async (file: File) => {
    setStage('reading');
    const result = await importRecipeFromPhoto(file);
    if (result.ok) {
      const draft = draftFromImport(result.recipe, 'photo');
      saveDraft(draft);
      router.push(`/new/edit?draft=${draft.id}`);
      return;
    }
    console.error('photo import failed', result.reason);
    setStage('failed');
  };

  return (
    <>
      <TopBar title="Photograph a card" backHref="/new" />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
        {/* Two separate inputs rather than one with `capture` — on several
            mobile browsers a captured input jumps straight to the camera
            with no way to pick an existing photo, so the library needs its
            own input with no `capture` attribute at all. */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handleFile(file);
          }}
        />
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handleFile(file);
          }}
        />

        {stage === 'pick' && (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-ink">
              <CameraIcon size={24} className="text-ink" />
            </div>
            <h2 className="mb-2.5 text-balance font-display text-[22px] font-bold text-ink">
              Handwritten card or a printed page
            </h2>
            <div className="mb-5 max-w-[270px] font-mono text-[12.5px] leading-[1.65] text-ink-mute">
              We read the photo with Claude, then you confirm every field before it saves.
            </div>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="mb-2.5 w-full max-w-[220px] rounded-button border border-ink bg-ink px-[22px] py-3 font-mono text-[12.5px] font-semibold text-cream"
            >
              Take a photo
            </button>
            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              className="w-full max-w-[220px] rounded-button border border-ink bg-transparent px-[22px] py-3 font-mono text-[12.5px] font-semibold text-ink"
            >
              Choose from library
            </button>
          </>
        )}

        {stage === 'reading' && (
          <>
            <div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-full border border-ink">
              <CameraIcon size={24} className="text-ink" />
            </div>
            <h2 className="mb-2.5 font-display text-[22px] font-bold text-ink">Reading your photo…</h2>
            <div className="font-mono text-[11.5px] text-ink-mute">This usually takes a few seconds.</div>
          </>
        )}

        {stage === 'failed' && (
          <>
            <h2 className="mb-2.5 font-display text-[22px] font-bold text-ink">Couldn&rsquo;t read that photo</h2>
            <div className="mb-5 max-w-[270px] font-mono text-[12.5px] leading-[1.65] text-ink-mute">
              Not your fault — try a clearer, better-lit shot, or just type it out.
            </div>
            <button
              type="button"
              onClick={() => setStage('pick')}
              className="mb-2.5 inline-block rounded-button border border-ink bg-ink px-[22px] py-3 font-mono text-[12.5px] font-semibold text-cream"
            >
              Try another photo
            </button>
            <button
              type="button"
              onClick={() => router.push('/new/edit?source=manual')}
              className="flex items-center gap-1.5 font-mono text-[12px] text-ink-mute underline decoration-dashed underline-offset-[3px]"
            >
              <PencilIcon size={12} />
              Type it out instead
            </button>
          </>
        )}
      </div>
    </>
  );
}
