import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

// Structured recipe extraction from a photographed card, cookbook page, or
// printed recipe — reads both print and handwriting far more reliably than
// traditional OCR. The client always sends a JPEG it's already resized
// down (see lib/photo-import.ts), so this only ever needs to accept one
// media type.
const RecipeSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  time: z.string(),
  serves: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
});

const SYSTEM_PROMPT =
  "Read this photo of a recipe — a printed page, a cookbook, or a handwritten card — and extract its title, ingredients, and method. Put each ingredient and each step in its own array entry, in the order they appear, keeping quantities and units exactly as written. Only fill in a field that's actually visible in the photo; leave anything not present as an empty string or an empty array rather than guessing or inventing content.";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('photo-import: ANTHROPIC_API_KEY is not set');
    return NextResponse.json({ ok: false, reason: 'not-configured' }, { status: 500 });
  }

  let image = '';
  try {
    const body = await request.json();
    image = typeof body?.image === 'string' ? body.image : '';
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid-image' }, { status: 400 });
  }
  if (!image) {
    return NextResponse.json({ ok: false, reason: 'invalid-image' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  try {
    const message = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: 'Extract the recipe from this photo.' },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(RecipeSchema) },
    });

    if (!message.parsed_output) {
      return NextResponse.json({ ok: false, reason: 'no-recipe' });
    }
    return NextResponse.json({ ok: true, recipe: message.parsed_output });
  } catch (err) {
    console.error('photo-import: claude request failed', err);
    return NextResponse.json({ ok: false, reason: 'request-failed' }, { status: 500 });
  }
}
