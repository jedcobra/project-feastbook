// Scales an ingredient quantity string to a different serving count and/or
// converts it between metric and imperial — on freeform text like "2 cups"
// or "3-4 cloves garlic, minced", not a structured amount+unit field (the
// data model never had one). This can only work on what it can actually
// parse: a leading number, optionally a range, optionally a recognized
// unit word right after it. Anything else ("a pinch", "salt to taste", "1
// onion, diced" past the "1") is returned untouched rather than guessed at.
//
// One real limitation, disclosed rather than hidden: this converts volume
// to volume and weight to weight, never volume to weight. "2 cups flour"
// converts to "480 ml flour" in metric, not "250 g flour" — that would
// need a per-ingredient density table this app doesn't have, and guessing
// one would be worse than not converting.

export type UnitSystem = 'original' | 'metric' | 'imperial';

type Dimension = 'volume' | 'weight';
type UnitSystemOf = 'metric' | 'imperial';

interface UnitDef {
  id: string;
  dimension: Dimension;
  system: UnitSystemOf;
  toBase: number; // 1 of this unit, in the dimension's base (ml for volume, g for weight)
  singular: string;
  plural: string;
}

const UNITS: UnitDef[] = [
  { id: 'tsp', dimension: 'volume', system: 'imperial', toBase: 4.92892, singular: 'tsp', plural: 'tsp' },
  { id: 'tbsp', dimension: 'volume', system: 'imperial', toBase: 14.7868, singular: 'tbsp', plural: 'tbsp' },
  { id: 'flOz', dimension: 'volume', system: 'imperial', toBase: 29.5735, singular: 'fl oz', plural: 'fl oz' },
  { id: 'cup', dimension: 'volume', system: 'imperial', toBase: 236.588, singular: 'cup', plural: 'cups' },
  { id: 'pint', dimension: 'volume', system: 'imperial', toBase: 473.176, singular: 'pint', plural: 'pints' },
  { id: 'quart', dimension: 'volume', system: 'imperial', toBase: 946.353, singular: 'quart', plural: 'quarts' },
  { id: 'gallon', dimension: 'volume', system: 'imperial', toBase: 3785.41, singular: 'gallon', plural: 'gallons' },
  { id: 'ml', dimension: 'volume', system: 'metric', toBase: 1, singular: 'ml', plural: 'ml' },
  { id: 'l', dimension: 'volume', system: 'metric', toBase: 1000, singular: 'L', plural: 'L' },
  { id: 'oz', dimension: 'weight', system: 'imperial', toBase: 28.3495, singular: 'oz', plural: 'oz' },
  { id: 'lb', dimension: 'weight', system: 'imperial', toBase: 453.592, singular: 'lb', plural: 'lbs' },
  { id: 'g', dimension: 'weight', system: 'metric', toBase: 1, singular: 'g', plural: 'g' },
  { id: 'kg', dimension: 'weight', system: 'metric', toBase: 1000, singular: 'kg', plural: 'kg' },
];

const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));
function unit(id: string): UnitDef {
  const u = UNIT_BY_ID.get(id);
  if (!u) throw new Error(`Unknown unit id: ${id}`);
  return u;
}

const ALIASES: Record<string, string> = {
  tsp: 'tsp', tsps: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  tbsp: 'tbsp', tbsps: 'tbsp', tbs: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  cup: 'cup', cups: 'cup', c: 'cup',
  pint: 'pint', pints: 'pint', pt: 'pint',
  quart: 'quart', quarts: 'quart', qt: 'quart',
  gallon: 'gallon', gallons: 'gallon', gal: 'gallon',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml',
  l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  g: 'g', gram: 'g', grams: 'g', gr: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
};

const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 0.25, '½': 0.5, '¾': 0.75,
  '⅓': 1 / 3, '⅔': 2 / 3,
  '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
};
const FRACTION_CLASS = '¼½¾⅓⅔⅛⅜⅝⅞';

