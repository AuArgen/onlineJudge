import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/api';

// The sitemap must be generated at request time: at build time the backend
// is unreachable, so a statically prerendered sitemap would permanently miss
// every problem and learn page.
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const LEARN_LANGS = ['ru', 'ky', 'en'];

interface LearnSitemapNode {
  slug: string;
  has_content: boolean;
  problem_count: number;
  updated_at?: string;
  children: LearnSitemapNode[];
}

// Walks the curriculum tree and lists every topic that has something to
// show: sections with children are index pages, leaf lessons only count
// once they have content or attached problems (empty stubs are noindex).
function collectLearnRoutes(nodes: LearnSitemapNode[], out: MetadataRoute.Sitemap) {
  for (const node of nodes) {
    const children = node.children || [];
    const ready = node.has_content || node.problem_count > 0 || children.length > 0;
    if (ready && node.slug) {
      for (const lang of LEARN_LANGS) {
        out.push({
          url: `${SITE_URL}/learn/${lang}/${node.slug}`,
          lastModified: node.updated_at ? new Date(node.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: children.length > 0 ? 0.8 : 0.7,
        });
      }
    }
    collectLearnRoutes(children, out);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/problems`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/contests`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/leaderboard`, changeFrequency: 'daily', priority: 0.5 },
    { url: `${SITE_URL}/topics`, changeFrequency: 'weekly', priority: 0.5 },
    ...LEARN_LANGS.map((lang) => ({
      url: `${SITE_URL}/learn/${lang}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];

  const learnRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${getBaseUrl()}/learn/tracks`, { cache: 'no-store' });
    if (res.ok) {
      const tracks: LearnSitemapNode[] = await res.json();
      collectLearnRoutes(Array.isArray(tracks) ? tracks : [], learnRoutes);
    }
  } catch {
    // Backend unreachable — skip learn routes.
  }

  const problemRoutes: MetadataRoute.Sitemap = [];
  const limit = 100;

  try {
    let page = 1;
    let totalPages = 1;
    do {
      const res = await fetch(`${getBaseUrl()}/problems?filter=public&page=${page}&limit=${limit}`, { cache: 'no-store' });
      if (!res.ok) break;
      const data = await res.json();
      const items: any[] = Array.isArray(data.data) ? data.data : [];

      for (const problem of items) {
        if (problem.status !== 'published') continue;
        problemRoutes.push({
          url: `${SITE_URL}/problems/${problem.id}`,
          lastModified: problem.updated_at ? new Date(problem.updated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      totalPages = data.total_pages || 1;
      page += 1;
    } while (page <= totalPages);
  } catch {
    // Backend unreachable — fall back to static routes only.
  }

  return [...staticRoutes, ...learnRoutes, ...problemRoutes];
}
