import type { ComponentType } from 'react';

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
};

export const posts: PostMeta[] = [
  {
    slug: 'benefits-of-studying-with-ai',
    title: 'How Studying with AI Actually Makes You Learn Better (Not Just Faster)',
    description:
      'AI study tools do more than save time. Here is how using AI for studying, note simplification, personalized tutoring, and adaptive learning actually helps you retain more and stress less.',
    date: '2026-04-09',
    readTime: '6 min read',
  },
];

export async function getPost(
  slug: string
): Promise<{ meta: PostMeta; Content: ComponentType } | null> {
  const meta = posts.find((p) => p.slug === slug);
  if (!meta) return null;

  try {
    const mod = await import(`@/app/blog/posts/${slug}`);
    return { meta, Content: mod.default };
  } catch {
    return null;
  }
}
