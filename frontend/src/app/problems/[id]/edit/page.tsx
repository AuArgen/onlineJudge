'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';

// Simple Toast Component
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} transition-opacity duration-300`}>
      {message}
    </div>
  );
}

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
    author_source_code: '// Write correct solution here to generate outputs',
    author_language: 'python'
  });
  const [testCases, setTestCases] = useState<any[]>([]);
  const [newTest, setNewTest] = useState({ input: '', is_sample: false });
  const [addingTest, setAddingTest] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    fetch(`http://localhost:8000/api/problems/${id}`, {
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
      const res = await fetch(`http://localhost:8000/api/problems/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        showToast('Задача успешно обновлена!', 'success');
      } else {
        showToast('Ошибка при обновлении задачи', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Ошибка сети', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/problems/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        router.push('/profile');
      } else {
        showToast('Ошибка при удалении задачи', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Ошибка сети', 'error');
    }
  };

  const handleAddTest = async () => {
    if (!newTest.input) {
      showToast('Введите входные данные', 'error');
      return;
    }

    setAddingTest(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:8000/api/problems/${id}/testcases`, {
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
        showToast('Тест успешно добавлен!', 'success');
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Ошибка при добавлении теста', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Ошибка сети', 'error');
    } finally {
      setAddingTest(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm('Удалить тест?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/problems/${id}/testcases/${testId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setTestCases(testCases.filter(t => t.id !== testId));
        showToast('Тест удален', 'success');
      } else {
        showToast('Ошибка при удалении теста', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Ошибка сети', 'error');
    }
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  const sampleCount = testCases.filter(t => t.is_sample).length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Редактировать задачу</h1>
        <div className="space-x-4">
          <button onClick={() => router.push(`/problems/${id}`)} className="text-blue-600 hover:text-blue-800 font-medium">Просмотр</button>
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium">Удалить задачу</button>
        </div>
      </div>
      
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
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white" value={formData.visibility} onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}>
                  <option value="private">Личное</option>
                  <option value="link">По ссылке</option>
                  <option value="public" disabled>Публичное (через модерацию)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="draft">Черновик</option>
                  <option value="pending_review">На модерацию</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Сохранить изменения</button>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Тесты</h3>
              <div className="text-xs text-gray-500 text-right">
                <div>Всего: {testCases.length}</div>
                <div>Примеры: {sampleCount}</div>
              </div>
            </div>
            
            {/* Add Test Form */}
            <div className="space-y-3 mb-6 border-b pb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ввод</label>
                <textarea className="w-full border rounded p-2 text-sm font-mono h-20" value={newTest.input} onChange={(e) => setNewTest({...newTest, input: e.target.value})} placeholder="Введите данные..." />
              </div>
              
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={newTest.is_sample} onChange={(e) => setNewTest({...newTest, is_sample: e.target.checked})} />
                <span>Показывать как пример</span>
              </label>
              <button 
                onClick={handleAddTest} 
                disabled={addingTest}
                className="w-full bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {addingTest ? 'Генерация и добавление...' : 'Добавить тест'}
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {testCases.map((tc: any, i: number) => (
                <div key={tc.id} className="border rounded p-3 text-sm relative group hover:border-blue-300 transition">
                  <div className="font-bold mb-1 flex justify-between items-center">
                    <span>Тест #{i + 1} {tc.is_sample && <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded ml-1">Sample</span>}</span>
                    <button onClick={() => handleDeleteTest(tc.id)} className="text-gray-400 hover:text-red-600 transition" title="Удалить">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-1">
                    <div className="bg-gray-50 p-1.5 rounded truncate font-mono text-xs border border-gray-100" title={tc.input}>In: {tc.input}</div>
                    <div className="bg-gray-50 p-1.5 rounded truncate font-mono text-xs border border-gray-100" title={tc.expected_output}>Out: {tc.expected_output}</div>
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">
                    {/* Assuming created_at is available, otherwise hide */}
                    {/* {new Date(tc.created_at).toLocaleString()} */}
                  </div>
                </div>
              ))}
              {testCases.length === 0 && <p className="text-gray-500 text-center text-sm py-4">Нет тестов</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
