import { NotesScreen } from '@/components/recipe/notes-screen';

export default function CommentsPage({ params }: { params: { id: string } }) {
  return <NotesScreen id={params.id} />;
}
