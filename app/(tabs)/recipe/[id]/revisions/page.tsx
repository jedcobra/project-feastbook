import { RevisionsScreen } from '@/components/recipe/revisions-screen';

export default function RevisionsPage({ params }: { params: { id: string } }) {
  return <RevisionsScreen id={params.id} />;
}
