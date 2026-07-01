'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const TRANSLATION_LANGS = [
  { code: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function EditProblem() {
  const router = useRouter();
  const { id } = useParams();
  const { t } = useLanguage();
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
    author_language: 'python',
    share_token: ''
  });
  const [testCases, setTestCases] = useState<any[]>([]);
  const [newTest, setNewTest] = useState({ input: '', is_sample: false });
  const [addingTest, setAddingTest] = useState(false);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ input: '', is_sample: false });
  const [savingTest, setSavingTest] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [translations, setTranslations] = useState<Record<string, { title: string; description: string }>>({});
  const [activeLang, setActiveLang] = useState('ky');
  const [savingTranslation, setSavingTranslation] = useState(false);

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
          author_language: data.author_language || 'python',
          share_token: data.share_token || ''
        });
        setTestCases(data.test_cases || []);
        if (data.translations) {
          const tMap: Record<string, { title: string; description: string }> = {};
          for (const tr of data.translations) {
            tMap[tr.language_code] = { title: tr.title, description: tr.description };
          }
          setTranslations(tMap);
        }
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
        alert(t('editProblem.savedSuccess'));
        if (formData.status === 'pending_review') {
          alert(t('editProblem.pendingNotice'));
        }
      } else {
        alert(t('editProblem.updateError'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('editProblem.confirmDelete'))) return;
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
      alert(t('editProblem.noInput'));
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
        alert(errorData.error || t('editProblem.addTestError'));
      }
    } catch (error) {
      console.error(error);
      alert(t('editProblem.networkError'));
    } finally {
      setAddingTest(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm(t('editProblem.confirmDeleteTest'))) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}/testcases/${testId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setTestCases(testCases.filter(tc => tc.id !== testId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartEdit = (tc: any) => {
    setEditingTestId(tc.id);
    setEditData({ input: tc.input, is_sample: tc.is_sample });
  };

  const handleCancelEdit = () => {
    setEditingTestId(null);
    setEditData({ input: '', is_sample: false });
  };

  const handleSaveEdit = async (testId: number) => {
    if (!editData.input) {
      alert(t('editProblem.noInput'));
      return;
    }
    setSavingTest(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}/testcases/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const updated = await res.json();
        setTestCases(testCases.map(tc => tc.id === testId ? updated : tc));
        handleCancelEdit();
      } else {
        const err = await res.json();
        alert(err.error || t('editProblem.updateError'));
      }
    } catch (error) {
      console.error(error);
      alert(t('editProblem.networkError'));
    } finally {
      setSavingTest(false);
    }
  };

  const handleCopyTest = (tc: any) => {
    const text = `Input:\n${tc.input}\n\nOutput:\n${tc.expected_output}`;
    navigator.clipboard.writeText(text);
  };

  const handleShare = async () => {
    if (!shareEmail) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: shareEmail })
      });
      if (res.ok) {
        alert(t('editProblem.shareSuccess'));
        setShareEmail('');
      } else {
        const data = await res.json();
        alert(data.error || t('editProblem.shareError'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveTranslation = async (langCode: string) => {
    const tr = translations[langCode];
    if (!tr?.title || !tr?.description) {
      alert(t('editProblem.fillTranslation'));
      return;
    }
    setSavingTranslation(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}/translations/${langCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: tr.title, description: tr.description })
      });
      if (res.ok) {
        alert(t('editProblem.translationSaved'));
      } else {
        const data = await res.json();
        alert(data.error || t('editProblem.updateError'));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSavingTranslation(false);
    }
  };

  const handleDeleteTranslation = async (langCode: string) => {
    if (!confirm(t('editProblem.confirmDeleteTranslation'))) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}/translations/${langCode}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTranslations(prev => {
          const next = { ...prev };
          delete next[langCode];
          return next;
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateLink = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${id}/share-token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, share_token: data.token });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">{t('editProblem.loading')}</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('editProblem.title')}</h1>
        <div className="space-x-4">
          <button onClick={() => router.push(`/problems/${id}`)} className="text-blue-600 hover:text-blue-800 font-medium">{t('editProblem.preview')}</button>
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium">{t('editProblem.delete')}</button>
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
              <p className="text-sm text-red-700">{t('editProblem.rejectedNotice')}</p>
              {formData.moderation_comment && (
                <p className="text-sm text-red-600 mt-1 font-medium">
                  {t('editProblem.reason')} {formData.moderation_comment}
                </p>
              )}
              <p className="text-sm text-red-600 mt-2">{t('editProblem.fixAndResubmit')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('editProblem.name')}</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('editProblem.description')}</label>
              <textarea required rows={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('editProblem.time')}</label>
                <input type="number" step="0.1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.time_limit} onChange={(e) => setFormData({ ...formData, time_limit: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('editProblem.memory')}</label>
                <input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" value={formData.memory_limit} onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('editProblem.visibility')}</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  disabled={formData.status === 'published'}
                >
                  <option value="private">{t('editProblem.personal')}</option>
                  <option value="public" disabled>{t('editProblem.publicMod')}</option>
                </select>
                {formData.status === 'published' && <p className="text-xs text-green-600 mt-1">{t('editProblem.statusPublished')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('editProblem.status')}</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">{t('editProblem.draft')}</option>
                  <option value="pending_review">{t('editProblem.pendingReview')}</option>
                  {formData.status === 'published' && <option value="published" disabled>{t('editProblem.statusPublished')}</option>}
                  {formData.status === 'rejected' && <option value="rejected" disabled>{t('editProblem.rejected')}</option>}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {formData.status === 'pending_review' ? t('editProblem.saveAndSubmit') : t('editProblem.save')}
            </button>
          </form>

          {/* Sharing */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('editProblem.shareTitle')}</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('editProblem.byEmail')}</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="user@example.com"
                  className="flex-grow border rounded p-2 text-sm"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                <button onClick={handleShare} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
                  {t('editProblem.addAccess')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('editProblem.linkAccess')}</label>
              {formData.share_token ? (
                <div className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                  <code className="text-xs flex-grow truncate">
                    {`${window.location.origin}/problems/${id}?token=${formData.share_token}`}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/problems/${id}?token=${formData.share_token}`)}
                    className="text-blue-600 text-xs font-medium hover:underline"
                  >
                    {t('editProblem.copyLink')}
                  </button>
                </div>
              ) : (
                <button onClick={handleGenerateLink} className="text-blue-600 text-sm hover:underline">
                  {t('editProblem.generateLink')}
                </button>
              )}
            </div>
          </div>

          {/* Translations */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('editProblem.translationsTitle')}</h3>
            <p className="text-xs text-gray-500 mb-4">{t('editProblem.translationsNote')}</p>
            <div className="flex gap-2 mb-4">
              {TRANSLATION_LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition ${activeLang === l.code ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                >
                  {l.flag} {l.label} {translations[l.code] ? '✓' : ''}
                </button>
              ))}
            </div>
            {TRANSLATION_LANGS.filter(l => l.code === activeLang).map(l => (
              <div key={l.code} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('editProblem.titleLabel')} ({l.label})</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    value={translations[l.code]?.title || ''}
                    onChange={e => setTranslations(prev => ({ ...prev, [l.code]: { ...prev[l.code], title: e.target.value, description: prev[l.code]?.description || '' } }))}
                    placeholder={`${t('editProblem.titleLabel')} (${l.label})`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('editProblem.descLabel')} ({l.label})</label>
                  <textarea
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 font-mono text-sm"
                    value={translations[l.code]?.description || ''}
                    onChange={e => setTranslations(prev => ({ ...prev, [l.code]: { title: prev[l.code]?.title || '', description: e.target.value } }))}
                    placeholder={`${t('editProblem.descLabel')} (${l.label}, Markdown)`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveTranslation(l.code)}
                    disabled={savingTranslation}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingTranslation ? t('editProblem.savingTranslation') : `${l.flag} ${l.label} ${t('editProblem.saveTranslation')}`}
                  </button>
                  {translations[l.code] && (
                    <button
                      onClick={() => handleDeleteTranslation(l.code)}
                      className="text-red-600 border border-red-300 px-3 py-2 rounded text-sm hover:bg-red-50"
                    >
                      {t('editProblem.deleteTranslation')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Author Solution Editor */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('editProblem.authorSolution')}</h3>
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
            <p className="text-xs text-gray-500 mt-2">{t('editProblem.authorNote')}</p>
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('editProblem.tests')}</h3>

            {/* Add Test Form */}
            <div className="space-y-3 mb-6 border-b pb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('editProblem.input')}</label>
                <textarea className="w-full border rounded p-2 text-sm font-mono h-20" value={newTest.input} onChange={(e) => setNewTest({...newTest, input: e.target.value})} />
              </div>

              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={newTest.is_sample} onChange={(e) => setNewTest({...newTest, is_sample: e.target.checked})} />
                <span>{t('editProblem.showSample')}</span>
              </label>
              <button
                onClick={handleAddTest}
                disabled={addingTest}
                className="w-full bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
              >
                {addingTest ? t('editProblem.generating') : t('editProblem.addTest')}
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {testCases.map((tc: any, i: number) => (
                <div key={tc.id} className="border rounded p-3 text-sm">
                  <div className="font-bold mb-2 flex justify-between items-center">
                    <span>Test #{i + 1} {tc.is_sample && <span className="text-blue-600 text-xs ml-1">(Sample)</span>}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopyTest(tc)}
                        className="text-gray-400 hover:text-gray-700 px-1.5 py-0.5 rounded text-xs border border-gray-200 hover:border-gray-400"
                        title="Copy"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => editingTestId === tc.id ? handleCancelEdit() : handleStartEdit(tc)}
                        className="text-blue-500 hover:text-blue-700 px-1.5 py-0.5 rounded text-xs border border-blue-200 hover:border-blue-400"
                      >
                        {editingTestId === tc.id ? t('editProblem.close') : t('editProblem.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteTest(tc.id)}
                        className="text-red-500 hover:text-red-700 px-1.5 py-0.5 rounded text-xs border border-red-200 hover:border-red-400"
                      >
                        {t('editProblem.deleteTest')}
                      </button>
                    </div>
                  </div>

                  {editingTestId === tc.id ? (
                    <div className="space-y-2 mt-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('editProblem.inputLabel')}</label>
                        <textarea
                          className="w-full border rounded p-2 text-xs font-mono h-20 focus:ring-1 focus:ring-blue-400"
                          value={editData.input}
                          onChange={e => setEditData({ ...editData, input: e.target.value })}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editData.is_sample}
                          onChange={e => setEditData({ ...editData, is_sample: e.target.checked })}
                        />
                        {t('editProblem.sampleLabel')}
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(tc.id)}
                          disabled={savingTest}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          {savingTest ? t('editProblem.saving') : t('editProblem.saveEdit')}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-50"
                        >
                          {t('editProblem.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-1.5 rounded font-mono text-xs whitespace-pre-wrap break-all" title={tc.input}>
                        <span className="text-gray-400">In: </span>{tc.input}
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded font-mono text-xs whitespace-pre-wrap break-all" title={tc.expected_output}>
                        <span className="text-gray-400">Out: </span>{tc.expected_output}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {testCases.length === 0 && <p className="text-gray-500 text-center text-sm py-4">{t('editProblem.noTests')}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
