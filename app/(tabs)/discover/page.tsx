import { CooksToFollow } from '@/components/discover/cooks-to-follow';
import { EditorsPicks } from '@/components/discover/editors-picks';
import { SearchInput } from '@/components/discover/search-input';
import { TrendingTags } from '@/components/discover/trending-tags';
import { TopBar } from '@/components/top-bar';
import { PEOPLE, RECIPES } from '@/lib/fixtures';

export default function DiscoverPage() {
  const cooksToFollow = PEOPLE.slice(1, 5);
  const editorsPicks = RECIPES.slice(0, 5);

  return (
    <>
      <TopBar title="Discover" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <SearchInput placeholder="Search recipes, cooks, tags…" />
        <TrendingTags />
        <CooksToFollow people={cooksToFollow} />
        <EditorsPicks recipes={editorsPicks} />
      </div>
    </>
  );
}
