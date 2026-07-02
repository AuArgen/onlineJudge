'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProblem, aiDraftProblem } from '@/lib/api';
import Editor from '@monaco-editor/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateProblem() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 1.0,
    memory_limit: 256,
    difficulty: 'medium',
    author_source_code: '// Write correct solution here',
    author_language: 'python'
  });

  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleAiDraft = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const draft = await aiDraftProblem(aiPrompt.trim(), formData.difficulty);
      setFormData({
        ...formData,
        title: draft.title || formData.title,
        description: draft.description || formData.description,
        time_limit: draft.time_limit || formData.time_limit,
        memory_limit: draft.memory_limit || formData.memory_limit,
      });
      setShowAiAssistant(false);
    } catch (err: any) {
      setAiError(err.message || t('createProblem.aiError'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const problem = await createProblem(formData);
      router.push(`/problems/${problem.id}/edit`);
    } catch (error) {
      alert(t('createProblem.error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('createProblem.title')}</h1>
        <button
          type="button"
          onClick={() => setShowAiAssistant(!showAiAssistant)}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg px-3 py-2 hover:bg-purple-50 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          {t('createProblem.aiAssistant')}
        </button>
      </div>

      {showAiAssistant && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-3">
          <p className="text-sm text-purple-900 font-medium">{t('createProblem.aiAssistantHint')}</p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
            placeholder={t('createProblem.aiAssistantPlaceholder')}
            className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
          />
          {aiError && <p className="text-xs text-red-600">{aiError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAiDraft}
              disabled={aiLoading || !aiPrompt.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {aiLoading ? t('createProblem.aiGenerating') : t('createProblem.aiAssistantBtn')}
            </button>
            <button
              type="button"
              onClick={() => setShowAiAssistant(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t('topicForm.cancel')}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('createProblem.name')}</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('createProblem.description')}</label>
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
                <label className="block text-sm font-medium text-gray-700">{t('createProblem.time')}</label>
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
                <label className="block text-sm font-medium text-gray-700">{t('createProblem.memory')}</label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  value={formData.memory_limit}
                  onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('createProblem.difficulty')}</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="easy">{t('difficulty.easy')}</option>
                <option value="medium">{t('difficulty.medium')}</option>
                <option value="hard">{t('difficulty.hard')}</option>
              </select>
            </div>
          </div>

          {/* Author Solution */}
          <div className="bg-white shadow rounded-lg p-6 h-fit">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createProblem.authorSolution')}</h3>
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
            <p className="text-xs text-gray-500 mt-2">{t('createProblem.authorNote')}</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('createProblem.create')}
        </button>
      </form>
    </div>
  );
}
