import { CookingScreenLoader } from '@/components/cooking/cooking-screen-loader';
import { supabase } from '@/lib/supabase/client';

// See app/(tabs)/recipe/[id]/page.tsx for why this is a best-effort
// build-time fetch with an empty-array fallback.
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('recipes').select('id');
    if (data && data.length > 0) return data.map((r: { id: string }) => ({ id: r.id }));
  } catch (err) {
    console.warn('generateStaticParams: could not reach Supabase', err);
  }
  return [{ id: '__placeholder__' }];
}

export default function CookPage({ params }: { params: { id: string } }) {
  return <CookingScreenLoader id={params.id} />;
}
