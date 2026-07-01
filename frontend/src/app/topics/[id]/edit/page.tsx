'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTopic, updateTopic } from '@/lib/api';

export default function EditTopicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getTopic(id)
      .then((d) => {
        setTitle(d.topic.title);
        setVisibility(d.topic.visibility);
      })
      .catch(() => setError('Тема табылган жок'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Аталышты киргизиңиз'); return; }
    setSaving(true);
    setError('');
    try {
      await updateTopic(id, { title: title.trim(), visibility });
      router.push(`/topics/${id}`);
    } catch (err: any) {
      setError(err.message || 'Ката чыкты');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Жүктөлүп жатат...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Link href={`/topics/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Темага кайтуу
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Теманы өзгөртүү</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Аталышы <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Жеткиликтүүлүк</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'private', label: 'Жашыруун', desc: 'Ссылка же email менен', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { key: 'public', label: 'Жалпы', desc: 'Бардыгы көрө алат', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setVisibility(opt.key as any)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                  visibility === opt.key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
                </svg>
                <div>
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs opacity-70">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
          >
            {saving ? 'Сакталып жатат...' : 'Сактоо'}
          </button>
          <Link
            href={`/topics/${id}`}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
          >
            Жокко чыгаруу
          </Link>
        </div>
      </form>
    </div>
  );
}
