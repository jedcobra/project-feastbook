'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { MoreIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { FollowActions } from '@/components/profile/follow-actions';
import { PROFILE_BUTTON_PRIMARY, ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { TopBar } from '@/components/top-bar';
import {
  blockUser,
  fetchCookbookOrder,
  fetchCookedRecipes,
  fetchProfileByHandle,
  isBlockedByMe,
  isFollowing,
  setFollowing,
  unblockUser,
} from '@/lib/supabase/queries';
import type { CookedRecipe, Person, Recipe, Shelf } from '@/lib/types';

export function FriendProfileScreen({ handle }: { handle: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [data, setData] = useState<
    { person: Person; recipes: Recipe[]; shelves: Shelf[] } | null | undefined
  >(undefined);
  const [following, setFollowingState] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cookedRecipes, setCookedRecipes] = useState<CookedRecipe[]>([]);
  const [recipeOrder, setRecipeOrder] = useState<string[]>([]);

  // A link to your own @handle — from a comment, an activity row, search,
  // wherever — should land you on your own Cookbook (with Edit/Share and
  // every tab), not this read-only "someone else's profile" view with a
  // Follow button on it.
  useEffect(() => {
    if (profile && profile.handle === handle.toLowerCase()) {
      router.replace('/me');
    }
  }, [profile, handle, router]);

  useEffect(() => {
    fetchProfileByHandle(handle).then(setData);
  }, [handle]);

  useEffect(() => {
    if (!data) return;
    fetchCookedRecipes(data.person.id).then(setCookedRecipes);
    fetchCookbookOrder(data.person.id).then(setRecipeOrder);
  }, [data]);

  useEffect(() => {
    if (profile && data) {
      isFollowing(profile.id, data.person.id).then(setFollowingState);
      isBlockedByMe(profile.id, data.person.id).then(setBlockedByMe);
    } else {
      setFollowingState(false);
      setBlockedByMe(false);
    }
  }, [profile, data]);

  const toggleFollow = async () => {
    if (!profile || !data) return;
    const next = !following;
    setFollowingState(next);
    const ok = await setFollowing(profile.id, data.person.id, next);
    if (!ok) setFollowingState(!next);
  };

  const shareProfile = async () => {
    if (!data) return;
    setMenuOpen(false);
    const url = `${window.location.origin}/${data.person.handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: data.person.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Cancelled by the person, or clipboard access denied — either way,
      // nothing else to do about it.
    }
  };

  const toggleBlock = async () => {
    if (!profile || !data) return;
    setMenuOpen(false);
    if (blockedByMe) {
      setBlockedByMe(false);
      await unblockUser(profile.id, data.person.id);
    } else {
      setBlockedByMe(true);
      // Blocking drops any existing follow in either direction server-side.
      setFollowingState(false);
      await blockUser(profile.id, data.person.id);
    }
  };

  if (data === undefined || (profile && profile.handle === handle.toLowerCase())) {
    return (
      <>
        <TopBar backHref="/feed" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[14px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (data === null) {
    return (
      <>
        <TopBar backHref="/feed" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[14px] text-ink-mute">No one here by that handle.</span>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        backHref="/feed"
        trailing={
          <OutlineBox compact aria-label="Profile options" onClick={() => setMenuOpen(true)}>
            <MoreIcon size={14} />
          </OutlineBox>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ProfileHeader person={data.person} />
        {profile ? (
          <FollowActions
            personId={data.person.id}
            myId={profile.id}
            following={following}
            onToggleFollow={toggleFollow}
          />
        ) : (
          <div className="flex px-5 pb-4">
            <Link
              href="/account"
              className={PROFILE_BUTTON_PRIMARY}
            >
              Sign in to follow
            </Link>
          </div>
        )}
        <ProfileTabs
          shelves={data.shelves}
          recipes={data.recipes}
          cookedRecipes={cookedRecipes}
          firstName={data.person.name.split(' ')[0]}
          isOwn={false}
          recipeOrder={recipeOrder}
        />
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-20 mx-auto flex max-w-column flex-col justify-end bg-ink/30"
          onClick={() => setMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-t-2xl border-t border-ink bg-cream px-5 pb-6 pt-4"
          >
            <h3 className="mb-3 font-display text-[17px] font-bold text-ink">{data.person.name}</h3>
            <button
              type="button"
              onClick={shareProfile}
              className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[13px] text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[14px] text-ink">
                  {copied ? 'Copied' : 'Share profile'}
                </span>
                <span className="block truncate font-mono text-[12px] text-ink-mute">
                  {`${typeof window !== 'undefined' ? window.location.host : ''}/${data.person.handle}`}
                </span>
              </span>
            </button>
            {profile && (
              <button
                type="button"
                onClick={toggleBlock}
                className="flex w-full items-center gap-3 border-t border-dashed border-rule py-[13px] text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className={`block font-mono text-[14px] ${blockedByMe ? 'text-ink' : 'text-accent'}`}>
                    {blockedByMe ? `Unblock @${data.person.handle}` : `Block @${data.person.handle}`}
                  </span>
                  <span className="block truncate font-mono text-[12px] text-ink-mute">
                    {blockedByMe
                      ? 'They still can’t message you until you unblock them.'
                      : 'They won’t be able to follow or message you, and you won’t see each other’s updates.'}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
