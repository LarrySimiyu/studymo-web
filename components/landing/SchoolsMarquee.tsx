'use client';

const SCHOOLS = [
  'Harvard University',
  'Stanford University',
  'Yale University',
  'MIT',
  'UC Berkeley',
  'University of Michigan',
];

export default function SchoolsMarquee() {
  // Duplicate list so the seamless loop works
  const items = [...SCHOOLS, ...SCHOOLS];

  return (
    <section className="py-16" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Label */}
      <p className="text-center text-xs font-semibold uppercase tracking-widest mb-10" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Loved by students at
      </p>

      {/* Track wrapper — clips overflow and adds left/right fade */}
      <div className="relative overflow-hidden max-w-3xl mx-auto px-0">

        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #0A0A0A, transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0A0A0A, transparent)' }}
        />

        {/* Scrolling track */}
        <div className="marquee-track flex items-center gap-16 w-max">
          {items.map((name, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-2.5 px-2"
            >
              {/* Logo placeholder — replace with <Image> */}
              <div
                className="w-6 h-6 rounded-sm shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              />
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marquee 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
