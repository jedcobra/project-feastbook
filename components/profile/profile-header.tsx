import Link from 'next/link';
import { formatCount } from '@/lib/format';
import type { Person } from '@/lib/types';

// Bordered profile card — name, handle, bio, stats grid. Followers and
// Following open the actual list; Recipes has no separate list of its own
// (that's just the Recipes tab below).
export function ProfileHeader({ person }: { person: Person }) {
  const stats: [string, string, string | null][] = [
    ['Recipes', String(person.recipes), null],
    ['Followers', formatCount(person.followers), `/${person.handle}/followers`],
    ['Following', String(person.following), `/${person.handle}/following`],
  ];

  return (
    <div className="mx-5 mb-5 border border-ink px-[18px] pb-3.5 pt-[18px]">
      <h1 className="mb-0.5 font-display text-profile-name font-bold text-ink">{person.name}</h1>
      <div className="mb-2.5 font-mono text-meta text-ink-mute">@{person.handle}</div>
      <div className="mb-3.5 font-mono text-[12px] leading-[1.55] text-ink-mute">{person.bio}</div>
      <div className="grid grid-cols-3 border-t border-dashed border-rule pt-3">
        {stats.map(([label, value, href]) =>
          href ? (
            <Link key={label} href={href} className="text-center">
              <div className="font-display text-[20px] font-bold text-ink">{value}</div>
              <div className="font-display text-[9px] font-bold uppercase tracking-wide text-ink underline decoration-dashed underline-offset-2">
                {label}
              </div>
            </Link>
          ) : (
            <div key={label} className="text-center">
              <div className="font-display text-[20px] font-bold text-ink">{value}</div>
              <div className="font-display text-[9px] font-bold uppercase tracking-wide text-ink">{label}</div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
