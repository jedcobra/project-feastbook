import { Label } from '@/components/label';
import { Tag } from '@/components/tag';

const TRENDING_TAGS = [
  'weeknight',
  'spring produce',
  'sourdough',
  'one-pot',
  'vegetarian',
  'under 30 min',
  'brunch',
  'baking',
];

export function TrendingTags() {
  return (
    <div className="mb-6">
      <Label className="mb-2.5">Trending tags</Label>
      <div className="flex flex-wrap gap-1.5">
        {TRENDING_TAGS.map((tag, i) => (
          <Tag key={tag} selected={i === 0}>
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  );
}
