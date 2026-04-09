import Link from 'next/link';
import { posts } from '@/lib/blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - StudyMo',
  description: 'Study tips, AI learning strategies, and guides to help students study smarter.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">StudyMo Blog</h1>
        <p className="text-base sm:text-lg mb-12" style={{ color: 'var(--text-2)' }}>
          Study tips, AI tools breakdowns, and strategies that actually work for students.
        </p>

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl p-6 border transition-colors"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 mb-3">
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
              <h2
                className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:text-[#FF6500] transition-colors"
              >
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