function parseLeadingNumber(s: string): { value: number; length: number } | null {
  let m = s.match(new RegExp(`^(\\d+)([${FRACTION_CLASS}])`));
  if (m) return { value: parseInt(m[1], 10) + UNICODE_FRACTIONS[m[2]], length: m[0].length };

  m = s.match(new RegExp(`^([${FRACTION_CLASS}])`));
  if (m) return { value: UNICODE_FRACTIONS[m[1]], length: m[0].length };

  m = s.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (m) {
    const den = parseInt(m[3], 10);
    if (den !== 0) return { value: parseInt(m[1], 10) + parseInt(m[2], 10) / den, length: m[0].length };
  }

  m = s.match(/^(\d+)\/(\d+)/);
  if (m) {
    const den = parseInt(m[2], 10);
    if (den !== 0) return { value: parseInt(m[1], 10) / den, length: m[0].length };
  }

  m = s.match(/^(\d+\.\d+)/);
  if (m) return { value: parseFloat(m[1]), length: m[0].length };

  m = s.match(/^(\d+)/);
  if (m) return { value: parseInt(m[1], 10), length: m[0].length };

  return null;
}

export interface ParsedQuantity {
  amount: number;
  amount2: number | null; // range end, e.g. the 4 in "3-4 cloves"
  unit: UnitDef | null;
  rest: string;
}

// "fl oz" is the one unit that's two words — everything else is matched as
// a single word right after the number.
function matchUnitWord(s: string): { unit: UnitDef; length: number } | null {
  const flOz = s.match(/^\s*fl\.?\s*oz\.?\b/i);
  if (flOz) return { unit: unit('flOz'), length: flOz[0].length };

  const word = s.match(/^\s*([a-zA-Z]+)\.?\b/);
  if (word) {
    const id = ALIASES[word[1].toLowerCase()];
    if (id) return { unit: unit(id), length: word[0].length };
  }
  return null;
}

export function parseQuantity(q: string): ParsedQuantity | null {
  const trimmed = q.trim();
  const first = parseLeadingNumber(trimmed);
  if (!first) return null;

  let pos = first.length;
  let amount2: number | null = null;

  const rangeSep = trimmed.slice(pos).match(/^\s*(?:-|–|to)\s*/i);
  if (rangeSep) {
    const second = parseLeadingNumber(trimmed.slice(pos + rangeSep[0].length));
    if (second) {
      amount2 = second.value;
      pos += rangeSep[0].length + second.length;
    }
  }

  const afterNumber = trimmed.slice(pos);
  const unitMatch = matchUnitWord(afterNumber);
  const matchedUnit = unitMatch?.unit ?? null;
  const rest = unitMatch ? afterNumber.slice(unitMatch.length) : afterNumber;

  return { amount: first.value, amount2, unit: matchedUnit, rest: rest.trimStart() };
}

function pickDisplayUnit(base: number, dimension: Dimension, system: UnitSystemOf): { amount: number; unit: UnitDef } {
  if (dimension === 'volume') {
    if (system === 'metric') {
      return base >= 1000 ? { amount: base / 1000, unit: unit('l') } : { amount: base, unit: unit('ml') };
    }
    if (base < 14.5) return { amount: base / unit('tsp').toBase, unit: unit('tsp') };
    if (base < 60) return { amount: base / unit('tbsp').toBase, unit: unit('tbsp') };
    if (base < 946) return { amount: base / unit('cup').toBase, unit: unit('cup') };
    if (base < 3785) return { amount: base / unit('quart').toBase, unit: unit('quart') };
    return { amount: base / unit('gallon').toBase, unit: unit('gallon') };
  }
  if (system === 'metric') {
    return base >= 1000 ? { amount: base / 1000, unit: unit('kg') } : { amount: base, unit: unit('g') };
  }
  const asOz = base / unit('oz').toBase;
  return asOz >= 16 ? { amount: base / unit('lb').toBase, unit: unit('lb') } : { amount: asOz, unit: unit('oz') };
}

