'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ErrorScreen } from '@/components/error-screen';
import { BookmarkIcon, MoreIcon, ShareIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { DocumentDetail } from '@/components/recipe/document-detail';
import { OwnerSheet } from '@/components/recipe/owner-sheet';
import { TopBar } from '@/components/top-bar';
import { AddToShelfSheet } from '@/components/shelves/add-to-shelf-sheet';
import { checkRecipeAccess, fetchRecipeFull, isSaved } from '@/lib/supabase/queries';
import type { Person, Recipe } from '@/lib/types';

export function RecipeDetailScreen({ id }: { id: string }) {
  const { profile } = useAuth();
  const [data, setData] = useState<{ recipe: Recipe; author: Person } | null | undefined>(undefined);
  const [access, setAccess] = useState<'checking' | 'ok' | 'private'>('checking');
  const [saved, setSavedState] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);
  const [shelfSheetOpen, setShelfSheetOpen] = useState(false);

  useEffect(() => {
    setAccess('checking');
    fetchRecipeFull(id, profile?.id ?? null).then(setData);
  }, [id, profile?.id]);

  useEffect(() => {
    if (!data) return;
    checkRecipeAccess(data.recipe.visibility, data.author.id, profile?.id ?? null).then((ok) =>
      setAccess(ok ? 'ok' : 'private'),
    );
  }, [data, profile?.id]);

  useEffect(() => {
    if (profile) {
      isSaved(profile.id, id).then(setSavedState);
    } else {
      setSavedState(false);
    }
  }, [profile, id]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied — nothing else we can do about it.
    }
  };

  if (data === undefined || access === 'checking') {
    return (
      <>
        <TopBar backHref="/feed" />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="font-mono text-[12px] text-ink-mute">Loading…</span>
        </div>
      </>
    );
  }

  if (data === null) {
    return <ErrorScreen kind="gone" backHref="/feed" ctaHref="/feed" />;
  }

  if (access === 'private') {
    const followersOnly = data.recipe.visibility === 'followers';
    return (
      <ErrorScreen
        kind="private"
        backHref="/feed"
        body={
          followersOnly
            ? `${data.author.name} shares this one with followers only.`
            : `${data.author.name} keeps this one to themselves.`
        }
        ctaHref={followersOnly ? `/${data.author.handle}` : '/feed'}
        ctaLabel={followersOnly ? `Visit ${data.author.name}’s cookbook` : 'Back to feed'}
      />
    );
  }

  const isOwner = profile?.id === data.author.id;

  return (
    <>
      <TopBar
        backHref="/feed"
        trailing={
          <>
            {!isOwner && (
              <OutlineBox
                compact
                filled={saved}
                aria-label={saved ? 'Manage shelves' : 'Save to a shelf'}
                onClick={() => setShelfSheetOpen(true)}
              >
                <BookmarkIcon size={14} />
              </OutlineBox>
            )}
            <OutlineBox compact aria-label={copied ? 'Link copied' : 'Share'} onClick={share}>
              <ShareIcon size={14} />
            </OutlineBox>
            {isOwner && (
              <OutlineBox compact aria-label="Recipe options" onClick={() => setOwnerSheetOpen(true)}>
                <MoreIcon size={14} />
              </OutlineBox>
            )}
          </>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {copied && (
          <div className="mx-5 mt-3 rounded-button border border-dashed border-rule px-3 py-1.5 text-center font-mono text-[11px] text-ink-mute">
            Link copied — anyone can open it, signed in or not
          </div>
        )}
        <DocumentDetail recipe={data.recipe} author={data.author} />
      </div>
      {ownerSheetOpen && (
        <OwnerSheet
          recipeId={id}
          title={data.recipe.title}
          visibility={data.recipe.visibility}
          onVisibilityChanged={(v) =>
            setData((d) => (d ? { ...d, recipe: { ...d.recipe, visibility: v } } : d))
          }
          onClose={() => setOwnerSheetOpen(false)}
        />
      )}
      {shelfSheetOpen && profile && (
        <AddToShelfSheet
          ownerId={profile.id}
          recipeId={id}
          recipeTitle={data.recipe.title}
          onSaved={setSavedState}
          onClose={() => setShelfSheetOpen(false)}
        />
      )}
    </>
  );
}
