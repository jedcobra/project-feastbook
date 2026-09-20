'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { BookmarkIcon, MoreIcon, ShareIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { DocumentDetail } from '@/components/recipe/document-detail';
import { OwnerSheet } from '@/components/recipe/owner-sheet';
import { TopBar } from '@/components/top-bar';
import { fetchRecipeFull, isSaved, setSaved } from '@/lib/supabase/queries';
import type { Person, Recipe, RecipeComment } from '@/lib/types';

export function RecipeDetailScreen({ id }: { id: string }) {
  const { profile } = useAuth();
  const [data, setData] = useState<{ recipe: Recipe; author: Person } | null | undefined>(undefined);
  const [saved, setSavedState] = useState(false);
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);

  useEffect(() => {
    fetchRecipeFull(id).then(setData);
  }, [id]);

  useEffect(() => {
    if (profile) {
      isSaved(profile.id, id).then(setSavedState);
    } else {
      setSavedState(false);
    }
  }, [profile, id]);

  const toggleSave = async () => {
    if (!profile) return;
    const next = !saved;
    setSavedState(next);
    await setSaved(profile.id, id, next);
  };

  const handleCommentPosted = (comment: RecipeComment) => {
    setData((d) => (d ? { ...d, recipe: { ...d.recipe, comments: [...d.recipe.comments, comment] } } : d));
  };

  if (data === undefined) {
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
    return (
      <>
        <TopBar backHref="/feed" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
          <span className="font-mono text-[12px] text-ink-mute">Recipe not found.</span>
        </div>
      </>
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
              <OutlineBox compact filled={saved} aria-label={saved ? 'Unsave' : 'Save'} onClick={toggleSave}>
                <BookmarkIcon size={14} />
              </OutlineBox>
            )}
            <OutlineBox compact aria-label="Share">
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
        <DocumentDetail
          recipe={data.recipe}
          author={data.author}
          currentProfileId={profile?.id ?? null}
          onCommentPosted={handleCommentPosted}
        />
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
    </>
  );
}
