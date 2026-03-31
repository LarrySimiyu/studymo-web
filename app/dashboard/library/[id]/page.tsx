'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import DocumentDetail from '@/components/library/DocumentDetail';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  return <DocumentDetail id={id} onBack={() => router.push('/dashboard/library')} />;
}
