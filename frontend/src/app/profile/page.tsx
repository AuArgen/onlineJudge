'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    fetch('http://localhost:8000/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProfile)
      .catch(console.error);
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* User Info Card */}
        <div className="md:w-1/3">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-600">
              {profile.user.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.user.name}</h2>
            <p className="text-gray-500 mb-4">{profile.user.email}</p>
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {profile.user.role}
            </span>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <p className="text-2xl font-bold text-green-600">{profile.solved_count}</p>
                <p className="text-xs text-gray-500 uppercase">Решено</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-100">
                <p className="text-2xl font-bold text-gray-700">{profile.total_submissions}</p>
                <p className="text-xs text-gray-500 uppercase">Попыток</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Problems */}
        <div className="md:w-2/3">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Мои задачи</h2>
              <Link href="/problems/create" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                + Создать
              </Link>
            </div>

            {profile.my_problems && profile.my_problems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profile.my_problems.map((p: any) => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link href={`/problems/${p.id}`} className="hover:text-blue-600">{p.title}</Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            p.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/problems/${p.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            Изменить
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Вы еще не создали ни одной задачи.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
