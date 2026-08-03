import Link from 'next/link';
import { posts } from '@/lib/blog';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import LandingFooter from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Blog - StudyMo',
  description: 'Study tips, AI learning strategies, and guides to help students study smarter.',
};

export default function BlogPage() {
  return (
    <main className="light min-h-screen relative flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,101,0,0.10) 0%, transparent 65%)',
        }}
      />

      <Navbar />

      <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="mb-12 sm:mb-16">
          <h1
            className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: 'var(--text-1)' }}
          >
            StudyMo Blog
          </h1>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-2)' }}>
            Study tips, AI tools breakdowns, and strategies that actually work for students.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl p-6 border transition-colors hover:border-[rgba(255,101,0,0.3)]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span style={{ color: 'var(--text-3)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[color:var(--text-1)] mb-3 group-hover:text-[#FF6500] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed mt-auto" style={{ color: 'var(--text-2)' }}>
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
