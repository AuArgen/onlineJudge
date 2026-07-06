import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const NOT_FOUND: Metadata = {
  title: 'Тема табылган жок',
  robots: { index: false, follow: false },
};

function buildDescription(topic: any, problemCount: number): string {
  const textBlock = (topic.contents || []).find((b: any) => b.type === 'text' && b.content);
  const base = textBlock?.content || `${topic.title} темасы боюнча ${problemCount} тапшырма — Online Judge`;
  const text = base.replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  return text.slice(0, 157).trimEnd() + '...';
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  let data: any;
  try {
    const res = await fetch(`${getBaseUrl()}/topics/shared/${params.token}`, { cache: 'no-store' });
    if (!res.ok) return NOT_FOUND;
    data = await res.json();
  } catch {
    return NOT_FOUND;
  }

  const topic = data.topic;
  if (!topic) return NOT_FOUND;

  const title = topic.title as string;
  const description = buildDescription(topic, data.problems?.length || 0);
  const url = `${SITE_URL}/topics/shared/${params.token}`;

  return {
    title,
    description,
    // Shared-by-link topics stay out of search results (link is the access
    // control), but still need OG/Twitter tags so chat apps render a preview.
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Online Judge',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function SharedTopicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
