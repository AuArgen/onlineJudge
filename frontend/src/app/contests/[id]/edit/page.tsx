'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function EditContest() {
  const { id } = useParams();
  const router = useRouter();
  const [contest, setContest] = useState<any>(null);
  const [problemId, setProblemId] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    visibility: 'public',
    status: 'draft',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    fetch(`${API_URL}/contests/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setContest(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          start_time: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : '',
          end_time: data.end_time ? new Date(data.end_time).toISOString().slice(0, 16) : '',
          visibility: data.visibility || 'public',
          status: data.status || 'draft',
        });
      })
      .catch(console.error);
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/contests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setContest(updated);
        alert('Сохранено!');
      } else {
        alert('Ошибка при сохранении');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddProblem = async () => {
    if (!problemId) return;
    const res = await fetch(`${API_URL}/contests/${id}/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ problem_id: parseInt(problemId) })
    });
    if (res.ok) {
      setProblemId('');
      const updated = await fetch(`${API_URL}/contests/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());
      setContest(updated);
    } else {
      alert('Ошибка при добавлении задачи');
    }
  };

  if (!contest) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Редактировать соревнование</h1>
        <button
          onClick={() => router.push(`/contests/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Назад
        </button>
      </div>

      {/* Main fields */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold mb-2">Основная информация</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea
            className="w-full border rounded-lg p-2 h-28 resize-none"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg p-2"
              value={form.start_time}
              onChange={e => setForm({ ...form, start_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Конец</label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg p-2"
              value={form.end_time}
              onChange={e => setForm({ ...form, end_time: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Видимость</label>
            <select
              className="w-full border rounded-lg p-2"
              value={form.visibility}
              onChange={e => setForm({ ...form, visibility: e.target.value })}
            >
              <option value="public">Публичный</option>
              <option value="private">Приватный</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              className="w-full border rounded-lg p-2"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
              <option value="finished">Завершен</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      {/* Problems */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Задачи соревнования</h2>
        <ul className="divide-y mb-6">
          {contest.problems?.length === 0 && (
            <li className="py-3 text-gray-400 text-sm">Задач ещё нет</li>
          )}
          {contest.problems?.map((p: any, i: number) => (
            <li key={p.id} className="py-3 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-medium text-gray-800">{p.problem?.title}</span>
              <span className="text-xs text-gray-400 ml-1">ID: {p.problem_id}</span>
              <button
                onClick={async () => {
                  if (!confirm('Удалить задачу из соревнования?')) return;
                  const res = await fetch(`${API_URL}/contests/${id}/problems/${p.problem_id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (res.ok) {
                    const updated = await fetch(`${API_URL}/contests/${id}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    }).then(r => r.json());
                    setContest(updated);
                  }
                }}
                className="ml-auto text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="ID задачи"
            className="border rounded-lg p-2 w-40"
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
          />
          <button
            onClick={handleAddProblem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Добавить задачу
          </button>
        </div>
      </div>
    </div>
  );
}
