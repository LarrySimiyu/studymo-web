import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getPost, posts } from '@/lib/blog';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getPost(params.slug);
  if (!result) return {};

  return {
    title: `${result.meta.title} - StudyMo Blog`,
    description: result.meta.description,
    openGraph: {
      title: result.meta.title,
      description: result.meta.description,
      url: `https://studymo.app/blog/${result.meta.slug}`,
      type: 'article',
      publishedTime: result.meta.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: result.meta.title,
      description: result.meta.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const result = await getPost(params.slug);
  if (!result) notFound();

  const { meta, Content } = result;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Link
          href="/blog"
          className="inline-flex items-center mb-4 transition-colors"
          style={{ color: 'var(--text-3)' }}
        >
          <ChevronLeft size={18} />
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {new Date(meta.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{meta.readTime}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-10 leading-tight">
          {meta.title}
        </h1>

        <div className="blog-content">
          <Content />
        </div>

        <div
          className="mt-16 rounded-2xl p-6 sm:p-8 text-center border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <p className="text-lg font-semibold text-white mb-2">Ready to study smarter?</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
            Upload your first set of notes and let StudyMo do the rest.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FF6500, #ff8c00)' }}
          >
            Try for $0
          </Link>
        </div>
      </div>
    </main>
  );
}
