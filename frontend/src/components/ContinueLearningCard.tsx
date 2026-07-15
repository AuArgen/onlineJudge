'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLearnTracks, getLearnProgress, type LearnNode } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { learnHref } from '@/lib/learn';

interface NextLesson {
  slug: string;
  title: string;
  trackTitle: string;
}

// Flattens the curriculum forest into ready-to-study leaf lessons in
// study order (tracks → levels → lessons).
function collectReadyLeaves(nodes: LearnNode[], trackTitle: string | null, out: { node: LearnNode; trackTitle: string }[]) {
  for (const node of nodes) {
    const title = trackTitle ?? node.title;
    if (node.children.length === 0) {
      if (node.has_content || node.problem_count > 0) out.push({ node, trackTitle: title });
    } else {
      collectReadyLeaves(node.children, title, out);
    }
  }
}

// Dashboard card: overall curriculum progress and a shortcut to the first
// unfinished lesson.
export default function ContinueLearningCard() {
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState<NextLesson | null>(null);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    Promise.all([getLearnTracks(lang), getLearnProgress()])
      .then(([tracks, progress]) => {
        const leaves: { node: LearnNode; trackTitle: string }[] = [];
        collectReadyLeaves(tracks, null, leaves);
        const completed = new Set(progress.completed_topic_ids);
        const firstOpen = leaves.find((l) => !completed.has(l.node.id));
        setTotal(leaves.length);
        setDone(leaves.filter((l) => completed.has(l.node.id)).length);
        setNext(firstOpen ? { slug: firstOpen.node.slug, title: firstOpen.node.title, trackTitle: firstOpen.trackTitle } : null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  if (loading) return null;

  const href = next ? learnHref(lang, next.slug) : learnHref(lang);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={href}
      className="block bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 mb-8 text-white hover:from-blue-700 hover:to-indigo-700 transition group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-blue-100 mb-1">
            {total > 0 && done > 0 ? t('learn.continueLearning') : t('learn.startLearning')}
          </p>
          {next ? (
            <p className="font-semibold truncate">
              {next.trackTitle} · {next.title}
            </p>
          ) : (
            <p className="font-semibold">{t('learn.title')}</p>
          )}
          {total > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="h-1.5 w-40 bg-white/25 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-xs text-blue-100">
                {t('learn.progressOf').replace('{x}', String(done)).replace('{y}', String(total))}
              </span>
            </div>
          )}
        </div>
        <svg className="w-6 h-6 shrink-0 text-blue-200 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </Link>
  );
}
