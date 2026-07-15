'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTopic, updateTopic } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EditTopicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [orderNum, setOrderNum] = useState(0);
  const [isOfficial, setIsOfficial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    getTopic(id)
      .then((d) => {
        setTitle(d.topic.title);
        setVisibility(d.topic.visibility);
        setSlug(d.topic.slug || '');
        setSummary(d.topic.summary || '');
        setOrderNum(d.topic.order_num || 0);
        setIsOfficial(!!d.topic.is_official);
      })
      .catch(() => setError(t('topicForm.notFound')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError(t('topicForm.nameRequired')); return; }
    setSaving(true);
    setError('');
    try {
      const payload: Parameters<typeof updateTopic>[1] = {
        title: title.trim(),
        visibility,
        slug: slug.trim(),
        summary: summary.trim(),
        order_num: orderNum,
      };
      if (isAdmin) payload.is_official = isOfficial;
      await updateTopic(id, payload);
      router.push(`/topics/${id}`);
    } catch (err: any) {
      setError(err.message || t('topicForm.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">{t('topicForm.loadingTopic')}</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Link href={`/topics/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('topicForm.backToTopic')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('topicForm.editTitle')}</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('topicForm.name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('topicForm.visibility')}</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'private', label: t('topicForm.private'), desc: t('topicForm.privateDesc'), icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { key: 'public', label: t('topicForm.public'), desc: t('topicForm.publicDesc'), icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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

        {/* Curriculum & SEO fields for the public /learn section */}
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">{t('topicForm.curriculumSection')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('topicForm.slug')}</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="binary-search"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">{t('topicForm.slugHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('topicForm.summary')}</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">{t('topicForm.summaryHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('topicForm.orderNum')}</label>
            <input
              type="number"
              value={orderNum}
              onChange={(e) => setOrderNum(parseInt(e.target.value, 10) || 0)}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isAdmin && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isOfficial}
                onChange={(e) => setIsOfficial(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-700">{t('topicForm.isOfficial')}</span>
                <span className="block text-xs text-gray-400 mt-0.5">{t('topicForm.isOfficialDesc')}</span>
              </span>
            </label>
          )}
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
            {saving ? t('topicForm.saving') : t('topicForm.saveBtn')}
          </button>
          <Link
            href={`/topics/${id}`}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm font-medium"
          >
            {t('topicForm.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
