import Link from 'next/link';
import { Label } from '@/components/label';

const WAYS_TO_START = [
  { n: '01', t: 'Paste a link', s: 'From any recipe site. We pull the fields, you confirm them.' },
  { n: '02', t: 'Photograph a card', s: 'A handwritten card, or a page from a book you own.' },
  { n: '03', t: 'Type it out', s: 'A blank page, if you already know it by heart.' },
];

// Shown in place of the cookbook (7h) when the user hasn't authored anything
// yet — a blank ruled page rather than a bare "no recipes" message.
export function EmptyCookbook({ name }: { name: string }) {
  return (
    <div className="px-5 pb-8">
      <div className="mb-5 border border-ink px-[22px] pb-7 pt-[22px] text-center">
        <div className="mb-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
          The cookbook of
        </div>
        <h1 className="mb-1.5 font-display text-[26px] font-bold text-ink">{name}</h1>
        <div className="mb-5 font-mono text-[12px] leading-relaxed text-ink-mute">Nothing in it yet.</div>
        <div className="mb-[22px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[22px] border-b border-dashed border-rule"
              style={{ opacity: 1 - i * 0.18 }}
            />
          ))}
        </div>
        <Link
          href="/new"
          className="block w-full rounded-button border border-ink bg-ink py-3 font-mono text-[13px] font-semibold text-cream"
        >
          Add your first recipe
        </Link>
      </div>

      <Label className="mb-2.5">Three ways to start</Label>
      {WAYS_TO_START.map((w, i) => (
        <Link
          key={w.n}
          href="/new"
          className={`flex gap-3 border-b border-dashed border-rule py-3 ${i === 0 ? 'border-t' : ''}`}
        >
          <span className="w-5 flex-shrink-0 pt-0.5 font-mono text-[11px] text-ink-mute">{w.n}</span>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 font-display text-[15px] font-bold text-ink">{w.t}</div>
            <div className="font-mono text-[11px] leading-snug text-ink-mute">{w.s}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
