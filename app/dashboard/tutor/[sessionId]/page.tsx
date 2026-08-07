import TutorSurface from '@/components/tutor/TutorSurface';

export default function TutorSessionPage({ params }: { params: { sessionId: string } }) {
  return <TutorSurface sessionId={params.sessionId} />;
}
