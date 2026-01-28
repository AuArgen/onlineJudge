'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function ReviewProblem() {
  const { id } = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch(`${API_URL}/problems/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setProblem)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleApprove = async () => {
    if (!confirm('Опубликовать эту задачу?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/admin/problems/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    router.push('/admin');
  };

  const handleReject = async () => {
    if (!reason) {
      alert('Укажите причину отклонения.');
      return;
    }
    if (!confirm('Отклонить эту задачу?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/admin/problems/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ reason })
    });
    router.push('/admin');
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;
  if (!problem) return <div className="p-10 text-center">Задача не найдена.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Модерация задачи</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{problem.title}</h2>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold mb-2">Описание</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold mb-2">Тесты</h3>
        {problem.test_cases && problem.test_cases.length > 0 ? (
          <div className="space-y-2">
            {problem.test_cases.map((tc: any, i: number) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-gray-50 p-2 rounded">
                <pre className="text-sm font-mono">Input: {tc.input}</pre>
                <pre className="text-sm font-mono">Output: {tc.expected_output}</pre>
              </div>
            ))}
          </div>
        ) : <p>Нет тестов.</p>}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Решение модератора</h3>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-grow w-full">
            <textarea 
              className="w-full border rounded p-2" 
              rows={3} 
              placeholder="Причина отклонения (если нужно)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg">
              Отклонить
            </button>
            <button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
              Опубликовать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
