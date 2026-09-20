import { SearchScreen } from '@/components/search/search-screen';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  return <SearchScreen initial={searchParams.q ?? ''} />;
}
