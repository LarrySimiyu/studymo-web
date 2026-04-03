import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewNoteButton() {
  return (
    <Button variant="brand" size="sm" asChild>
      <Link href="/dashboard/library">
        <Plus size={14} />
        New Note
      </Link>
    </Button>
  );
}
