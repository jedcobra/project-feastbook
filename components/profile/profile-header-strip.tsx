import Link from 'next/link';
import { ForkIcon } from '@/components/icons';
import { formatCount } from '@/lib/format';
import type { Person, Recipe } from '@/lib/types';

const STRIP_TINTS = ['bg-accent/15', 'bg-accent-2/15', 'bg-accent-3/15', 'bg-highlight/40', 'bg-ink/10'];

// Option 2: no banner/avatar — instead a horizontal strip of recent recipe
// photos up top (the visual interest comes from the food, not a monogram),
// and the stats as three small bordered tiles instead of a plain grid.
export function ProfileHeaderStrip({ person, recipes }: { person: Person; recipes: Recipe[] }) {
  const stats: [string, string, string | null][] = [
    ['Recipes', String(person.recipes), null],
    ['Followers', formatCount(person.followers), `/${person.handle}/followers`],
    ['Following', String(person.following), `/${person.handle}/following`],
  ];

  return (
    <div className="mb-5">
      {recipes.length > 0 && (
        <div className="mb-3.5 flex gap-1.5 overflow-x-auto px-5">
          {recipes.slice(0, 8).map((r, i) => (
            <div key={r.id} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-button border border-ink">
              {r.coverPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.coverPhotoUrl} alt={r.title} className="h-full w-full object-cover" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center ${STRIP_TINTS[i % STRIP_TINTS.length]}`}>
                  <ForkIcon size={16} className="text-ink-mute" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mx-5 border border-ink px-[18px] pb-3.5 pt-[14px]">
        <h1 className="mb-0.5 font-display text-profile-name font-bold text-ink">{person.name}</h1>
        <div className="mb-2.5 font-mono text-meta text-ink-mute">@{person.handle}</div>
        <div className="mb-3.5 font-mono text-[12px] leading-[1.55] text-ink-mute">{person.bio}</div>
        <div className="grid grid-cols-3 gap-2 border-t border-dashed border-rule pt-3.5">
          {stats.map(([label, value, href]) => {
            const inner = (
              <>
                <div className="font-display text-[18px] font-bold text-ink">{value}</div>
                <div className="font-display text-[8.5px] font-bold uppercase tracking-wide text-ink-mute">{label}</div>
              </>
            );
            return href ? (
              <Link key={label} href={href} className="rounded-button border border-dashed border-rule py-2 text-center">
                {inner}
              </Link>
            ) : (
              <div key={label} className="rounded-button border border-dashed border-rule py-2 text-center">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
