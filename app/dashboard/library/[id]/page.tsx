'use client';

import { useRouter } from 'next/navigation';
import DocumentDetail from '@/components/library/DocumentDetail';

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  return <DocumentDetail id={params.id} onBack={() => router.push('/dashboard/library')} />;
}
