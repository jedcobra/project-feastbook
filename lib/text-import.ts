// Turns a freeform block of pasted text — copied from a note, an email, a
// text message, anywhere — into the same shape the URL importer produces,
// so both can feed draftFromImport(). No network call, no parsing that can
// fail: whatever's pasted is already accurate text, the only question is
// how to structure it.

import { parseQuantity } from '@/lib/ingredient-scaling';
import type { ImportedRecipe } from '@/lib/recipe-import';

const INGREDIENT_HEADER = /^ingredients?\s*:?\s*$/i;
const STEP_HEADER = /^(directions?|instructions?|method|steps?|preparation)\s*:?\s*$/i;

function looksLikeIngredient(line: string): boolean {
  return parseQuantity(line) !== null || /^[-•*]\s*\S/.test(line);
}

// Confident about the title (the first real line) and about
// ingredients/steps only when it can find explicit section headers, or —
// failing that — a quantity-led run of lines at the top, since most
// pasted recipes list ingredients before method even without a header.
// Everything else is left for the person to sort out in the composer
// rather than guessed at — a run-on paragraph of method with no line
// breaks, for instance, comes through as one step rather than being
// split at sentence boundaries, since that's a guess this makes no
// attempt at.
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
