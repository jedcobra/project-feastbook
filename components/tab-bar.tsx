'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { HomeIcon, MessageIcon, PlusIcon, SearchIcon, UserIcon } from '@/components/icons';
import { useGlassDistort } from '@/components/glass';
import { countUnreadMessages } from '@/lib/supabase/queries';

const TABS = [
  { id: 'feed', label: 'Feed', href: '/feed', icon: HomeIcon, active: (p: string) => p === '/feed' },
  { id: 'discover', label: 'Discover', href: '/discover', icon: SearchIcon, active: (p: string) => p === '/discover' },
  { id: 'new', label: 'New', href: '/new', icon: PlusIcon, active: (p: string) => p.startsWith('/new') },
  { id: 'messages', label: 'Messages', href: '/messages', icon: MessageIcon, active: (p: string) => p.startsWith('/messages') },
  { id: 'cookbook', label: 'Profile', href: '/me', icon: UserIcon, active: (p: string) => p === '/me' },
] as const;

// Persistent bottom nav — icons only, no labels — as a floating panel: a
// rounded, softly shadowed bar hovering above the bottom edge, with the
// screen scrolling on underneath it (frosted where it shows through).
// Austere inside: no pill highlight, just a small dot under the active tab
// and a color shift on the icon itself. Every tab gets the same treatment,
// "New" included — it only highlights when its own section is active.
// Screens leave room for it at the end of their scrolling and under any
// bottom bar of their own (globals.css, --tabbar-clearance).
// Every scrolling area on the current screen — not those in a popup — back
// to the top.
function scrollPageToTop() {
  document
    .querySelectorAll<HTMLElement>('[data-tab-shell] .overflow-y-auto')
    .forEach((el) => {
      if (!el.closest('[role="dialog"]') && el.scrollTop > 0) el.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

export function TabBar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const distort = useGlassDistort();

  useEffect(() => {
    if (profile) countUnreadMessages(profile.id).then(setUnreadMessages);
  }, [profile, pathname]);

  // The whole app is signed-in only (see AuthGate) — nothing to navigate to
  // while signed out, so there's nothing to show here either.
  if (!user) return null;

  return (
    <nav
      data-tab-bar
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-[max(14px,env(safe-area-inset-bottom))] print:hidden"
    >
      <div
        className={`glass-panel pointer-events-auto relative flex items-stretch justify-around gap-1 overflow-hidden rounded-full px-3 py-2 ${
          distort ? 'glass-distort' : ''
        }`}
      >
        {TABS.map((tab) => {
          const isActive = tab.active(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-label={tab.label}
              onClick={(e) => {
                // Tapping the tab of the page you're already on takes you
                // back to its top instead of reloading it. (From deeper in
                // a section — a thread, a draft — it goes to the section's
                // own page as usual.)
                if (pathname !== tab.href) return;
                e.preventDefault();
                scrollPageToTop();
              }}
              className="relative flex flex-1 flex-col items-center gap-1.5 pt-1.5"
            >
              <Icon size={20} className={isActive ? 'text-ink' : 'text-ui-mute'} />
              <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-ink' : 'bg-transparent'}`} />
              {tab.id === 'messages' && unreadMessages > 0 && (
                <span className="absolute right-[26%] top-0 h-[7px] w-[7px] rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
