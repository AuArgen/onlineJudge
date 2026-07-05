import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/problems`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/contests`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/leaderboard`, changeFrequency: 'daily', priority: 0.5 },
    { url: `${SITE_URL}/topics`, changeFrequency: 'weekly', priority: 0.5 },
  ];

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

  return [...staticRoutes, ...problemRoutes];
}
