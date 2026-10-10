'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ErrorScreen } from '@/components/error-screen';
import { MoreIcon, SendIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { CookButton } from '@/components/recipe/cook-button';
import { DocumentDetail } from '@/components/recipe/document-detail';
import { OwnerSheet } from '@/components/recipe/owner-sheet';
import { ShareSheet } from '@/components/share/share-sheet';
import { TopBar } from '@/components/top-bar';
import { checkRecipeAccess, fetchRecipeFull } from '@/lib/supabase/queries';
import type { Person, Recipe } from '@/lib/types';

export function RecipeDetailScreen({ id }: { id: string }) {
  const { profile } = useAuth();
  const [data, setData] = useState<{ recipe: Recipe; author: Person } | null | undefined>(undefined);
  const [access, setAccess] = useState<'checking' | 'ok' | 'private'>('checking');
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

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

  if (data === undefined || access === 'checking') {
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
            <OutlineBox compact aria-label="Share" onClick={() => setShareSheetOpen(true)}>
              <SendIcon size={14} />
            </OutlineBox>
            {isOwner && (
              <OutlineBox compact aria-label="Recipe options" onClick={() => setOwnerSheetOpen(true)}>
                <MoreIcon size={14} />
              </OutlineBox>
            )}
          </>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DocumentDetail
          recipe={data.recipe}
          author={data.author}
          onCommentPosted={(comment) =>
            setData((d) => (d ? { ...d, recipe: { ...d.recipe, comments: [comment, ...d.recipe.comments] } } : d))
          }
        />
      </div>
      <CookButton recipeId={id} hasSteps={data.recipe.steps.length > 0} />
      {shareSheetOpen && <ShareSheet recipe={data.recipe} onClose={() => setShareSheetOpen(false)} />}
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
