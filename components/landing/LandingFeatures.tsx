type Feature = {
  headline: string;
  description: string;
};

type Props = {
  features: Feature[];
};

export default function LandingFeatures({ features }: Props) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            What you get
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
            Built to actually prepare you for exams
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 sm:p-6"
              style={{
                backgroundColor: '#141414',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: 'rgba(255,101,0,0.12)',
                  color: '#FF6500',
                }}
              >
                {i + 1}
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">
                {feature.headline}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
