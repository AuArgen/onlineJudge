'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPanel() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    fetch('http://localhost:8000/api/admin/problems', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 403) {
          alert('Access Denied');
          window.location.href = '/';
          return [];
        }
        return res.json();
      })
      .then(setProblems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/admin/problems/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setProblems(problems.filter((p: any) => p.id !== id));
      } else {
        alert('Error performing action');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-red-600">Админ Панель</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Задачи на проверку</h3>
        </div>
        
        {problems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Нет задач, ожидающих проверки.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {problems.map((problem: any) => (
              <li key={problem.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link href={`/problems/${problem.id}`} className="text-lg font-medium text-blue-600 truncate hover:underline">
                      {problem.title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      ID: {problem.id} | Автор ID: {problem.author_id}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAction(problem.id, 'approve')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                    >
                      Одобрить
                    </button>
                    <button 
                      onClick={() => handleAction(problem.id, 'reject')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
