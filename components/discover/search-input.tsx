import Link from 'next/link';
import { SearchIcon } from '@/components/icons';

// Tapping this opens the dedicated search screen rather than searching
// inline — matches prototype/ss-discover.jsx's diff wrapping the input in
// an onOpenSearch handler.
export function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <Link href="/search" className="mb-5 flex items-center gap-2 rounded-button border border-ink bg-cream-surface px-2.5 py-2">
      <span className="min-w-0 flex-1 font-mono text-[12px] text-ink-mute">{placeholder}</span>
      <SearchIcon size={14} className="flex-shrink-0 text-ink-mute" />
    </Link>
  );
}
