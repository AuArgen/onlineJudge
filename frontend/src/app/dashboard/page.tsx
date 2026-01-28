'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'contests'>('problems');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Fetch My Problems
    fetch(`${API_URL}/problems?filter=my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setProblems)
      .catch(console.error);

    // Fetch My Contests
    fetch(`${API_URL}/contests`, {
       headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
         const myContests = data.filter((c: any) => c.author_id === JSON.parse(userData).id);
         setContests(myContests);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  }, [router]);

  const handleDeleteProblem = async (problemId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${problemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProblems(problems.filter((p: any) => p.id !== problemId));
        alert('Задача удалена!');
      } else {
        alert('Ошибка при удалении');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <div className="flex gap-4">
          <Link href="/problems/create" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition text-sm">
            + Создать задачу
          </Link>
          <Link href="/contests/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
            + Создать соревнование
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'problems'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('problems')}
        >
          Мои задачи
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'contests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('contests')}
        >
          Мои соревнования
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Загрузка...</div>
      ) : (
        <>
          {/* Problems Tab */}
          {activeTab === 'problems' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Решили</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {problems.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-500">У вас пока нет задач.</td></tr>
                    ) : (
                      problems.map((problem: any) => (
                        <tr key={problem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/problems/${problem.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                              {problem.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              problem.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {problem.visibility}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                            {problem.solved_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(problem.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <Link href={`/problems/${problem.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                              Изменить
                            </Link>
                            <button onClick={() => handleDeleteProblem(problem.id)} className="text-red-600 hover:text-red-900">
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contests Tab */}
          {activeTab === 'contests' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Начало</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Конец</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contests.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-500">У вас пока нет соревнований.</td></tr>
                    ) : (
                      contests.map((contest: any) => (
                        <tr key={contest.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/contests/${contest.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                              {contest.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {contest.status || 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contest.start_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contest.end_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <Link href={`/contests/${contest.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                              Управление
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
