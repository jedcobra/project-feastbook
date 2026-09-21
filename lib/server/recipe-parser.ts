// Pulls a schema.org Recipe out of a page's JSON-LD — the same structured
// data most recipe sites already embed for Google's rich-result cards, so
// this reads what the site is already publishing rather than scraping its
// visual layout. No third-party HTML parser: a page's <script> tags are
// regular enough that a couple of regexes get there without the extra
// dependency weight.

export interface ParsedRecipe {
  title: string;
  subtitle: string;
  intro: string;
  time: string;
  serves: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|nbsp|quot|#39|apos);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function asText(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(asText).filter(Boolean).join(', ');
  if (v && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    if (typeof obj.name === 'string') return asText(obj.name);
    if (typeof obj.text === 'string') return asText(obj.text);
  }
  return '';
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch {
      // One malformed block shouldn't sink the whole page.
    }
  }
  return blocks;
}

// JSON-LD nodes can be a bare object, an array of objects, or an object
// carrying an `@graph` array of further objects — flatten all three shapes
// into one list to search.
function flattenLdNodes(node: unknown): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const visit = (n: unknown) => {
    if (Array.isArray(n)) {
      n.forEach(visit);
    } else if (n && typeof n === 'object') {
      const obj = n as Record<string, unknown>;
      out.push(obj);
      if (obj['@graph']) visit(obj['@graph']);
    }
  };
  visit(node);
  return out;
}

function findRecipeNode(blocks: unknown[]): Record<string, unknown> | null {
  for (const block of blocks) {
    for (const node of flattenLdNodes(block)) {
      const type = node['@type'];
      const types = Array.isArray(type) ? type : [type];
      if (types.some((t) => typeof t === 'string' && t.toLowerCase() === 'recipe')) {
        return node;
      }
    }
  }
  return null;
}

function extractIngredients(node: Record<string, unknown>): string[] {
  const raw = node.recipeIngredient ?? node.ingredients;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((x) => stripHtml(asText(x))).filter(Boolean);
}

// recipeInstructions shows up as a plain string, an array of strings, an
// array of HowToStep objects, or HowToSection objects nesting further
// HowToSteps (multi-part recipes) — flatten all of them into a flat list.
function extractInstructions(node: Record<string, unknown>): string[] {
  const raw = node.recipeInstructions;
  if (!raw) return [];
  const out: string[] = [];
  const visit = (x: unknown) => {
    if (typeof x === 'string') {
      stripHtml(x)
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => out.push(s));
      return;
    }
    if (Array.isArray(x)) {
      x.forEach(visit);
      return;
    }
    if (x && typeof x === 'object') {
      const obj = x as Record<string, unknown>;
      if (obj['@type'] === 'HowToSection' && obj.itemListElement) {
        visit(obj.itemListElement);
        return;
      }
      const text = stripHtml(asText(obj.text ?? obj.name));
      if (text) out.push(text);
    }
  };
  visit(raw);
  return out;
}

function extractServes(node: Record<string, unknown>): string {
  const text = asText(node.recipeYield ?? node.yield);
  return text.match(/\d+/)?.[0] ?? '';
}

function extractTags(node: Record<string, unknown>): string[] {
  const text = asText(node.keywords ?? node.recipeCategory);
  return text
    .split(',')
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean)
    .slice(0, 6);
}

// ISO 8601 durations, the subset recipes actually use (PT#H#M, no weeks/years).
function parseIsoDurationMinutes(v: unknown): number {
  if (typeof v !== 'string') return 0;
  const m = v.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return 0;
  const days = parseInt(m[1] ?? '0', 10);
  const hours = parseInt(m[2] ?? '0', 10);
  const mins = parseInt(m[3] ?? '0', 10);
  return days * 24 * 60 + hours * 60 + mins;
}

function formatMinutes(mins: number): string {
  if (mins <= 0) return '';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function extractTime(node: Record<string, unknown>): string {
  const total = parseIsoDurationMinutes(node.totalTime);
  if (total > 0) return formatMinutes(total);
  const sum = parseIsoDurationMinutes(node.cookTime) + parseIsoDurationMinutes(node.prepTime);
  return formatMinutes(sum);
}

// Returns null when the page doesn't have enough of a real recipe to be
// worth pre-filling — a title with no ingredients or no steps is not a
// recipe, it's a blog post, and guessing at the rest would be worse than
// admitting we didn't get it.
export function parseRecipeFromHtml(html: string): ParsedRecipe | null {
  const node = findRecipeNode(extractJsonLdBlocks(html));
  if (!node) return null;

  const title = asText(node.name);
  const ingredients = extractIngredients(node);
  const steps = extractInstructions(node);
  if (!title || ingredients.length === 0 || steps.length === 0) return null;

  return {
    title,
    subtitle: stripHtml(asText(node.description)).slice(0, 160),
    intro: '',
    time: extractTime(node),
    serves: extractServes(node),
    tags: extractTags(node),
    ingredients,
    steps,
  };
}

// The best-effort fallback when there's no Recipe schema at all — just
// enough for the "what we did get" summary on the import-failed screen.
export function extractPartialMeta(html: string): { title?: string; description?: string } {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)?.[1];
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1];
  const title = (ogTitle ?? titleTag)?.trim();
  const description = ogDescription?.trim();
  return {
    title: title ? stripHtml(title) : undefined,
    description: description ? stripHtml(description) : undefined,
  };
}
