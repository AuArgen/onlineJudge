'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/api';

// Force dynamic rendering to avoid build errors with useSearchParams
export const dynamic = 'force-dynamic';

function ProblemsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      setFilter(urlFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${API_URL}/problems?filter=${filter}`;
    if (debouncedSearch) {
      url += `&search=${encodeURIComponent(debouncedSearch)}`;
    }

    setLoading(true);
    fetch(url, { headers })
      .then((res) => {
        if (res.status === 401) {
          setFilter('all');
          return [];
        }
        return res.json();
      })
      .then(setProblems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, filter]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          {/* Filter Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Все
            </button>
            <button 
              onClick={() => setFilter('public')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'public' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Публичные
            </button>
            {user && (
              <>
                <button 
                  onClick={() => setFilter('my')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'my' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Мои
                </button>
                <button 
                  onClick={() => setFilter('private')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'private' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Приватные
                </button>
              </>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-grow md:flex-grow-0 w-full md:w-64">
            <input
              type="text"
              placeholder="Поиск задач..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <Link href="/problems/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm flex items-center">
            <span className="mr-1">+</span> Создать
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Задачи не найдены.</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-blue-600 mt-2 hover:underline">
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {problems.map((problem: any) => (
            <Link key={problem.id} href={`/problems/${problem.id}`} className="block group">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {problem.title}
                    </h3>
                    {problem.visibility !== 'public' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        problem.visibility === 'private' 
                          ? 'bg-gray-100 text-gray-700 border-gray-200' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {problem.visibility === 'private' ? 'Приватная' : problem.visibility}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 max-w-2xl">
                    {problem.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1" title="Решили">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{problem.solved_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Time Limit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {problem.time_limit}s
                  </div>
                  <div className="flex items-center gap-1" title="Memory Limit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    {problem.memory_limit}MB
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Problems() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Загрузка...</div>}>
      <ProblemsContent />
    </Suspense>
  );
}
