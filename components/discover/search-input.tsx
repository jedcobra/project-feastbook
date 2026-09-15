import { SearchIcon } from '@/components/icons';

// Search isn't designed yet (no results state) — this stays a plain
// text field for now, styled to match, with no search wired up.
export function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-button border border-ink bg-cream-surface px-2.5 py-2">
      <input
        type="text"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-ink placeholder:text-ink-mute focus:outline-none"
      />
      <SearchIcon size={14} className="flex-shrink-0 text-ink-mute" />
    </div>
  );
}
