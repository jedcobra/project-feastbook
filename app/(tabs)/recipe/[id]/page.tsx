import { RecipeDetailScreen } from '@/components/recipe/recipe-detail-screen';
import { supabase } from '@/lib/supabase/client';

// Static export needs every path known at build time. This queries Supabase
// at build time (works in CI, which has real network access). `output:
// export` rejects an empty result outright for a required dynamic segment,
// so if the fetch fails (e.g. no network, as in local sandboxed dev), it
// falls back to a single placeholder id rather than failing the build —
// that path just renders "not found" at runtime and is never linked to.
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('recipes').select('id');
    if (data && data.length > 0) return data.map((r: { id: string }) => ({ id: r.id }));
  } catch (err) {
    console.warn('generateStaticParams: could not reach Supabase', err);
  }
  return [{ id: '__placeholder__' }];
}

export default function RecipePage({ params }: { params: { id: string } }) {
  return <RecipeDetailScreen id={params.id} />;
}
