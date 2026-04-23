import Image from 'next/image';
import folderImg from '@/assets/folder.png';
import fileImg from '@/assets/file.png';
import micImg from '@/assets/mic.png';

const STEPS = [
  {
    number: '1.',
    title: 'Upload Anything',
    sub: 'PDFs, links, audio, video, files',
    img: folderImg,
    alt: 'Upload lecture slides, PDFs, YouTube links, or audio files into Studymo',
  },
  {
    number: '2.',
    title: 'Get Notes',
    sub: 'Get formatted notes and transcripts',
    img: fileImg,
    alt: 'AI-generated study notes and transcript from uploaded course material',
  },
  {
    number: '3.',
    title: 'Get to Studying',
    sub: 'AI tutor, quizzes, flashcards, podcasts, so much more',
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
    <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-8 lg:px-16" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 sm:gap-16">

        {/* Label + heading */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="text-xs sm:text-sm font-bold tracking-widest uppercase"
            style={{ color: '#FF6500' }}
          >
            How it works
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight" style={{ color: 'var(--text-1)' }}>
            Keep It Simple
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full">
          {resolvedSteps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              {/* Image area */}
              <div className="flex items-center justify-center p-8 sm:p-10">
                <Image
                  src={step.img}
                  alt={step.alt}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain"
                />
              </div>

              {/* Description */}
              <div className="px-6 pb-6 flex flex-col gap-1.5 text-center">
                <p className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: 'var(--text-1)' }}>
                  {step.title}
                </p>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
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
