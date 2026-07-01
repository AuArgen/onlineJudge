'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfile {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  stats: {
    total_submissions: number;
    solved_count: number;
    last_active_at: string | null;
  };
  recent_submissions: {
    submission_id: number;
    problem_id: number;
    problem_title: string;
    language: string;
    status: string;
    execution_time: string;
    created_at: string;
  }[];
}

const statusColors: Record<string, string> = {
  Accepted: 'bg-green-100 text-green-700',
  'Wrong Answer': 'bg-red-100 text-red-700',
  'Time Limit Exceeded': 'bg-yellow-100 text-yellow-700',
  'Runtime Error': 'bg-orange-100 text-orange-700',
  'System Error': 'bg-gray-100 text-gray-600',
  Pending: 'bg-blue-100 text-blue-700',
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/auth/login'); return; }
    const user = JSON.parse(userData);
    if (user.role !== 'admin') { router.push('/'); return; }

    fetch(`${API_URL}/admin/users/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router, params.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-gray-400">
        {t('adminUserDetail.loading')}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-gray-400">
        {t('adminUserDetail.notFound')}
      </div>
    );
  }

  const { user, stats, recent_submissions } = data;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gray-900">{t('adminUserDetail.admin')}</Link>
        <span>/</span>
        <Link href="/admin/users" className="hover:text-gray-900">{t('adminUserDetail.users')}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{user.name}</span>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 flex items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {user.role === 'admin' ? t('adminUserDetail.admin') : t('adminUserDetail.user')}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            {t('adminUserDetail.registered')} {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.solved_count}</div>
          <div className="text-sm text-gray-500 mt-1">{t('adminUserDetail.solved')}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-indigo-600">{stats.total_submissions}</div>
          <div className="text-sm text-gray-500 mt-1">{t('adminUserDetail.submissions')}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <div className="text-lg font-semibold text-gray-700">
            {stats.last_active_at
              ? new Date(stats.last_active_at).toLocaleDateString()
              : '—'}
          </div>
          <div className="text-sm text-gray-500 mt-1">{t('adminUserDetail.lastActive')}</div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('adminUserDetail.recentSubmissions')}</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUserDetail.problem')}</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUserDetail.language')}</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUserDetail.status')}</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUserDetail.time')}</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminUserDetail.date')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {recent_submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  {t('adminUserDetail.noSubmissions')}
                </td>
              </tr>
            ) : (
              recent_submissions.map((s) => (
                <tr key={s.submission_id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/problems/${s.problem_id}`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {s.problem_title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s.language}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[s.status] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{s.execution_time || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
