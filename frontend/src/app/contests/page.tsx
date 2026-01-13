'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/contests')
      .then((res) => res.json())
      .then(setContests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Соревнования</h1>
        <Link href="/contests/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
          + Создать соревнование
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">Загрузка...</div>
      ) : contests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Нет активных соревнований.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contests.map((contest: any) => (
            <Link key={contest.id} href={`/contests/${contest.id}`} className="block group">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {contest.title}
                </h3>
                <p className="text-gray-500 mt-2">{contest.description}</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  <span>Начало: {new Date(contest.start_time).toLocaleString()}</span>
                  <span>Конец: {new Date(contest.end_time).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
