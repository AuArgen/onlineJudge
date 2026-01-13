'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateContest() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    visibility: 'public'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8000/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString()
        }),
      });
      
      if (res.ok) {
        const contest = await res.json();
        router.push(`/contests/${contest.id}/edit`);
      } else {
        alert('Ошибка при создании соревнования');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Создать соревнование</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Название</label>
          <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Описание</label>
          <textarea required rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Начало</label>
            <input type="datetime-local" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Конец</label>
            <input type="datetime-local" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          Создать
        </button>
      </form>
    </div>
  );
}
