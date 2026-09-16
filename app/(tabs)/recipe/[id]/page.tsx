import { RecipeDetailScreen } from '@/components/recipe/recipe-detail-screen';

export default function RecipePage({ params }: { params: { id: string } }) {
  return <RecipeDetailScreen id={params.id} />;
}
