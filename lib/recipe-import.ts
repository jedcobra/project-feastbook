// Client wrapper around /api/import — the actual fetch-and-parse happens
// server-side (see lib/server/recipe-parser.ts) since a browser can't
// reliably fetch arbitrary third-party pages itself (CORS) and shouldn't be
// the one deciding what's safe to fetch anyway.

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
  try {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return (await res.json()) as ImportResult;
  } catch {
    return { ok: false, reason: 'fetch-failed' };
  }
}
