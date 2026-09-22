import type { FeedScope } from '@/lib/supabase/queries';

const TABS: { id: FeedScope; label: string }[] = [
  { id: 'for-you', label: 'For you' },
  { id: 'following', label: 'Following' },
];

export function FeedTabs({ scope, onChange }: { scope: FeedScope; onChange: (scope: FeedScope) => void }) {
  return (
    <div className="flex flex-shrink-0 gap-1.5 px-5 pb-2.5">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-button border border-ink py-1.5 font-mono text-[11.5px] font-semibold ${
            scope === t.id ? 'bg-ink text-cream' : 'bg-transparent text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
