import { CookingScreenLoader } from '@/components/cooking/cooking-screen-loader';

export default function CookPage({ params }: { params: { id: string } }) {
  return <CookingScreenLoader id={params.id} />;
}
