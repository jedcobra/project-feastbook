'use client';

import { useRouter } from 'next/navigation';
import { NewShelfForm } from '@/components/shelves/new-shelf-form';
import { TopBar } from '@/components/top-bar';

export function NewShelfScreen() {
  const router = useRouter();

  return (
    <>
      <TopBar title="New shelf" backHref="/me" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <NewShelfForm onCreated={(shelf) => router.push(`/shelf/${shelf.id}`)} />
      </div>
    </>
  );
}
