'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { CameraIcon, ChevronIcon, LinkIcon, PencilIcon, WandIcon } from '@/components/icons';
import { outlineBoxClasses } from '@/components/outline-box';
import { TopBar } from '@/components/top-bar';
import { draftFromImport, listUnstartedDrafts, saveDraft } from '@/lib/recipe-draft';
import { importRecipeFromUrl } from '@/lib/recipe-import';

const SECONDARY_ROWS = [
  {
    icon: PencilIcon,
    title: 'Type it out',
    sub: 'Blank page. Your words, your measurements.',
    href: '/new/edit?source=manual',
  },
  {
    icon: WandIcon,
    title: 'Paste a recipe',
    sub: 'Copied from a note, an email, anywhere — we sort it out.',
    href: '/new/paste',
  },
  {
    icon: CameraIcon,
    title: 'Photograph a card',
    sub: 'Handwritten card or a page from a book.',
    href: '/new/edit?source=photo',
  },
];

// Entry picker — link paste leads, three secondary routes sit beneath a
// dashed "or" divider. Photographing a card still just opens the blank
// composer (its OCR parser didn't read well enough and was pulled).
export function EntryScreen() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [url, setUrl] = useState('');
  const [draftCount, setDraftCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    setDraftCount(listUnstartedDrafts().length);
  }, []);

  const fetchRecipe = async () => {
    const trimmed = url.trim();
    if (!trimmed || importing) return;
    setImportError(null);
    setImporting(true);
    const result = await importRecipeFromUrl(trimmed);
    setImporting(false);

    if (result.ok) {
      const draft = draftFromImport(result.recipe, 'link', result.sourceUrl);
      saveDraft(draft);
      router.push(`/new/edit?draft=${draft.id}`);
      return;
    }

    if (result.reason === 'invalid-url') {
      setImportError('That doesn’t look like a web address.');
      return;
    }
    if (result.reason === 'blocked') {
      setImportError('Can’t fetch that address.');
      return;
    }

    // fetch-failed or no-recipe: hand off to the import-failed screen with
    // whatever we recovered, and a draft already seeded so "fill in it
    // yourself" has somewhere real to land.
    const seeded = draftFromImport(
      { title: result.partial?.title, subtitle: result.partial?.description },
      'link',
      result.sourceUrl ?? trimmed,
    );
    saveDraft(seeded);
    const params = new URLSearchParams({ reason: result.reason, draft: seeded.id, url: result.sourceUrl ?? trimmed });
    if (result.partial?.title) params.set('title', result.partial.title);
    if (result.partial?.host) params.set('host', result.partial.host);
    router.push(`/new/import-failed?${params.toString()}`);
  };

  if (loading) {
    return (
      <>
        <TopBar title="New recipe" backHref="/me" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <TopBar title="New recipe" backHref="/me" />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="font-mono text-[13px] leading-relaxed text-ink-mute">
            Sign in to add a recipe to your cookbook.
          </p>
          <Link
            href="/account"
            className="rounded-button border border-ink bg-ink px-5 py-2.5 font-mono text-[13px] font-semibold text-cream"
          >
            Sign in / Create account
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="New recipe"
        backHref="/me"
        trailing={
          <Link href="/new/drafts" className={outlineBoxClasses(true)}>
            Drafts · {draftCount}
          </Link>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-[18px] border border-ink p-4">
          <div className="mb-2 font-display text-caps font-bold uppercase text-ink">
            Import from a link
          </div>
          <div className="mb-3 flex items-center gap-2 border-b border-dashed border-rule pb-2">
            <LinkIcon size={14} className="flex-shrink-0 text-ink-mute" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a recipe URL…"
              className="min-w-0 flex-1 border-none bg-transparent font-mono text-[12px] text-ink placeholder:text-ink-mute focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={fetchRecipe}
            disabled={!url.trim() || importing}
            className="w-full rounded-button border border-ink bg-ink py-2.5 font-mono text-[13px] font-semibold text-cream disabled:opacity-50"
          >
            {importing ? 'Fetching…' : 'Fetch recipe'}
          </button>
          {importError && <div className="mt-2 font-mono text-[11px] text-accent">{importError}</div>}
          <div className="mt-2 font-mono text-[10px] leading-relaxed text-ink-mute">
            We pull the ingredients and method, then you confirm every field before it saves.
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex-1 border-t border-dashed border-rule" />
          <span className="font-mono text-[10px] text-ink-mute">or</span>
          <div className="flex-1 border-t border-dashed border-rule" />
        </div>

        {SECONDARY_ROWS.map((row, i) => (
          <Link
            key={row.title}
            href={row.href}
            className={`flex w-full items-center gap-3 border-b border-dashed border-rule py-3.5 text-left ${
              i === 0 ? 'border-t' : ''
            }`}
          >
            <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center border border-ink">
              <row.icon size={16} className="text-ink" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-px block font-display text-[15px] font-bold text-ink">{row.title}</span>
              <span className="block font-mono text-[11px] text-ink-mute">{row.sub}</span>
            </span>
            <ChevronIcon size={15} className="flex-shrink-0 text-ink-mute" />
          </Link>
        ))}
      </div>
    </>
  );
}
