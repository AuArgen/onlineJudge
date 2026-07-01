'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Contests() {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch(`${API_URL}/contests`)
      .then((res) => res.json())
      .then(setContests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('contests.title')}</h1>
        <Link href="/contests/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
          {t('contests.create')}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
      ) : contests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">{t('contests.noActive')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contests.map((contest: any) => (
            <Link key={contest.id} href={`/contests/${contest.id}`} className="block group">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">{contest.title}</h3>
                <p className="text-gray-500 mt-2">{contest.description}</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  <span>{t('contests.start')} {new Date(contest.start_time).toLocaleString()}</span>
                  <span>{t('contests.end')} {new Date(contest.end_time).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
