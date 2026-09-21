// Client-side OCR for the "photograph a card" import path — runs entirely
// in the browser via Tesseract.js, no server round-trip and no API key.
// It reads clean printed text (a cookbook page) reasonably well; a
// handwritten card is hit-or-miss, same as any OCR engine, which is why
// everything this recovers still goes through the composer for review
// rather than saving straight through.

import { parseQuantity } from '@/lib/ingredient-scaling';
import type { ImportedRecipe } from '@/lib/recipe-import';

export async function recognizeText(file: File, onProgress?: (fraction: number) => void): Promise<string> {
  const { recognize } = await import('tesseract.js');
  const { data } = await recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(m.progress);
    },
  });
  return data.text;
}

const INGREDIENT_HEADER = /^ingredients?\s*:?\s*$/i;
const STEP_HEADER = /^(directions?|instructions?|method|steps?|preparation)\s*:?\s*$/i;

function looksLikeIngredient(line: string): boolean {
  return parseQuantity(line) !== null || /^[-•*]\s*\S/.test(line);
}

// Turns raw OCR text into the same shape the URL importer produces, so
// both feed the same draft-seeding code. Confident about the title (the
// first real line) and about ingredients/steps only when it can find
// explicit section headers, or — failing that — a quantity-led run of
// lines at the top, since most cards list ingredients before method even
// without a header. Anything it's not confident about is left blank for
// the person to fill in themselves rather than guessed at.
export function parseRecipeFromText(text: string): Partial<ImportedRecipe> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return {};

  let i = 0;
  let title = '';
  if (!INGREDIENT_HEADER.test(lines[0]) && !STEP_HEADER.test(lines[0])) {
    title = lines[0];
    i = 1;
  }

  const rest = lines.slice(i);
  const sawHeader = rest.some((l) => INGREDIENT_HEADER.test(l) || STEP_HEADER.test(l));

  const ingredients: string[] = [];
  const steps: string[] = [];

  if (sawHeader) {
    let section: 'none' | 'ingredients' | 'steps' = 'none';
    for (const line of rest) {
      if (INGREDIENT_HEADER.test(line)) {
        section = 'ingredients';
        continue;
      }
      if (STEP_HEADER.test(line)) {
        section = 'steps';
        continue;
      }
      if (section === 'ingredients') ingredients.push(line);
      else if (section === 'steps') steps.push(line);
    }
  } else {
    let inIngredients = true;
    for (const line of rest) {
      if (inIngredients && looksLikeIngredient(line)) {
        ingredients.push(line);
      } else {
        inIngredients = false;
        steps.push(line);
      }
    }
  }

  return { title, ingredients, steps };
}
