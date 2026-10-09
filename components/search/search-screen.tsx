'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/back-button';
import { CookRow } from '@/components/discover/cooks-to-follow';
import { ChevronIcon, SearchIcon, XIcon } from '@/components/icons';
import { Label } from '@/components/label';
import { RecipeThumbnail } from '@/components/recipe/recipe-thumbnail';
import { Tag } from '@/components/tag';
import { parseDurationMinutes } from '@/lib/format';
import { addRecentSearch, clearRecentSearches, listRecentSearches, removeRecentSearch } from '@/lib/search-history';
import { searchAll, type SearchResults } from '@/lib/supabase/queries';

type Scope = 'all' | 'recipes' | 'people' | 'shelves';
type QuickFilter = 'under30' | 'easy';

const TRY_TAGS = ['weeknight', 'sourdough', 'one-pot', 'vegan', 'dessert', 'preserves'];
const EMPTY: SearchResults = { recipes: [], people: [], shelves: [] };

export function SearchScreen({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState<Scope>('all');
  const [filters, setFilters] = useState<Set<QuickFilter>>(new Set());
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(listRecentSearches());
  }, []);

  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults(EMPTY);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchAll(trimmed);
      setResults(res);
      setLoading(false);
      addRecentSearch(trimmed);
      setRecent(listRecentSearches());
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  const toggleFilter = (f: QuickFilter) =>
    setFilters((fs) => {
      const next = new Set(fs);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });

  const recipes = results.recipes.filter((r) => {
    if (filters.has('under30')) {
      const mins = parseDurationMinutes(r.time);
      if (!(mins > 0 && mins <= 30)) return false;
    }
    if (filters.has('easy') && r.difficulty !== 'Easy') return false;
    return true;
  });

  const total = recipes.length + results.people.length + results.shelves.length;
  const showRecipes = scope === 'all' || scope === 'recipes';
  const showPeople = scope === 'all' || scope === 'people';
  const showShelves = scope === 'all' || scope === 'shelves';
  const hasQuery = q.trim().length > 0;

  return (
    <>
      <div className="flex flex-shrink-0 items-center gap-2.5 px-4 pb-2.5 pt-6">
        <BackButton fallbackHref="/discover" />
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-button border border-ink bg-cream-surface px-2.5 py-2">
          <SearchIcon size={14} className="flex-shrink-0 text-ink-mute" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Recipes, cooks, tags, ingredients…"
            className="min-w-0 flex-1 border-none bg-transparent font-mono text-[12.5px] text-ink outline-none placeholder:text-ink-mute"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="flex-shrink-0 text-ink-mute">
              <XIcon size={13} />
            </button>
          )}
        </div>
      </div>

      {hasQuery && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2.5">
          {(
            [
              ['all', `All ${total}`],
              ['recipes', `Recipes ${recipes.length}`],
              ['people', `Cooks ${results.people.length}`],
              ['shelves', `Shelves ${results.shelves.length}`],
            ] as [Scope, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              className={`rounded border border-ink px-2 py-[3px] font-mono text-[11px] ${
                scope === key ? 'bg-ink text-cream' : 'bg-transparent text-ink'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="basis-full" />
          {(
            [
              ['under30', 'under 30'],
              ['easy', 'easy'],
            ] as [QuickFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleFilter(key)}
              className={`rounded border border-dashed px-[7px] py-[2px] font-mono text-[10.5px] ${
                filters.has(key) ? 'border-rule bg-cream-deep text-ink' : 'border-rule text-ink-mute'
              }`}
            >
              {filters.has(key) ? '✓ ' : '+ '}
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {!hasQuery ? (
          <>
            {recent.length > 0 && (
              <div className="mb-1 flex items-baseline border-b border-dashed border-rule pb-1.5">
                <Label className="flex-1">Recent</Label>
                <button
                  type="button"
                  onClick={() => {
                    clearRecentSearches();
                    setRecent([]);
                  }}
                  className="font-mono text-[10.5px] text-ink-mute"
                >
                  Clear
                </button>
              </div>
            )}
            {recent.map((s) => (
              <div key={s} className="flex items-center gap-2.5 border-b border-dotted border-rule py-2.5">
                <button type="button" onClick={() => setQ(s)} className="flex-1 text-left font-mono text-[12.5px] text-ink">
                  {s}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeRecentSearch(s);
                    setRecent(listRecentSearches());
                  }}
                  aria-label={`Remove ${s}`}
                  className="font-mono text-[13px] text-ink-mute"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="mt-6">
              <Label className="mb-2.5">Try</Label>
              <div className="flex flex-wrap gap-1.5">
                {TRY_TAGS.map((t) => (
                  <button key={t} type="button" onClick={() => setQ(t)}>
                    <Tag>{t}</Tag>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : loading ? (
          <div className="py-8 text-center font-mono text-[12px] text-ink-mute">Searching…</div>
        ) : total === 0 ? (
          <div className="mt-2 border border-dashed border-rule p-[22px] text-center">
            <div className="mb-1.5 font-display text-[19px] font-bold text-ink">Nothing for &ldquo;{q}&rdquo;</div>
            <div className="mb-3.5 font-mono text-[12px] leading-[1.55] text-ink-mute">
              Try a different word, or write it yourself.
            </div>
            <Link href="/new" className="inline-block rounded-button border border-ink px-3 py-1.5 font-mono text-[12px] text-ink">
              Write it yourself
            </Link>
          </div>
        ) : (
          <>
            {showRecipes && recipes.length > 0 && (
              <div className="mb-5">
                <Label className="mb-1.5">Recipes</Label>
                {recipes.map((r, i) => (
                  <Link
                    key={r.id}
                    href={`/recipe/${r.id}`}
                    className={`flex items-center gap-2.5 border-t border-dashed border-rule py-[11px] ${i === 0 ? '' : ''}`}
                  >
                    {r.coverPhotoUrl && <RecipeThumbnail src={r.coverPhotoUrl} alt={r.title} size={36} />}
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-0.5 font-display text-[15.5px] font-bold text-ink">{r.title}</h3>
                      <div className="font-mono text-[10.5px] text-ink-mute">
                        @{r.author} · {r.time} · {r.madeIt} cooked
                      </div>
                    </div>
                    <ChevronIcon size={13} className="flex-shrink-0 text-rule" />
                  </Link>
                ))}
              </div>
            )}

            {showPeople && results.people.length > 0 && (
              <div className="mb-5">
                <Label className="mb-1.5">Cooks</Label>
                {results.people.map((p, i) => (
                  <CookRow key={p.id} person={p} first={i === 0} />
                ))}
              </div>
            )}

            {showShelves && results.shelves.length > 0 && (
              <div>
                <Label className="mb-1.5">Shelves</Label>
                {results.shelves.map((sh) => (
                  <Link
                    key={sh.id}
                    href={`/shelf/${sh.id}`}
                    className="flex items-baseline gap-2.5 border-t border-dashed border-rule py-[11px]"
                  >
                    <div className="flex-1">
                      <div className="font-display text-[14px] font-bold text-ink">{sh.title}</div>
                      <div className="font-mono text-[10.5px] text-ink-mute">{sh.subtitle}</div>
                    </div>
                    <span className="font-mono text-[10.5px] text-ink-mute">{sh.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
