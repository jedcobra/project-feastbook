import { ShelfDetailScreen } from '@/components/shelves/shelf-detail-screen';

export default function ShelfPage({ params }: { params: { id: string } }) {
  return <ShelfDetailScreen id={params.id} />;
}