// Converts one already-scaled amount into the requested system. Leaves it
// alone if there's no unit to convert, or it's already in that system, or
// the caller asked to keep the original system.
function convertAmount(amount: number, sourceUnit: UnitDef | null, system: UnitSystem): { amount: number; unit: UnitDef | null } {
  if (!sourceUnit || system === 'original' || sourceUnit.system === system) {
    return { amount, unit: sourceUnit };
  }
  const base = amount * sourceUnit.toBase;
  return pickDisplayUnit(base, sourceUnit.dimension, system);
}

const COMMON_FRACTIONS: [number, string][] = [
  [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [1 / 2, '½'], [2 / 3, '⅔'], [3 / 4, '¾'],
];

// Fraction-friendly — for imperial units and for bare numbers with no unit
// at all (an ingredient count like "eggs" reads more naturally as "2 ½"
// than "2.5" too).
function formatFractional(n: number): string {
  if (n <= 0) return '0';
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.02) return String(whole || n.toFixed(0));
  let best: string | null = null;
  let bestDiff = 0.03;
  for (const [val, sym] of COMMON_FRACTIONS) {
    const diff = Math.abs(frac - val);
    if (diff < bestDiff) {
      best = sym;
      bestDiff = diff;
    }
  }
  if (best) return whole > 0 ? `${whole} ${best}` : best;
  return trimNumber(n, 1);
}

// Decimal — for metric units, which are never written as fractions.
function formatDecimal(n: number): string {
  return n < 10 ? trimNumber(n, 1) : trimNumber(n, 0);
}

function trimNumber(n: number, decimals: number): string {
  const factor = 10 ** decimals;
  return String(Math.round(n * factor) / factor);
}

function formatAmount(n: number, displayUnit: UnitDef | null): string {
  return displayUnit?.system === 'metric' ? formatDecimal(n) : formatFractional(n);
}

function unitLabel(u: UnitDef, amount: number): string {
  return Math.abs(amount - 1) < 0.01 ? u.singular : u.plural;
}

// The one entry point: scales `q` by `scale` (targetServings / originalServings)
// and, if `system` isn't 'original', converts any recognized unit into it.
// Returns `q` completely unchanged if there's no leading number to work with.
export function scaleIngredientText(q: string, scale: number, system: UnitSystem): string {
  const parsed = parseQuantity(q);
  if (!parsed) return q;

  const scaled1 = parsed.amount * scale;
  const converted1 = convertAmount(scaled1, parsed.unit, system);
  const amountText1 = formatAmount(converted1.amount, converted1.unit);

  let amountText = amountText1;
  if (parsed.amount2 != null) {
    const scaled2 = parsed.amount2 * scale;
    const converted2 = convertAmount(scaled2, parsed.unit, system);
    const amountText2 = formatAmount(converted2.amount, converted2.unit);
    amountText = `${amountText1}-${amountText2}`;
  }

  const finalUnit = converted1.unit;
  const unitText = finalUnit ? unitLabel(finalUnit, converted1.amount) : '';
  return [amountText, unitText, parsed.rest].filter(Boolean).join(' ').trim();
}

// Splits one freeform ingredient line ("200g bucatini", "2 cups flour") into
// the separate quantity/name fields the composer and this scaler both
// expect. Used when a line arrives as a single string with no such split
// already done — the URL importer's schema.org ingredients, for one.
// Falls back to putting the whole line in `name` when there's no leading
// number to split on, same honesty rule as everything else here.
export function splitIngredientLine(line: string): { quantity: string; name: string } {
  const parsed = parseQuantity(line);
  if (!parsed) return { quantity: '', name: line.trim() };

  let quantity = formatAmount(parsed.amount, parsed.unit);
  if (parsed.amount2 != null) {
    quantity += `-${formatAmount(parsed.amount2, parsed.unit)}`;
  }
  if (parsed.unit) {
    quantity += ` ${unitLabel(parsed.unit, parsed.amount2 ?? parsed.amount)}`;
  }
  return { quantity, name: parsed.rest || line.trim() };
}
