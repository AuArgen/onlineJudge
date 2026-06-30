'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { API_URL } from '@/lib/api';

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
        Жүктөлүүдө...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center text-gray-400">
        Колдонуучу табылган жок
      </div>
    );
  }

  const { user, stats, recent_submissions } = data;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gray-900">Админ</Link>
        <span>/</span>
        <Link href="/admin/users" className="hover:text-gray-900">Колдонуучулар</Link>
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
              {user.role === 'admin' ? 'Админ' : 'Колдонуучу'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Катталган: {new Date(user.created_at).toLocaleDateString('ky-KG')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.solved_count}</div>
          <div className="text-sm text-gray-500 mt-1">Чечилген маселе</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <div className="text-3xl font-bold text-indigo-600">{stats.total_submissions}</div>
          <div className="text-sm text-gray-500 mt-1">Жооп жиберилген</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
          <div className="text-lg font-semibold text-gray-700">
            {stats.last_active_at
              ? new Date(stats.last_active_at).toLocaleDateString('ky-KG')
              : '—'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Акыркы активность</div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Акыркы 20 жооп</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Маселе</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тил</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Убакыт</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {recent_submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  Жооп жок
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
                    {new Date(s.created_at).toLocaleString('ky-KG')}
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
