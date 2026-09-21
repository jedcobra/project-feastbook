'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { PlusIcon } from '@/components/icons';
import { countUnreadMessages } from '@/lib/supabase/queries';

const LEFT_TABS = [
  { id: 'feed', label: 'Feed', href: '/feed' },
  { id: 'discover', label: 'Discover', href: '/discover' },
];
const RIGHT_TABS = [{ id: 'cookbook', label: 'Cookbook', href: '/me' }];

// Persistent bottom nav. Austere by design: mono labels, no pill highlight,
// just a small dot under the active tab. Tapping a tab resets to its root;
// the center "New" button pushes /new instead (see BackButton). "New" gets
// no special always-on treatment — like every other tab, it only highlights
// when its own section is the active one.
export function TabBar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const newActive = pathname.startsWith('/new');
  const messagesActive = pathname.startsWith('/messages');
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (profile) countUnreadMessages(profile.id).then(setUnreadMessages);
  }, [profile, pathname]);

  // The whole app is signed-in only (see AuthGate) — nothing to navigate to
  // while signed out, so there's nothing to show here either.
  if (!user) return null;

  return (
    <nav className="flex flex-shrink-0 items-stretch justify-around gap-1 border-t border-rule bg-cream px-4 pb-5 pt-2.5 print:hidden">
      {LEFT_TABS.map((tab) => (
        <TabLink key={tab.id} href={tab.href} label={tab.label} active={pathname === tab.href} />
      ))}
      <Link
        href="/new"
        aria-label="Add a recipe"
        className="flex flex-1 flex-col items-center gap-1 pt-1.5 font-mono"
      >
        <span
          className={`flex items-center gap-1 text-[12px] ${
            newActive ? 'font-semibold text-ink' : 'font-normal text-ink-mute'
          }`}
        >
          <PlusIcon size={12} weight={2} />
          New
        </span>
        <span className={`h-1 w-1 rounded-full ${newActive ? 'bg-ink' : 'bg-transparent'}`} />
      </Link>
      <Link href="/messages" aria-label="Messages" className="relative flex flex-1 flex-col items-center gap-1 pt-1.5 font-mono">
        <span className={`text-[12px] ${messagesActive ? 'font-semibold text-ink' : 'font-normal text-ink-mute'}`}>
          Messages
        </span>
        <span className={`h-1 w-1 rounded-full ${messagesActive ? 'bg-ink' : 'bg-transparent'}`} />
        {unreadMessages > 0 && (
          <span className="absolute right-[22%] top-0 h-[7px] w-[7px] rounded-full bg-accent" />
        )}
      </Link>
      {RIGHT_TABS.map((tab) => (
        <TabLink key={tab.id} href={tab.href} label={tab.label} active={pathname === tab.href} />
      ))}
    </nav>
  );
}

function TabLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="flex flex-1 flex-col items-center gap-1 pt-1.5 font-mono">
      <span className={`text-[12px] ${active ? 'font-semibold text-ink' : 'font-normal text-ink-mute'}`}>
        {label}
      </span>
      <span className={`h-1 w-1 rounded-full ${active ? 'bg-ink' : 'bg-transparent'}`} />
    </Link>
  );
}
