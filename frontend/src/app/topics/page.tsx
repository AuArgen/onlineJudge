'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTopics, deleteTopic } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function TopicsPage() {
  const { user, loading: authLoading } = useAuth();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = (f: string) => {
    setLoading(true);
    getTopics(f)
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && user) load(filter);
    else if (!authLoading && !user) setLoading(false);
  }, [filter, authLoading, user]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" темасын өчүрүү? Ичиндеги баары жоголот.`)) return;
    await deleteTopic(id);
    load(filter);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Темалар</h1>
          <p className="text-gray-500 mt-1 text-sm">Задачаларды темалар боюнча уюштуруңуз</p>
        </div>
        {user && (
          <Link
            href="/topics/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Жаңы тема
          </Link>
        )}
      </div>

      {/* Filters */}
      {user && (
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Баары' },
            { key: 'my', label: 'Менин' },
            { key: 'public', label: 'Жалпы' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {!user && !loading ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🔐</div>
          <p className="text-gray-600 text-lg font-medium">Темаларды көрүү үчүн кириңиз</p>
          <Link href="/auth/login" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition text-sm">
            Кирүү
          </Link>
        </div>
      ) : loading ? (
        <div className="text-center py-20 text-gray-400">Жүктөлүп жатат...</div>
      ) : topics.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-gray-500 text-lg font-medium">Темалар жок</p>
          {user && (
            <Link href="/topics/create" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
              Биринчи теманы түзүңүз
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic: any) => (
            <div key={topic.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/topics/${topic.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📁</span>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {topic.title}
                    </h3>
                  </div>
                </Link>
                {user && topic.author_id === user.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/topics/${topic.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Өзгөртүү"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(topic.id, topic.title)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Өчүрүү"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <Link href={`/topics/${topic.id}`}>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {topic.problem_count} задача
                  </span>
                  {topic.subtopic_count > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {topic.subtopic_count} подтема
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {topic.author?.name || 'Белгисиз'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    topic.visibility === 'public'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {topic.visibility === 'public' ? 'Жалпы' : 'Жашыруун'}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
