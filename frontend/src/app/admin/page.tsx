'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetch(`${API_URL}/admin/problems`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProblems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ панели</h1>
      <p className="text-gray-500 mb-8 text-sm">Системаны башкаруу</p>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          href="/admin"
          className="bg-indigo-600 text-white rounded-xl p-5 shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <div className="text-2xl mb-1">📋</div>
          <div className="font-semibold text-lg">Маселелер</div>
          <div className="text-indigo-200 text-sm mt-0.5">Модерация күтүп жатат</div>
          {!loading && (
            <div className="mt-3 text-3xl font-bold">{problems.length}</div>
          )}
        </Link>

        <Link
          href="/admin/users"
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-1">👥</div>
          <div className="font-semibold text-lg text-gray-900">Колдонуучулар</div>
          <div className="text-gray-400 text-sm mt-0.5">Тизме жана профили</div>
          <div className="mt-3 text-indigo-600 text-sm font-medium">Карoo →</div>
        </Link>

        <Link
          href="/admin/activity"
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-1">📊</div>
          <div className="font-semibold text-lg text-gray-900">Активность</div>
          <div className="text-gray-400 text-sm mt-0.5">Акыркы 30 күн</div>
          <div className="mt-3 text-indigo-600 text-sm font-medium">Карoo →</div>
        </Link>
      </div>

      {/* Pending problems table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Модерацияга күтүп жаткан маселелер</h2>
          {!loading && problems.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
              {problems.length}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Аталышы</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Автор ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Аракет</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Жүктөлүүдө...</td></tr>
              ) : problems.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Модерацияга маселе жок.</td></tr>
              ) : (
                problems.map((problem: any) => (
                  <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{problem.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/problems/${problem.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.author_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(problem.created_at).toLocaleDateString('ky-KG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/problems/${problem.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Текшерүү →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
