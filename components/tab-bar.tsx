'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { BookIcon, HomeIcon, MessageIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { countUnreadMessages } from '@/lib/supabase/queries';

const TABS = [
  { id: 'feed', label: 'Feed', href: '/feed', icon: HomeIcon, active: (p: string) => p === '/feed' },
  { id: 'discover', label: 'Discover', href: '/discover', icon: SearchIcon, active: (p: string) => p === '/discover' },
  { id: 'new', label: 'New', href: '/new', icon: PlusIcon, active: (p: string) => p.startsWith('/new') },
  { id: 'messages', label: 'Messages', href: '/messages', icon: MessageIcon, active: (p: string) => p.startsWith('/messages') },
  { id: 'cookbook', label: 'Cookbook', href: '/me', icon: BookIcon, active: (p: string) => p === '/me' },
] as const;

// Persistent bottom nav — icons only, no labels. Austere by design: no
// pill highlight, just a small dot under the active tab and a color shift
// on the icon itself. Every tab gets the same treatment, "New" included —
// it only highlights when its own section is active, like the rest.
export function TabBar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (profile) countUnreadMessages(profile.id).then(setUnreadMessages);
  }, [profile, pathname]);

  // The whole app is signed-in only (see AuthGate) — nothing to navigate to
  // while signed out, so there's nothing to show here either.
  if (!user) return null;

  return (
    <nav className="flex flex-shrink-0 items-stretch justify-around gap-1 border-t border-rule bg-cream px-4 pb-5 pt-2.5 print:hidden">
      {TABS.map((tab) => {
        const isActive = tab.active(pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-label={tab.label}
            className="relative flex flex-1 flex-col items-center gap-1.5 pt-1.5"
          >
            <Icon size={20} className={isActive ? 'text-ink' : 'text-ink-mute'} />
            <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-ink' : 'bg-transparent'}`} />
            {tab.id === 'messages' && unreadMessages > 0 && (
              <span className="absolute right-[26%] top-0 h-[7px] w-[7px] rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
