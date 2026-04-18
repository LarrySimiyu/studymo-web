type Props = {
  problemStatement: string;
};

export default function LandingProblem({ problemStatement }: Props) {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-8" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-2xl mx-auto text-center">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Sound familiar?
        </p>
        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          {problemStatement}
        </p>
      </div>
    </section>
  );
}
