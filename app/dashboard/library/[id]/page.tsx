'use client';

import { useRouter } from 'next/navigation';
import DocumentDetail from '@/components/library/DocumentDetail';

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  return (
    <div className="h-full overflow-hidden">
      <DocumentDetail id={params.id} onBack={() => router.push('/dashboard/library')} />
    </div>
  );
}
