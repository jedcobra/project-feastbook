import { notFound } from 'next/navigation';
import { BookmarkIcon, ShareIcon } from '@/components/icons';
import { OutlineBox } from '@/components/outline-box';
import { DocumentDetail } from '@/components/recipe/document-detail';
import { TopBar } from '@/components/top-bar';
import { byHandle, RECIPES } from '@/lib/fixtures';

export function generateStaticParams() {
  return RECIPES.map((recipe) => ({ id: recipe.id }));
}

export default function RecipePage({ params }: { params: { id: string } }) {
  const recipe = RECIPES.find((r) => r.id === params.id);
  if (!recipe) notFound();

  const author = byHandle(recipe.author);

  return (
    <>
      <TopBar
        backHref="/feed"
        trailing={
          <>
            <OutlineBox compact aria-label="Save">
              <BookmarkIcon size={14} />
            </OutlineBox>
            <OutlineBox compact aria-label="Share">
              <ShareIcon size={14} />
            </OutlineBox>
          </>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <DocumentDetail recipe={recipe} author={author} />
      </div>
    </>
  );
}
