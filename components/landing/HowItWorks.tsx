import Image from 'next/image';
import folderImg from '@/assets/folder.png';
import fileImg from '@/assets/file.png';
import micImg from '@/assets/mic.png';

const STEPS = [
  {
    number: '1.',
    title: 'Upload Anything',
    sub: 'Links, audio, video, files.',
    img: folderImg,
    alt: 'Upload lecture slides, PDFs, YouTube links, or audio files into Studymo',
  },
  {
    number: '2.',
    title: 'Get Notes',
    sub: 'Get formatted notes and transcripts.',
    img: fileImg,
    alt: 'AI-generated study notes and transcript from uploaded course material',
  },
  {
    number: '3.',
    title: 'Get to Studying',
    sub: 'AI tutor, quizzes, flashcards, podcasts, so much more.',
    img: micImg,
    alt: 'Studymo AI tutor, flashcards, quizzes, and podcast study tools',
  },
];

type StepOverride = { title: string; sub: string; alt?: string };

type Props = {
  steps?: [StepOverride, StepOverride, StepOverride];
};

export default function HowItWorks({ steps }: Props = {}) {
  const resolvedSteps = STEPS.map((s, i) => ({
    ...s,
    title: steps?.[i]?.title ?? s.title,
    sub: steps?.[i]?.sub ?? s.sub,
    alt: steps?.[i]?.alt ?? s.alt,
  }));

  return (
    <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-8 lg:px-16" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 sm:gap-16">

        {/* Label + heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full"
            style={{ backgroundColor: '#1A1A1A', color: '#9CA3AF', border: '1px solid #2A2A2A' }}
          >
            How it works
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
            Studymo keeps it simple
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 w-full">
          {resolvedSteps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-5 text-center">
              {/* Icon tile */}
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl flex items-center justify-center"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
              >
                <Image
                  src={step.img}
                  alt={step.alt}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1.5">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {step.number} {step.title}
                </p>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#6B7280' }}>
                  {step.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
