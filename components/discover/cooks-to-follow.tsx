import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { Label } from '@/components/label';
import { OutlineBox } from '@/components/outline-box';
import { formatCount } from '@/lib/format';
import type { Person } from '@/lib/types';

export function CooksToFollow({ people }: { people: Person[] }) {
  return (
    <div className="mb-6">
      <Label className="mb-2.5">Cooks to follow</Label>
      {people.map((person, i) => (
        <div
          key={person.id}
          className={`flex items-center gap-2.5 border-b border-dashed border-rule py-3 ${
            i === 0 ? 'border-t' : ''
          }`}
        >
          <Link href={`/${person.handle}`} className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar name={person.name} size={30} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-[15px] font-bold text-ink">{person.name}</div>
              <div className="mt-px font-mono text-meta text-ink-mute">
                {person.recipes} recipes · {formatCount(person.followers)} followers
              </div>
            </div>
          </Link>
          <OutlineBox compact>Follow</OutlineBox>
        </div>
      ))}
    </div>
  );
}
