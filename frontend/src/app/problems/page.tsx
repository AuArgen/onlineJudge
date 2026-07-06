'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ToastProvider';

export const dynamic = 'force-dynamic';

function ProblemsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const { lang, t } = useLanguage();
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();
  const limit = 20;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) setFilter(urlFilter);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let url = `${API_URL}/problems?filter=${filter}&page=${page}&limit=${limit}&lang=${lang}`;
    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;

    setLoading(true);
    fetch(url, { headers })
      .then((res) => {
        if (res.status === 401) { setFilter('all'); return null; }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data)) {
          setProblems(data);
          setTotal(data.length);
          setTotalPages(1);
        } else {
          setProblems(data.data || []);
          setTotal(data.total || 0);
          setTotalPages(data.total_pages || 1);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, filter, page, lang]);

  const isProblemOwner = (problem: any) => user && (problem.author_id === user.id || user.role === 'admin');

  const visibilityLabel = (visibility: string) => {
    if (visibility === 'public') return t('problems.public');
    if (visibility === 'private') return t('problems.private');
    return visibility;
  };

  const statusLabel = (status: string) => {
    if (status === 'draft') return t('problems.draft');
    if (status === 'pending_review') return t('problems.pendingReview');
    if (status === 'rejected') return t('problems.rejected');
    return status;
  };

  const handleDeleteProblem = async (problemId: number) => {
    if (!confirm(t('problems.confirmDelete'))) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${problemId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('delete failed');
      setProblems((items) => items.filter((problem) => problem.id !== problemId));
      setTotal((current) => Math.max(0, current - 1));
      showToast(t('problems.deleted'), 'success');
    } catch (error) {
      console.error(error);
      showToast(t('problems.deleteError'), 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('problems.title')}</h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{t('problems.found')}: {total}</p>}
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('problems.filterAll')}
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'public' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('problems.filterPublic')}
            </button>
            {user && (
              <>
                <button onClick={() => setFilter('my')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'my' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t('problems.filterMy')}
                </button>
                <button onClick={() => setFilter('private')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'private' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t('problems.filterPrivate')}
                </button>
              </>
            )}
          </div>

          <div className="relative flex-grow md:flex-grow-0 w-full md:w-64">
            <input
              type="text"
              placeholder={t('problems.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <Link href="/problems/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm flex items-center">
            {t('problems.create')}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">{t('problems.notFound')}</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-blue-600 mt-2 hover:underline">
              {t('problems.resetFilters')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {problems.map((problem: any) => (
              <div key={problem.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/problems/${problem.id}`} className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition truncate">{problem.title}</h3>
                      </Link>
                      {problem.visibility !== 'public' && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                          {visibilityLabel(problem.visibility)}
                        </span>
                      )}
                      {isProblemOwner(problem) && problem.status && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                          {statusLabel(problem.status)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 max-w-2xl">{problem.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-500 w-full sm:w-auto">
                    <div className="flex items-center gap-6 justify-between sm:justify-end">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>{problem.solved_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {problem.time_limit}s
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        {problem.memory_limit}MB
                      </div>
                    </div>
                    {isProblemOwner(problem) && (
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Link
                          href={`/problems/${problem.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {t('problems.edit')}
                        </Link>
                        <button
                          onClick={() => handleDeleteProblem(problem.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t('problems.delete')}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`px-3 py-1.5 text-sm border rounded-lg transition ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Problems() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
      <ProblemsContent />
    </Suspense>
  );
}
