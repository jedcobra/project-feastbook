import { NextResponse } from 'next/server';
import { safeFetchText } from '@/lib/server/safe-fetch';
import { extractPartialMeta, parseRecipeFromHtml } from '@/lib/server/recipe-parser';

// Requires Node's dns/net modules for the SSRF guard in safeFetchText —
// not available on the Edge runtime.
export const runtime = 'nodejs';

export async function POST(request: Request) {
  let rawUrl = '';
  try {
    const body = await request.json();
    rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid-url' }, { status: 400 });
  }
  if (!rawUrl) {
    return NextResponse.json({ ok: false, reason: 'invalid-url' }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(rawUrl)) rawUrl = `https://${rawUrl}`;

  const fetched = await safeFetchText(rawUrl);
  if (!fetched.ok) {
    return NextResponse.json({ ok: false, reason: fetched.reason });
  }

  const recipe = parseRecipeFromHtml(fetched.text);
  if (recipe) {
    return NextResponse.json({ ok: true, recipe, sourceUrl: fetched.finalUrl });
  }

  const partial = extractPartialMeta(fetched.text);
  let host: string | undefined;
  try {
    host = new URL(fetched.finalUrl).hostname.replace(/^www\./, '');
  } catch {
    host = undefined;
  }
  return NextResponse.json({
    ok: false,
    reason: 'no-recipe',
    partial: { ...partial, host },
    sourceUrl: fetched.finalUrl,
  });
}
