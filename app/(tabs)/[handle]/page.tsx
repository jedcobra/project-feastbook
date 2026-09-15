import { redirect } from 'next/navigation';
import { ShareIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { FriendProfileScreen } from '@/components/profile/friend-profile-screen';
import { TopBar } from '@/components/top-bar';
import { supabase } from '@/lib/supabase/client';

// Static export needs every path known at build time. This queries Supabase
// at build time (works in CI, which has real network access); if it can't
// reach Supabase, it falls back to an empty list rather than failing the
// build outright. Real signups made after the last deploy won't have a
// static page yet — a known static-export tradeoff, not a bug.
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('profiles').select('handle');
    if (data && data.length > 0) return data.map((p: { handle: string }) => ({ handle: p.handle }));
  } catch (err) {
    console.warn('generateStaticParams: could not reach Supabase', err);
  }
  return [{ handle: '__placeholder__' }];
}

export default function FriendProfilePage({ params }: { params: { handle: string } }) {
  if (params.handle === 'you') redirect('/me');

  return (
    <>
      <TopBar
        backHref="/feed"
        trailing={
          <OutlineBox compact aria-label="Share">
            <ShareIcon size={14} />
          </OutlineBox>
        }
      />
      <FriendProfileScreen handle={params.handle} />
    </>
  );
}
