'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface UserWithStats {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  total_submissions: number;
  solved_count: number;
  last_active_at: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/auth/login'); return; }
    const user = JSON.parse(userData);
    if (user.role !== 'admin') { router.push('/'); return; }

    fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Nav */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gray-900">Админ</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Колдонуучулар</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Колдонуучулар
          {!loading && (
            <span className="ml-2 text-base font-normal text-gray-400">({users.length})</span>
          )}
        </h1>
        <input
          type="text"
          placeholder="Издөө (аты же email)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Колдонуучу</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Чечилген</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Жооп жиберген</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Акыркы активность</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Катталган</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Жүктөлүүдө...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Колдонуучу табылган жок</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' ? 'Админ' : 'Колдонуучу'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{u.solved_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.total_submissions}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.last_active_at
                      ? new Date(u.last_active_at).toLocaleDateString('ky-KG')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('ky-KG')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Карoo →
                    </Link>
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
