'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface ActivityEntry {
  submission_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  problem_id: number;
  problem_title: string;
  language: string;
  status: string;
  execution_time: string;
  created_at: string;
}

interface ActivityResponse {
  days: number;
  since: string;
  activity: ActivityEntry[];
}

const statusColors: Record<string, string> = {
  Accepted: 'bg-green-100 text-green-700',
  'Wrong Answer': 'bg-red-100 text-red-700',
  'Time Limit Exceeded': 'bg-yellow-100 text-yellow-700',
  'Runtime Error': 'bg-orange-100 text-orange-700',
  'System Error': 'bg-gray-100 text-gray-600',
  Pending: 'bg-blue-100 text-blue-700',
};

const DAY_OPTIONS = [7, 14, 30, 60, 90];

export default function AdminActivityPage() {
  const router = useRouter();
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchActivity = (d: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/admin/activity?days=${d}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/auth/login'); return; }
    const user = JSON.parse(userData);
    if (user.role !== 'admin') { router.push('/'); return; }
    fetchActivity(days);
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDaysChange = (d: number) => {
    setDays(d);
    fetchActivity(d);
  };

  const activity = data?.activity ?? [];
  const filtered = statusFilter
    ? activity.filter((a) => a.status === statusFilter)
    : activity;

  const acceptedCount = activity.filter((a) => a.status === 'Accepted').length;
  const uniqueUsers = new Set(activity.map((a) => a.user_id)).size;
  const uniqueProblems = new Set(activity.map((a) => a.problem_id)).size;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gray-900">Админ</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Активность</span>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Колдонуучулардын активности</h1>

        {/* Day selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {d} күн
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      {!loading && data && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{activity.length}</div>
            <div className="text-xs text-gray-500 mt-1">Жалпы жооп</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
            <div className="text-xs text-gray-500 mt-1">Кабыл алынган</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{uniqueUsers}</div>
            <div className="text-xs text-gray-500 mt-1">Активдүү колдонуучу</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{uniqueProblems}</div>
            <div className="text-xs text-gray-500 mt-1">Аракет кылынган маселе</div>
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-500">Статус:</span>
        {['', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
            }`}
          >
            {s || 'Баары'}
          </button>
        ))}
      </div>

      {/* Activity table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Колдонуучу</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Маселе</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тил</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Убакыт</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Жүктөлүүдө...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  {days} күн ичинде активность жок
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.submission_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/users/${entry.user_id}`}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold flex-shrink-0">
                        {entry.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-indigo-600 group-hover:underline">
                          {entry.user_name}
                        </div>
                        <div className="text-xs text-gray-400">{entry.user_email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/problems/${entry.problem_id}`}
                      className="text-sm text-gray-700 hover:text-indigo-600 hover:underline"
                    >
                      {entry.problem_title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{entry.language}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[entry.status] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{entry.execution_time || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleString('ky-KG')}
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
