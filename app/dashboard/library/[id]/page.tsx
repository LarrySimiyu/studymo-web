'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLibrary } from '@/context/LibraryContext';
import DocumentDetail, { flushPendingNoteSave } from '@/components/library/DocumentDetail';

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { availableTags } = useLibrary();
  const query = searchParams.toString();

  return (
    <DocumentDetail
      key={params.id}
      id={params.id}
      embedded
      availableTags={availableTags}
      onBack={() => { flushPendingNoteSave(); router.push(`/dashboard/library${query ? `?${query}` : ''}`); }}
    />
  );
}
