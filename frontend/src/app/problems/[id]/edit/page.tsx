'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { API_URL } from '@/lib/api';

export default function EditProblem() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 1.0,
    memory_limit: 256,
    visibility: 'private',
    status: 'draft',
    moderation_comment: '',
    author_source_code: '// Write correct solution here to generate outputs',
    author_language: 'python'
  });
  const [testCases, setTestCases] = useState<any[]>([]);
  const [newTest, setNewTest] = useState({ input: '', is_sample: false });
  const [addingTest, setAddingTest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    fetch(`${API_URL}/problems/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setFormData({
          title: data.title,
          description: data.description,
          time_limit: data.time_limit,
          memory_limit: data.memory_limit,
          visibility: data.visibility,
          status: data.status,
          moderation_comment: data.moderation_comment || '',
          author_source_code: data.author_source_code || '// Write correct solution here to generate outputs',
          author_language: data.author_language || 'python'
        });
        setTestCases(data.test_cases || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/problems/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        alert('Задача обновлена!');
        // If sent to moderation, maybe redirect or show message
        if (formData.status === 'pending_review') {
          alert('Задача отправлена на модерацию. Ожидайте решения администратора.');
        }
      } else {
        alert('Ошибка при обновлении');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) router.push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTest = async () => {
    if (!newTest.input) {
      alert('Введите входные данные');
      return;
    }

    setAddingTest(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/problems/${id}/testcases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTest),
      });
      
      if (res.ok) {
        const addedTest = await res.json();
        setTestCases([...testCases, addedTest]);
        setNewTest({ input: '', is_sample: false });
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Ошибка при добавлении теста');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка сети');
    } finally {
      setAddingTest(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm('Удалить тест?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}/testcases/${testId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setTestCases(testCases.filter(t => t.id !== testId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Редактировать задачу</h1>
        <div className="space-x-4">
          <button onClick={() => router.push(`/problems/${id}`)} className="text-blue-600 hover:text-blue-800 font-medium">Просмотр</button>
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium">Удалить задачу</button>
        </div>
      </div>

      {/* Rejection Notice */}
      {formData.status === 'rejected' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Задача отклонена модератором.
              </p>
              {formData.moderation_comment && (
                <p className="text-sm text-red-600 mt-1 font-medium">
                  Причина: {formData.moderation_comment}
                </p>
              )}
              <p className="text-sm text-red-600 mt-2">
                Исправьте ошибки и отправьте на модерацию повторно.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Название</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <textarea required rows={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Время (сек)</label>
                <input type="number" step="0.1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.time_limit} onChange={(e) => setFormData({ ...formData, time_limit: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Память (МБ)</label>
                <input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.memory_limit} onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Доступность</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white" 
                  value={formData.visibility} 
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  disabled={formData.status === 'published'} // Cannot change visibility if published (must be approved again)
                >
                  <option value="private">Личное</option>
                  <option value="public" disabled>Публичное (только через модерацию)</option>
                </select>
                {formData.status === 'published' && <p className="text-xs text-green-600 mt-1">Опубликовано</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white" 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Черновик</option>
                  <option value="pending_review">На модерацию</option>
                  {formData.status === 'published' && <option value="published" disabled>Опубликовано</option>}
                  {formData.status === 'rejected' && <option value="rejected" disabled>Отклонено</option>}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {formData.status === 'pending_review' ? 'Сохранить и отправить на модерацию' : 'Сохранить изменения'}
            </button>
          </form>

          {/* Author Solution Editor */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Авторское решение (для генерации тестов)</h3>
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
            <p className="text-xs text-gray-500 mt-2">Не забудьте нажать "Сохранить изменения", чтобы сохранить код решения.</p>
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Тесты</h3>
            
            {/* Add Test Form */}
            <div className="space-y-3 mb-6 border-b pb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ввод</label>
                <textarea className="w-full border rounded p-2 text-sm font-mono h-20" value={newTest.input} onChange={(e) => setNewTest({...newTest, input: e.target.value})} />
              </div>
              
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={newTest.is_sample} onChange={(e) => setNewTest({...newTest, is_sample: e.target.checked})} />
                <span>Показывать как пример</span>
              </label>
              <button 
                onClick={handleAddTest} 
                disabled={addingTest}
                className="w-full bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
              >
                {addingTest ? 'Генерация и добавление...' : 'Добавить тест'}
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {testCases.map((tc: any, i: number) => (
                <div key={tc.id} className="border rounded p-3 text-sm relative group">
                  <div className="font-bold mb-1 flex justify-between">
                    <span>Тест #{i + 1} {tc.is_sample && <span className="text-blue-600 text-xs">(Sample)</span>}</span>
                    <button onClick={() => handleDeleteTest(tc.id)} className="text-red-500 hover:text-red-700">X</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-1 rounded truncate font-mono text-xs" title={tc.input}>In: {tc.input}</div>
                    <div className="bg-gray-50 p-1 rounded truncate font-mono text-xs" title={tc.expected_output}>Out: {tc.expected_output}</div>
                  </div>
                </div>
              ))}
              {testCases.length === 0 && <p className="text-gray-500 text-center text-sm">Нет тестов</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
