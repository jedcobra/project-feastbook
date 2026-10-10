import { redirect } from 'next/navigation';

// Notes used to have their own page; they now live at the bottom of the
// recipe. Old links (and any shared ones) land there instead.
export default function CommentsPage({ params }: { params: { id: string } }) {
  redirect(`/recipe/${params.id}#notes`);
}
