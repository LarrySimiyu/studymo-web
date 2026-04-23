'use client';

import Image from 'next/image';
import harvardLogo  from '@/assets/harvard.png';
import stanfordLogo from '@/assets/standford.png';
import yaleLogo     from '@/assets/yale.png';
import mitLogo      from '@/assets/MIT.png';
import berkeleyLogo from '@/assets/berkeley.png';
import michiganLogo from '@/assets/michigan.png';

const SCHOOLS = [
  { name: 'Harvard University',     logo: harvardLogo  },
  { name: 'Stanford University',    logo: stanfordLogo },
  { name: 'Yale University',        logo: yaleLogo     },
  { name: 'MIT',                    logo: mitLogo      },
  { name: 'UC Berkeley',            logo: berkeleyLogo },
  { name: 'University of Michigan', logo: michiganLogo },
];

export default function SchoolsMarquee() {
  const items = [...SCHOOLS, ...SCHOOLS];

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: 'var(--bg-page)' }}>
      <p className="text-center text-xs font-semibold tracking-wide mb-10" style={{ color: '#FF6500' }}>
        Loved by professionals and students from
      </p>

      <div className="relative overflow-hidden max-w-4xl mx-auto">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--bg-page), transparent)' }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--bg-page), transparent)' }} />

        <div className="marquee-track flex items-end gap-10 sm:gap-16 w-max">
          {items.map((school, i) => (
            <div key={i} className="shrink-0 flex flex-col items-center gap-2 px-2">
              <Image
                src={school.logo}
                alt={school.name}
                width={64}
                height={64}
                className="object-contain sm:w-20 sm:h-20"
                style={{ filter: 'brightness(0)', opacity: 0.45 }}
              />
              <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap text-center" style={{ color: 'var(--text-3)' }}>
                {school.name}
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
