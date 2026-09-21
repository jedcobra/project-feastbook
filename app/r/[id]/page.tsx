import type { Metadata } from 'next';
import { ErrorScreen } from '@/components/error-screen';
import { PublicRecipeDocument } from '@/components/share/public-recipe-document';
import { fetchRecipeFull } from '@/lib/supabase/queries';

// Always fetch fresh — a recipe here can be edited, made private, or
// deleted at any time, and this page has no session to know when to
// invalidate a cached copy.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await fetchRecipeFull(params.id);
  if (!data || data.recipe.visibility !== 'public') {
    return { title: 'Special Spoon' };
  }
  const { recipe, author } = data;
  const description = recipe.subtitle || recipe.intro || `A recipe by ${author.name} on Special Spoon.`;
  return {
    title: `${recipe.title} — Special Spoon`,
    description,
    openGraph: {
      title: recipe.title,
      description,
      siteName: 'Special Spoon',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: recipe.title,
      description,
    },
  };
}

function ShareMasthead() {
  return (
    <div className="flex flex-shrink-0 items-center gap-2 border-b border-dashed border-rule px-5 py-3">
      <span className="font-display text-[15px] font-bold text-ink">Special Spoon</span>
      <span className="flex-1" />
      <a
        href="/account/sign-up"
        className="rounded-button border border-ink bg-cream px-2 py-1 font-mono text-meta font-medium text-ink"
      >
        Create an account
      </a>
    </div>
  );
}

function ShareSaveBar() {
  return (
    <div className="flex flex-shrink-0 items-center gap-2.5 border-t border-dashed border-rule px-4 pb-7 pt-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-[11px] text-ink">Reading in a browser</div>
        <div className="font-mono text-[10px] text-ink-mute">Sign up to save it and cook from it</div>
      </div>
      <a
        href="/account/sign-up"
        className="flex-shrink-0 rounded-button border border-ink bg-cream px-2 py-1 font-mono text-meta font-medium text-ink"
      >
        Open in Special Spoon
      </a>
    </div>
  );
}

export default async function PublicRecipePage({ params }: { params: { id: string } }) {
  const data = await fetchRecipeFull(params.id);

  if (!data) {
    return (
      <>
        <ShareMasthead />
        <ErrorScreen kind="gone" bare ctaHref="/" ctaLabel="Go to Special Spoon" />
      </>
    );
  }

  if (data.recipe.visibility !== 'public') {
    return (
      <>
        <ShareMasthead />
        <ErrorScreen
          kind="private"
          bare
          body={`${data.author.name} keeps this one to themselves.`}
          ctaHref="/"
          ctaLabel="Go to Special Spoon"
        />
      </>
    );
  }

  return (
    <>
      <ShareMasthead />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PublicRecipeDocument recipe={data.recipe} author={data.author} />
      </div>
      <ShareSaveBar />
    </>
  );
}
