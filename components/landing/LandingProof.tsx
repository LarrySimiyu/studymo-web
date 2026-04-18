type Quote = {
  text: string;
  name: string;
};

type Props = {
  quotes: Quote[];
};

export default function LandingProof({ quotes }: Props) {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-8" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-5xl mx-auto">
        <p
          className="text-center text-xs font-semibold uppercase tracking-widest mb-10"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          What students are saying
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quotes.map((quote, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 sm:p-6"
              style={{
                backgroundColor: '#141414',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p
                className="text-sm sm:text-base leading-relaxed mb-4"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {quote.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
