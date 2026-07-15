'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLearnProgress } from '@/lib/api';
import { getTranslation } from '@/lib/translations';

export interface LearnProblemRow {
  problem_id: number;
  title: string;
  difficulty: string;
  order_num: number;
  solved_count: number;
  user_solved: boolean;
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  easy: 'bg-green-50 text-green-700',
  medium: 'bg-yellow-50 text-yellow-700',
  hard: 'bg-red-50 text-red-700',
};

// Renders a lesson's practice problems. The page itself is public and
// cached, so the current user's solved marks are fetched client-side and
// overlaid after hydration.
export default function LearnProblemList({ problems, lang }: { problems: LearnProblemRow[]; lang: string }) {
  const t = (key: string) => getTranslation(lang, key);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    getLearnProgress().then((p) => setSolvedIds(new Set(p.solved_problem_ids)));
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {problems.map((p, i) => {
        const solved = p.user_solved || solvedIds.has(p.problem_id);
        const diffKey = `learn.difficulty.${p.difficulty}`;
        const diffLabel = getTranslation(lang, diffKey);
        return (
          <Link
            key={p.problem_id}
            href={`/problems/${p.problem_id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group"
          >
            <span className="text-sm text-gray-400 w-6 shrink-0">{i + 1}.</span>
            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition flex-1 min-w-0 truncate">
              {p.title}
            </span>
            {solved && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 shrink-0">
                ✓ {t('learn.solvedByYou')}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${DIFFICULTY_CLASSES[p.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {diffLabel !== diffKey ? diffLabel : p.difficulty}
            </span>
            <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">
              {p.solved_count} {t('learn.solved')}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
