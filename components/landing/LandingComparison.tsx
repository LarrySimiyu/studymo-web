type ComparisonRow = {
  feature: string;
  studymo: string;
  competitor: string;
};

type Props = {
  comparisonTarget: string;
  rows: ComparisonRow[];
};

export default function LandingComparison({ comparisonTarget, rows }: Props) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Studymo vs {comparisonTarget}
          </h2>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="grid grid-cols-3 px-5 py-3 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: '#181818', color: 'rgba(255,255,255,0.4)' }}
          >
            <span>Feature</span>
            <span className="text-center" style={{ color: '#FF6500' }}>
              Studymo
            </span>
            <span className="text-center">{comparisonTarget}</span>
          </div>

          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 px-5 py-4 text-sm"
              style={{
                backgroundColor: i % 2 === 0 ? '#0F0F0F' : '#131313',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{row.feature}</span>
              <span className="text-center text-white">{row.studymo}</span>
              <span className="text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {row.competitor}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
