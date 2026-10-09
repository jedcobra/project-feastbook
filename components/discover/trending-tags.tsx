import Link from 'next/link';
import { Label } from '@/components/label';
import { Tag } from '@/components/tag';

// Tags come from fetchTrendingTags — real tag usage, not a curated list.
export function TrendingTags({ tags }: { tags: string[] }) {
  return (
    <div className="mb-6">
      <Label className="mb-2.5">Trending tags</Label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
            <Tag>{tag}</Tag>
          </Link>
        ))}
      </div>
    </div>
  );
}
