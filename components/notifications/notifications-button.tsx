'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { HeartIcon } from '@/components/icons';
import { outlineBoxClasses } from '@/components/outline-box';
import { countUnreadNotifications } from '@/lib/supabase/queries';

// The bell (well, heart, per the design) on Feed's top bar — links to the
// notification center and carries an unread dot.
export function NotificationsButton() {
  const { profile } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (profile) countUnreadNotifications(profile.id).then(setUnread);
  }, [profile]);

  if (!profile) return null;

  return (
    <Link href="/notifications" aria-label="Notifications" className={`relative ${outlineBoxClasses(true)}`}>
      <HeartIcon size={14} />
      {unread > 0 && <span className="absolute -right-1 -top-1 h-[7px] w-[7px] rounded-full bg-accent" />}
    </Link>
  );
}
