'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [problems, setProblems] = useState([]);
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

    fetch('http://localhost:8000/api/admin/problems', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setProblems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Админ панель</h1>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Задачи на модерации</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Автор ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10">Загрузка...</td></tr>
              ) : problems.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Нет задач на модерации.</td></tr>
              ) : (
                problems.map((problem: any) => (
                  <tr key={problem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{problem.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/problems/${problem.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.author_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(problem.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/problems/${problem.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Проверить
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
