'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProblem } from '@/lib/api';
import Editor from '@monaco-editor/react';

export default function CreateProblem() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 1.0,
    memory_limit: 256,
    author_source_code: '// Write correct solution here',
    author_language: 'python'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProblem(formData);
      router.push('/profile'); // Redirect to profile to see the new problem
    } catch (error) {
      alert('Error creating problem');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Создать задачу</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Название</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <textarea
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Время (сек)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Память (МБ)</label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  value={formData.memory_limit}
                  onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Author Solution */}
          <div className="bg-white shadow rounded-lg p-6 h-fit">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Авторское решение (Обязательно)</h3>
            <div className="mb-4">
              <select 
                value={formData.author_language} 
                onChange={(e) => setFormData({ ...formData, author_language: e.target.value })}
                className="border rounded px-2 py-1 text-sm bg-white"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
              </select>
            </div>
            <div className="h-64 border rounded">
              <Editor
                height="100%"
                defaultLanguage="python"
                language={formData.author_language === 'cpp' ? 'cpp' : formData.author_language}
                value={formData.author_source_code}
                onChange={(value) => setFormData({ ...formData, author_source_code: value || '' })}
                theme="vs-light"
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Этот код будет использоваться для генерации ответов к тестам.</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Создать задачу
        </button>
      </form>
    </div>
  );
}
