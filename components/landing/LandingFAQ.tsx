'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  faq: FAQItem[];
};

export default function LandingFAQ({ faq }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Common Questions
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {faq.map((item, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                style={{ backgroundColor: '#141414' }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="text-sm sm:text-base font-medium text-white">
                  {item.question}
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {openIndex === i && (
                <div
                  className="px-5 pb-4"
                  style={{ backgroundColor: '#141414' }}
                >
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
