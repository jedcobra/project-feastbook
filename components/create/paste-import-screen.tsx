'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { draftFromImport, saveDraft } from '@/lib/recipe-draft';
import { parseRecipeFromText } from '@/lib/text-import';

// Pastes a block of text — from a note, an email, a text thread, anywhere
// — and sorts it into a title/ingredients/steps draft with the same
// heuristics the (now-removed) photo importer used, minus the OCR step:
// there's no reading to fail here, just structuring, and worst case the
// person just moves a line or two around in the composer afterward.
export function PasteImportScreen() {
  const router = useRouter();
  const [text, setText] = useState('');

  const handleOrganize = () => {
    if (!text.trim()) return;
    const parsed = parseRecipeFromText(text);
    const draft = draftFromImport(parsed, 'paste');
    saveDraft(draft);
    router.push(`/new/edit?draft=${draft.id}`);
  };

  return (
    <>
      <TopBar title="Paste a recipe" backHref="/new" />
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-8">
        <div className="mb-3 mt-3 font-mono text-[11px] leading-relaxed text-ink-mute">
          Copy a recipe from anywhere — a note, an email, a text thread — and paste the whole thing below. We&rsquo;ll
          sort it into a title, ingredients, and steps; you confirm every field before it saves.
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the recipe text here…"
          className="min-h-0 flex-1 resize-none border border-ink bg-cream-surface p-3 font-mono text-[12.5px] leading-relaxed text-ink outline-none placeholder:text-ink-mute"
        />
        <button
          type="button"
          onClick={handleOrganize}
          disabled={!text.trim()}
          className="mt-3.5 w-full rounded-button border border-ink bg-ink py-3 font-mono text-[13px] font-semibold text-cream disabled:opacity-50"
        >
          Organize it
        </button>
      </div>
    </>
  );
}
