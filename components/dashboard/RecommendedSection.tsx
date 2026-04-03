'use client';

import Link from 'next/link';
import { CalendarDays, Heart, ClipboardList } from 'lucide-react';

const ITEMS = [
  {
    icon: <CalendarDays size={18} color="#3B82F6" />,
    iconMd: <CalendarDays size={26} color="#3B82F6" />,
    iconBg: 'rgba(59,130,246,0.12)',
    title: 'Create a Study Plan',
    desc: 'Set a test date and get a day-by-day schedule',
    href: '/dashboard/study-plan',
  },
  {
    icon: <Heart size={18} color="#EC4899" fill="#EC4899" />,
    iconMd: <Heart size={26} color="#EC4899" fill="#EC4899" />,
    iconBg: 'rgba(236,72,153,0.12)',
    title: 'Take a Quiz',
    desc: 'Test your knowledge and track weak topics',
    href: '/dashboard/quizzes',
  },
  {
    icon: <ClipboardList size={18} color="#8B5CF6" />,
    iconMd: <ClipboardList size={26} color="#8B5CF6" />,
    iconBg: 'rgba(139,92,246,0.12)',
    title: 'Practice Exam',
    desc: 'Simulate the real exam experience',
    href: '/dashboard/practice-exams',
  },
];

export default function RecommendedSection() {
  return (
    <div>
      <h2 className="text-xs font-medium text-[var(--text-2)] mb-2">For You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                       md:flex-col md:items-start md:gap-5 md:px-6 md:py-6"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                         md:w-14 md:h-14 md:rounded-2xl"
              style={{ backgroundColor: item.iconBg }}
            >
              <span className="md:hidden">{item.icon}</span>
              <span className="hidden md:block">{item.iconMd}</span>
            </div>
            <div className="min-w-0">
              <p className="text-body-sm font-medium text-[var(--text-1)] truncate md:text-body-lg md:font-semibold md:whitespace-normal">{item.title}</p>
              <p className="text-xs text-[var(--text-3)] truncate md:text-body-sm md:mt-1 md:whitespace-normal">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
