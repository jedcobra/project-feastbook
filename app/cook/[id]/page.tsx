import { notFound, redirect } from 'next/navigation';
import { CookingScreen } from '@/components/cooking/cooking-screen';
import { RECIPES } from '@/lib/fixtures';

export function generateStaticParams() {
  // Include stepless recipes so a static page exists to run their redirect.
  return RECIPES.map((r) => ({ id: r.id }));
}

export default function CookPage({ params }: { params: { id: string } }) {
  const recipe = RECIPES.find((r) => r.id === params.id);
  if (!recipe) notFound();
  if (recipe.steps.length === 0) redirect(`/recipe/${recipe.id}`);

  return <CookingScreen recipe={recipe} />;
}
