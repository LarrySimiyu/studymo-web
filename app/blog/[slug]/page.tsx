import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getPost, posts } from '@/lib/blog';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import LandingFooter from '@/components/landing/LandingFooter';
import CTABlock from '@/components/blog/CTABlock';

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

  const url = `https://studymo.app/blog/${result.meta.slug}`;

  return {
    title: `${result.meta.title} - StudyMo Blog`,
    description: result.meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: result.meta.title,
      description: result.meta.description,
      url,
      type: 'article',
      publishedTime: result.meta.date,
      modifiedTime: result.meta.lastUpdated ?? result.meta.date,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.lastUpdated ?? meta.date,
    url: `https://studymo.app/blog/${meta.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Studymo',
      url: 'https://studymo.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Studymo',
      url: 'https://studymo.app',
    },
  };

  return (
    <main className="light min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24">
        <Link
          href="/blog"
          className="inline-flex items-center mb-6 transition-colors"
          style={{ color: 'var(--text-3)' }}
        >
          <ChevronLeft size={18} />
          <span className="text-sm ml-1">All posts</span>
        </Link>

        {meta.category && (
          <div className="mb-4">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,101,0,0.12)', color: '#FF6500' }}
            >
              {meta.category}
            </span>
          </div>
        )}

        <h1
          className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--text-1)' }}
        >
          {meta.title}
        </h1>

        {meta.lastUpdated && (
          <p className="text-xs mb-10" style={{ color: 'var(--text-3)' }}>
            Last updated{' '}
            {new Date(meta.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        <div className="blog-content">
          <Content />
        </div>

        <CTABlock />
      </div>

      <LandingFooter />
    </main>
  );
}
