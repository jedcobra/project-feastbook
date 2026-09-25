// Keyword-based diet substitution suggestions for the Ingredients block's
// Vegetarian/Vegan toggle — matches a whole word or short phrase in an
// ingredient's name and, if it's a problem for the chosen diet, returns a
// suggested plant-based swap.
//
// This is display-only, exactly like ingredient-scaling's unit conversion:
// it never touches the stored recipe. And it's a heuristic, not a real
// nutrition or recipe engine — keyword matching over a list this size
// can't catch every animal product, doesn't understand quantities or
// technique, and can't tell you a swap needs a different cook time. It's a
// starting point for a substitution, not a rewritten recipe.

export type DietMode = 'original' | 'vegetarian' | 'vegan';

interface Substitution {
  match: RegExp;
  // Skip the match if this also appears — e.g. "milk" shouldn't flag
  // "almond milk", which is already plant-based.
  exceptIfMatches?: RegExp;
  // Suggested swap for a vegetarian diet. Omitted means this ingredient is
  // already vegetarian-safe (dairy, eggs, honey) — only vegan needs one.
  vegetarian?: string;
  vegan: string;
}

// Checked in order, first match wins — compound/specific phrases ("pork
// sausage", "chicken broth") are listed before the generic word they
// contain ("pork", "chicken") so they get the more accurate suggestion.
const SUBSTITUTIONS: Substitution[] = [
  { match: /\bchicken\s+(broth|stock)\b/i, vegetarian: 'vegetable broth', vegan: 'vegetable broth' },
  { match: /\bbeef\s+(broth|stock)\b/i, vegetarian: 'vegetable broth', vegan: 'vegetable broth' },
  { match: /\bfish\s+sauce\b/i, vegetarian: 'soy sauce or vegan fish sauce', vegan: 'soy sauce or vegan fish sauce' },
  {
    match: /\bworcestershire\b/i,
    vegetarian: 'vegan Worcestershire sauce or soy sauce',
    vegan: 'vegan Worcestershire sauce or soy sauce',
  },
  { match: /\bbacon\b/i, vegetarian: 'tempeh bacon or smoked mushrooms', vegan: 'tempeh bacon or smoked mushrooms' },
  {
    match: /\b(pork\s+)?sausages?\b/i,
    vegetarian: 'a plant-based sausage',
    vegan: 'a plant-based sausage',
  },
  { match: /\bham\b/i, vegetarian: 'smoked tofu or tempeh', vegan: 'smoked tofu or tempeh' },
  { match: /\bturkey\b/i, vegetarian: 'tofu or seitan', vegan: 'tofu or seitan' },
  { match: /\blamb\b/i, vegetarian: 'mushrooms or lentils', vegan: 'mushrooms or lentils' },
  {
    match: /\b(salmon|tuna|cod|anchov(?:y|ies)|shrimp|prawns?)\b/i,
    vegetarian: 'hearts of palm, jackfruit, or a plant-based fish alternative',
    vegan: 'hearts of palm, jackfruit, or a plant-based fish alternative',
  },
  { match: /\bgelatin(?:e)?\b/i, vegetarian: 'agar-agar', vegan: 'agar-agar' },
  { match: /\blard\b/i, vegetarian: 'vegetable shortening or coconut oil', vegan: 'vegetable shortening or coconut oil' },
  { match: /\bchicken\b/i, vegetarian: 'tofu, tempeh, or chickpeas', vegan: 'tofu, tempeh, or chickpeas' },
  {
    match: /\b(ground\s+)?(beef|steak)\b/i,
    vegetarian: 'lentils, mushrooms, or a plant-based ground',
    vegan: 'lentils, mushrooms, or a plant-based ground',
  },
  { match: /\bpork\b/i, vegetarian: 'jackfruit or mushrooms', vegan: 'jackfruit or mushrooms' },

  // Dairy, eggs, honey — fine for vegetarian, need a swap for vegan.
  { match: /\bbuttermilk\b/i, vegan: 'plant milk + 1 tsp lemon juice or vinegar' },
  {
    match: /\bmilk\b/i,
    exceptIfMatches: /\b(coconut|almond|soy|soya|oat|rice|cashew|hemp|pea|macadamia|plant)\b/i,
    vegan: 'oat, soy, or almond milk',
  },
  {
    match: /\bbutter\b/i,
    exceptIfMatches: /\b(peanut|almond|cashew|coconut|vegan|nut)\b/i,
    vegan: 'vegan butter or coconut oil',
  },
  {
    match: /\bcheese\b/i,
    exceptIfMatches: /\b(vegan|cashew|nutritional)\b/i,
    vegan: 'vegan cheese or nutritional yeast',
  },
  {
    match: /\b(heavy\s+cream|sour\s+cream|cream)\b/i,
    exceptIfMatches: /\b(coconut|cashew|oat|soy|vegan)\b/i,
    vegan: 'coconut cream or cashew cream',
  },
  {
    match: /\byog(?:h)?urt\b/i,
    exceptIfMatches: /\b(coconut|soy|almond|oat|cashew|vegan|plant)\b/i,
    vegan: 'coconut or soy yogurt',
  },
  { match: /\beggs?\b/i, vegan: '1 tbsp ground flaxseed + 3 tbsp water (per egg)' },
  { match: /\bhoney\b/i, vegan: 'maple syrup or agave' },
  { match: /\bmayonnaise\b/i, vegan: 'vegan mayonnaise' },
];

// Returns the suggested swap for `name` under `mode`, or null if nothing
// in it needs one (either it's already fine, or nothing here recognized
// it — the same "don't guess" honesty as ingredient-scaling).
export function suggestSubstitution(name: string, mode: DietMode): string | null {
  if (mode === 'original' || !name.trim()) return null;
  for (const sub of SUBSTITUTIONS) {
    if (!sub.match.test(name)) continue;
    if (sub.exceptIfMatches?.test(name)) continue;
    return mode === 'vegan' ? sub.vegan : (sub.vegetarian ?? null);
  }
  return null;
}
