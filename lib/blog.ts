import type { ComponentType } from 'react';

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastUpdated?: string;
  readTime: string;
  category?: string;
  tags?: string[];
  primaryKeyword?: string;
  cluster?: string;
  relatedPosts?: string[];
};

export const posts: PostMeta[] = [
  {
    slug: 'how-to-study-with-adhd',
    title: 'How to Study with ADHD',
    description: 'ADHD makes standard study methods less effective, not learning impossible. Here are the strategies that actually work for ADHD brains.',
    date: '2026-04-18',
    lastUpdated: '2026-04-18',
    readTime: '6 min read',
    category: 'ADHD',
    tags: ['ADHD', 'study tips', 'focus'],
    primaryKeyword: 'how to study with adhd',
    cluster: 'ADHD',
  },
  {
    slug: 'how-to-study-for-finals',
    title: 'How to Study for Finals',
    description: 'Stop reviewing everything and start targeting what you actually don\'t know. A practical guide to studying for finals that actually works.',
    date: '2026-04-18',
    lastUpdated: '2026-04-18',
    readTime: '6 min read',
    category: 'Finals',
    tags: ['finals', 'exam prep', 'study tips'],
    primaryKeyword: 'how to study for finals',
    cluster: 'Finals/Exam',
  },
  {
    slug: 'how-to-study-smarter-not-harder',
    title: 'How to Study Smarter, Not Harder',
    description: 'Studying smarter means active recall, spaced repetition, and knowing which topics need work. Here\'s what the research says actually builds retention.',
    date: '2026-04-18',
    lastUpdated: '2026-04-18',
    readTime: '5 min read',
    category: 'Study Tips',
    tags: ['study tips', 'active recall', 'spaced repetition'],
    primaryKeyword: 'how to study smarter not harder',
    cluster: 'Finals/Exam',
  },
  {
    slug: 'chemistry-notes',
    title: 'How to Take Chemistry Notes That Actually Help',
    description: 'Good chemistry notes focus on reaction mechanisms, key equations, and worked examples — not everything the professor said. Here\'s how to structure them.',
    date: '2026-04-18',
    lastUpdated: '2026-04-18',
    readTime: '5 min read',
    category: 'Chemistry',
    tags: ['chemistry', 'note taking', 'STEM'],
    primaryKeyword: 'chemistry notes',
    cluster: 'Chemistry/STEM',
  },
  {
    slug: 'how-to-study-when-tired',
    title: 'How to Study When You\'re Tired',
    description: 'When you\'re tired, standard studying stops working. Here\'s how to match your study method to your energy level and still make the time count.',
    date: '2026-04-18',
    lastUpdated: '2026-04-18',
    readTime: '5 min read',
    category: 'Study Tips',
    tags: ['study tips', 'energy', 'focus'],
    primaryKeyword: 'how to study when tired',
    cluster: 'Finals/Exam',
  },
  {
    slug: 'how-to-use-ai-to-study',
    title: 'How to Use AI to Study More Effectively',
    description: 'The best way to use AI for studying is as a study partner that tests you, not a tool that does the work for you. Here\'s how to get the most out of it.',
    date: '2026-04-18',
    lastUpdated: '2026-04-18',
    readTime: '6 min read',
    category: 'AI Tools',
    tags: ['AI studying', 'study tools', 'ChatGPT'],
    primaryKeyword: 'how to use ai to study',
    cluster: 'AI Tools General',
  },
  {
    slug: 'benefits-of-studying-with-ai',
    title: 'How Studying with AI Actually Makes You Learn Better (Not Just Faster)',
    description:
      'AI study tools do more than save time. Here is how using AI for studying, note simplification, personalized tutoring, and adaptive learning actually helps you retain more and stress less.',
    date: '2026-04-09',
    lastUpdated: '2026-04-18',
    readTime: '6 min read',
    category: 'Study Tips',
    tags: ['AI studying', 'study tools', 'learning'],
    primaryKeyword: 'studying with AI',
    cluster: 'ai-studying',
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
