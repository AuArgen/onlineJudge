import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const NOT_INDEXABLE: Metadata = {
  title: 'Задача',
  robots: { index: false, follow: false },
};

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDescription(description: string): string {
  const text = stripMarkdown(description || '');
  if (text.length <= 160) return text;
  return text.slice(0, 157).trimEnd() + '...';
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let problem: any;
  try {
    const res = await fetch(`${getBaseUrl()}/problems/${params.id}`, { cache: 'no-store' });
    if (!res.ok) return NOT_INDEXABLE;
    problem = await res.json();
  } catch {
    return NOT_INDEXABLE;
  }

  if (problem?.visibility !== 'public' || problem?.status !== 'published') {
    return NOT_INDEXABLE;
  }

  const title = problem.title as string;
  const description = buildDescription(problem.description);
  const url = `${SITE_URL}/problems/${params.id}`;

  return {
    title,
    description,
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

export default function ProblemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
