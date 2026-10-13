// Client wrapper around /api/import — the actual fetch-and-parse happens
// server-side (see lib/server/recipe-parser.ts) since a browser can't
// reliably fetch arbitrary third-party pages itself (CORS) and shouldn't be
// the one deciding what's safe to fetch anyway.

import { track } from '@/lib/analytics';

export interface ImportedRecipe {
  title: string;
  subtitle: string;
  intro: string;
  time: string;
  serves: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
}

export type ImportFailureReason = 'invalid-url' | 'blocked' | 'fetch-failed' | 'no-recipe';

export type ImportResult =
  | { ok: true; recipe: ImportedRecipe; sourceUrl: string }
  | {
      ok: false;
      reason: ImportFailureReason;
      partial?: { title?: string; description?: string; host?: string };
      sourceUrl?: string;
    };

export async function importRecipeFromUrl(url: string): Promise<ImportResult> {
  let result: ImportResult;
  try {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    result = (await res.json()) as ImportResult;
  } catch {
    result = { ok: false, reason: 'fetch-failed' };
  }
  // The site's host (not the full URL) shows which recipe sites the parser
  // handles badly, which is where import fixes pay off most.
  const host = hostOf(result.ok ? result.sourceUrl : result.sourceUrl ?? url);
  if (result.ok) track('recipe_import_succeeded', { host });
  else track('recipe_import_failed', { host, reason: result.reason });
  return result;
}

function hostOf(url: string): string | undefined {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
