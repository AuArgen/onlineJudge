'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLearnProgress, type LearnNode } from '@/lib/api';
import { getTranslation } from '@/lib/translations';

// Renders the child topics of a curriculum section (levels of a track,
// lessons of a level) with the current user's completion marks and a
// progress bar. The list itself is server-rendered for SEO; the personal
// progress overlay arrives after hydration.
export default function LearnChildList({ items, lang }: { items: LearnNode[]; lang: string }) {
  const t = (key: string) => getTranslation(lang, key);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getLearnProgress().then((p) => {
      setCompletedIds(new Set(p.completed_topic_ids));
      setLoaded(true);
    });
  }, []);

  // Progress counts only leaf lessons that are actually ready to study.
  const leaves = items.filter((c) => c.children.length === 0 && (c.has_content || c.problem_count > 0));
  const doneCount = leaves.filter((c) => completedIds.has(c.id)).length;
  const showProgress = loaded && leaves.length > 0 && completedIds.size > 0;

  return (
    <div>
      {showProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-500">
              {t('learn.progressOf').replace('{x}', String(doneCount)).replace('{y}', String(leaves.length))}
            </span>
            <span className="text-gray-400 text-xs">{Math.round((doneCount / leaves.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(doneCount / leaves.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <ol className="space-y-2.5">
        {items.map((child, i) => {
          const ready = child.has_content || child.problem_count > 0 || child.children.length > 0;
          const done = completedIds.has(child.id);
          const inner = (
            <>
              <div
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-semibold text-sm ${
                  done ? 'bg-green-100 text-green-700' : ready ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className={`font-medium ${ready ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-400'} transition`}>
                  {child.title}
                </span>
                {child.summary && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{child.summary}</p>}
                {child.problem_count > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {child.problem_count} {t('learn.problemsCount')}
                  </p>
                )}
              </div>
              {!ready && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 shrink-0 self-center">
                  {t('learn.comingSoon')}
                </span>
              )}
            </>
          );
          return (
            <li key={child.id}>
              {ready ? (
                <Link
                  href={`/learn/${lang}/${child.slug}`}
                  className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition group"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 opacity-80">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
