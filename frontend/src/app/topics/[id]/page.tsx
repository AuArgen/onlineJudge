'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  getTopic, generateTopicShareToken, shareTopicByEmail, revokeTopicAccess,
  addTopicContent, deleteTopicContent, addTopicProblem, removeTopicProblem,
  createTopic, getTopicAnalytics, getTopicUserAnalytics, getProblems, aiGenerateTopicProblems,
  aiGenerateTopicOverview, upsertTopicTranslation, deleteTopicTranslation,
  upsertTopicContentTranslation, deleteTopicContentTranslation, aiTranslateTopic,
} from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { linkifyText } from '@/lib/linkify';

const TRANSLATION_LANGS = LANGUAGES.filter(l => l.code !== 'ru');

function YouTubeEmbed({ src, caption }: { src: string; caption?: string }) {
  return (
    <div className="rounded-xl overflow-hidden bg-black">
      <div className="relative" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && <p className="text-xs text-gray-400 text-center py-2 px-3">{caption}</p>}
    </div>
  );
}

function ContentBlock({ block }: { block: any }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {linkifyText(block.content)}
          {block.caption && <p className="text-xs text-gray-400 mt-1">{block.caption}</p>}
        </div>
      );
    case 'code':
      return (
        <div>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">
            <code>{block.content}</code>
          </pre>
          {block.caption && <p className="text-xs text-gray-400 mt-2 text-center">{block.caption}</p>}
        </div>
      );
    case 'image':
      return (
        <div>
          <img src={block.content} alt={block.caption || ''} className="rounded-xl max-w-full border border-gray-100" />
          {block.caption && <p className="text-sm text-gray-500 mt-2 text-center">{block.caption}</p>}
        </div>
      );
    case 'video':
      return <YouTubeEmbed src={block.content} caption={block.caption} />;
    case 'link':
      return (
        <a
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm break-all"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {block.caption || block.content}
        </a>
      );
    default:
      return null;
  }
}

function TopicDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, lang, setLang } = useLanguage();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ?tab=problems lets the problem page link straight back to the problem
  // list the user came from, not just the topic's overview tab.
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'analytics' | 'share' | 'translate'>(
    searchParams.get('tab') === 'problems' ? 'problems' : 'overview'
  );

  const [showAddContent, setShowAddContent] = useState(false);
  const [contentType, setContentType] = useState('text');
  const [contentValue, setContentValue] = useState('');
  const [contentCaption, setContentCaption] = useState('');
  const [contentLanguage, setContentLanguage] = useState('');
  const [contentError, setContentError] = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const [subtopicTitle, setSubtopicTitle] = useState('');
  const [subtopicVis, setSubtopicVis] = useState<'private' | 'public'>('private');
  const [subtopicLoading, setSubtopicLoading] = useState(false);

  const [showAddProblem, setShowAddProblem] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [showAiGenerate, setShowAiGenerate] = useState(false);
  const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [aiOverviewLoading, setAiOverviewLoading] = useState(false);
  const [aiOverviewError, setAiOverviewError] = useState('');

  const [shareToken, setShareToken] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsUser, setAnalyticsUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const CONTENT_TYPES = [
    { key: 'text', label: t('topicDetail.contentText'), icon: '📝' },
    { key: 'code', label: t('topicDetail.contentCode'), icon: '💻' },
    { key: 'image', label: t('topicDetail.contentImage'), icon: '🖼️' },
    { key: 'video', label: t('topicDetail.contentVideo'), icon: '▶️' },
    { key: 'link', label: t('topicDetail.contentLink'), icon: '🔗' },
  ];

  const [activeTransLang, setActiveTransLang] = useState('ky');
  const [titleTranslation, setTitleTranslation] = useState('');
  const [contentTranslations, setContentTranslations] = useState<Record<number, { content: string; caption: string }>>({});
  const [translationSaving, setTranslationSaving] = useState<number | 'title' | null>(null);
  const [aiTranslateLoading, setAiTranslateLoading] = useState(false);
  const [aiTranslateError, setAiTranslateError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    // Always fetch the base (untranslated) topic here — this page doubles as
    // the owner's editor, and the edit/translate flows need the raw base
    // fields. Localized display for readers is computed client-side below
    // from the already-preloaded translations, not via a refetch.
    getTopic(id)
      .then((d) => {
        setData(d);
        if (d.topic?.share_token) setShareToken(d.topic.share_token);
      })
      .catch(() => setError(t('topicDetail.topics')))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data?.topic) return;
    const titleTr = data.topic.translations?.find((tr: any) => tr.language_code === activeTransLang);
    setTitleTranslation(titleTr?.title || '');
    const drafts: Record<number, { content: string; caption: string }> = {};
    (data.topic.contents || []).forEach((blk: any) => {
      const tr = blk.translations?.find((t: any) => t.language_code === activeTransLang);
      drafts[blk.id] = { content: tr?.content ?? blk.content, caption: tr?.caption ?? blk.caption ?? '' };
    });
    setContentTranslations(drafts);
  }, [data, activeTransLang]);

  const isOwner = user && data?.topic && data.topic.author_id === user.id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentValue.trim()) { setContentError(t('topicDetail.contentEmpty')); return; }
    setContentError('');
    setContentLoading(true);
    try {
      await addTopicContent(id, {
        type: contentType,
        content: contentValue.trim(),
        caption: contentCaption.trim(),
        language: contentType === 'code' ? contentLanguage : undefined,
      });
      setContentValue(''); setContentCaption(''); setContentLanguage(''); setShowAddContent(false);
      load();
    } catch (err: any) {
      setContentError(err.message || t('topicForm.error'));
    } finally {
      setContentLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!confirm(t('topicDetail.confirmDeleteContent'))) return;
    await deleteTopicContent(id, contentId);
    load();
  };

  const handleAddSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtopicTitle.trim()) return;
    setSubtopicLoading(true);
    try {
      await createTopic({ title: subtopicTitle.trim(), visibility: subtopicVis, parent_id: parseInt(id) });
      setSubtopicTitle(''); setShowAddSubtopic(false);
      load();
    } catch (err: any) {
      alert(err.message || t('topicForm.error'));
    } finally {
      setSubtopicLoading(false);
    }
  };

  useEffect(() => {
    if (!showAddProblem || !problemSearch.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(() => {
      setSearchLoading(true);
      getProblems({ search: problemSearch })
        .then((d) => setSearchResults(d.data || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [problemSearch, showAddProblem]);

  const handleAddProblem = async (problemId: number) => {
    try {
      await addTopicProblem(id, problemId);
      setProblemSearch(''); setShowAddProblem(false);
      load();
    } catch (err: any) {
      alert(err.message || t('topicForm.error'));
    }
  };

  const handleAiOverview = async () => {
    setAiOverviewLoading(true);
    setAiOverviewError('');
    try {
      const draft = await aiGenerateTopicOverview(id);
      setContentType('text');
      setContentValue(draft.content || '');
      setContentCaption('');
      setContentError('');
      setShowAddContent(true);
    } catch (err: any) {
      setAiOverviewError(err.message || t('topicDetail.aiOverviewError'));
    } finally {
      setAiOverviewLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      await aiGenerateTopicProblems(id, aiCount, aiDifficulty);
      setShowAiGenerate(false);
      load();
      alert(t('topicDetail.aiGenerateSuccess'));
    } catch (err: any) {
      setAiError(err.message || t('topicDetail.aiGenerateError'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleRemoveProblem = async (problemId: number) => {
    if (!confirm(t('topicDetail.confirmRemoveProblem'))) return;
    await removeTopicProblem(id, problemId);
    load();
  };

  const handleGenerateToken = async () => {
    const res = await generateTopicShareToken(id);
    setShareToken(res.share_token);
    if (data?.topic) setData({ ...data, topic: { ...data.topic, share_token: res.share_token } });
  };

  const handleShareEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    setShareLoading(true);
    setShareMsg('');
    try {
      await shareTopicByEmail(id, shareEmail.trim());
      setShareMsg(t('topicDetail.accessGranted'));
      setShareEmail('');
      load();
    } catch (err: any) {
      setShareMsg(err.message || t('topicForm.error'));
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeAccess = async (accessId: number) => {
    if (!confirm(t('topicDetail.confirmRevokeAccess'))) return;
    await revokeTopicAccess(id, accessId);
    load();
  };

  const handleSaveTitleTranslation = async () => {
    if (!titleTranslation.trim()) return;
    setTranslationSaving('title');
    try {
      await upsertTopicTranslation(id, activeTransLang, titleTranslation.trim());
      load();
    } catch (err: any) {
      alert(err.message || t('topicForm.error'));
    } finally {
      setTranslationSaving(null);
    }
  };

  const handleDeleteTitleTranslation = async () => {
    if (!confirm(t('topicDetail.confirmDeleteTranslation'))) return;
    await deleteTopicTranslation(id, activeTransLang);
    load();
  };

  const handleSaveContentTranslation = async (blockId: number) => {
    const draft = contentTranslations[blockId];
    if (!draft) return;
    setTranslationSaving(blockId);
    try {
      await upsertTopicContentTranslation(id, blockId, activeTransLang, { content: draft.content, caption: draft.caption });
      load();
    } catch (err: any) {
      alert(err.message || t('topicForm.error'));
    } finally {
      setTranslationSaving(null);
    }
  };

  const handleDeleteContentTranslation = async (blockId: number) => {
    if (!confirm(t('topicDetail.confirmDeleteTranslation'))) return;
    await deleteTopicContentTranslation(id, blockId, activeTransLang);
    load();
  };

  const handleAiTranslateTopic = async () => {
    setAiTranslateLoading(true);
    setAiTranslateError('');
    try {
      await aiTranslateTopic(id);
      load();
    } catch (err: any) {
      setAiTranslateError(err.message || t('topicDetail.aiTranslateError'));
    } finally {
      setAiTranslateLoading(false);
    }
  };

  const loadAnalytics = useCallback(() => {
    setAnalyticsLoading(true);
    getTopicAnalytics(id)
      .then(setAnalytics)
      .catch(() => setAnalytics([]))
      .finally(() => setAnalyticsLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
  }, [activeTab, loadAnalytics]);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">{t('topicDetail.loading')}</div>;
  }
  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">{error || t('topicDetail.topics')}</p>
        <Link href="/topics" className="text-blue-600 hover:underline mt-4 inline-block">{t('topicForm.backToTopics')}</Link>
      </div>
    );
  }

  const { topic, problems } = data;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/topics/shared/${shareToken}` : '';

  // Localize for display only — the underlying topic/content objects keep
  // their base (Russian) fields so editing and translation forms always work
  // off the canonical text.
  const displayTitle = lang === 'ru'
    ? topic.title
    : (topic.translations?.find((tr: any) => tr.language_code === lang)?.title || topic.title);
  const localizeBlock = (block: any) => {
    if (lang === 'ru') return block;
    const tr = block.translations?.find((bt: any) => bt.language_code === lang);
    return tr ? { ...block, content: tr.content, caption: tr.caption } : block;
  };

  const analyticsUsers: Record<string, any> = {};
  analytics.forEach((s: any) => {
    if (!analyticsUsers[s.user_id]) {
      analyticsUsers[s.user_id] = { user_name: s.user_name, user_email: s.user_email, problems: {} };
    }
    analyticsUsers[s.user_id].problems[s.problem_id] = {
      solved: s.solved,
      attempts: s.attempts,
      title: s.problem_title,
      solved_at: s.solved_at,
      last_attempt_at: s.last_attempt_at,
    };
  });
  // Columns follow the topic's own problem order (including problems nobody
  // attempted yet), so the matrix always matches the problems tab.
  const analyticsProblems = [...(problems || [])].sort((a: any, b: any) => a.order_num - b.order_num);
  const analyticsProblemIds = analyticsProblems.map((tp: any) => tp.problem_id);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/topics" className="hover:text-gray-900">{t('topicDetail.topics')}</Link>
        {topic.parent_id && (
          <>
            <span>/</span>
            <Link href={`/topics/${topic.parent_id}`} className="hover:text-gray-900">...</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium">{displayTitle}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📁</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">{topic.author?.name}</span>
              {TRANSLATION_LANGS.some(l => topic.translations?.some((tr: any) => tr.language_code === l.code)) && (
                <div className="flex gap-1">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      title={l.label}
                      className={`text-xs px-1.5 py-0.5 rounded border transition ${lang === l.code ? 'bg-blue-50 border-blue-300' : 'border-transparent hover:border-gray-200'}`}
                    >
                      {l.flag}
                    </button>
                  ))}
                </div>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                topic.visibility === 'public' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {topic.visibility === 'public' ? t('topicDetail.public') : t('topicDetail.private')}
              </span>
            </div>
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/topics/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('topicDetail.edit')}
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[
          { key: 'overview', label: t('topicDetail.tabOverview') },
          { key: 'problems', label: `${t('topicDetail.tabProblems')} (${problems?.length || 0})` },
          ...(canEdit ? [
            { key: 'share', label: t('topicDetail.tabShare') },
            { key: 'analytics', label: t('topicDetail.tabAnalytics') },
            { key: 'translate', label: t('topicDetail.tabTranslate') },
          ] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {topic.contents && topic.contents.length > 0 ? (
            <div className="space-y-4">
              {[...topic.contents]
                .sort((a: any, b: any) => a.order_num - b.order_num)
                .map((block: any) => (
                  <div key={block.id} className="bg-white border border-gray-200 rounded-xl p-5 group relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {CONTENT_TYPES.find(ct => ct.key === block.type)?.icon} {CONTENT_TYPES.find(ct => ct.key === block.type)?.label}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteContent(block.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-1 rounded"
                          title={t('topicDetail.deleteBtn')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <ContentBlock block={localizeBlock(block)} />
                  </div>
                ))}
            </div>
          ) : (
            !canEdit && <p className="text-gray-400 text-center py-8">{t('topicDetail.noContent')}</p>
          )}

          {canEdit && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowAddContent(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('topicDetail.addContent')}
              </button>
              <button
                onClick={handleAiOverview}
                disabled={aiOverviewLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition text-sm font-medium disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {aiOverviewLoading ? t('topicDetail.aiOverviewGenerating') : t('topicDetail.aiOverviewBtn')}
              </button>
            </div>
          )}
          {canEdit && aiOverviewError && (
            <p className="text-xs text-red-600">{aiOverviewError}</p>
          )}

          {topic.children && topic.children.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('topicDetail.subtopics')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topic.children.map((child: any) => (
                  <Link
                    key={child.id}
                    href={`/topics/${child.id}`}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm hover:border-blue-200 transition"
                  >
                    <span className="text-xl">📂</span>
                    <span className="font-medium text-gray-900 text-sm">{child.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {canEdit && (
            <button
              onClick={() => setShowAddSubtopic(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('topicDetail.addSubtopic')}
            </button>
          )}
        </div>
      )}

      {/* TAB: Problems */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {problems && problems.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('topicDetail.problem')}</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('topicDetail.statusCol')}</th>
                    {canEdit && <th className="w-10" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...problems]
                    .sort((a: any, b: any) => a.order_num - b.order_num)
                    .map((tp: any, i: number) => (
                      <tr key={tp.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/problems/${tp.problem_id}?topic_id=${id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition text-sm"
                          >
                            {tp.problem?.title || `#${tp.problem_id}`}
                          </Link>
                          {tp.problem?.visibility === 'public' && (
                            <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{t('topicDetail.public2')}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {tp.user_solved ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {t('topicDetail.solved')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        {canEdit && (
                          <td className="px-2 py-3">
                            <button
                              onClick={() => handleRemoveProblem(tp.problem_id)}
                              className="text-gray-300 hover:text-red-500 transition p-1 rounded"
                              title={t('topicDetail.remove')}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400 text-sm">{t('topicDetail.noProblems')}</p>
            </div>
          )}

          {canEdit && (
            <div className="relative flex flex-wrap gap-4">
              <button
                onClick={() => setShowAddProblem(!showAddProblem)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('topicDetail.addProblem')}
              </button>
              {showAddProblem && (
                <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-full">
                  <input
                    type="text"
                    value={problemSearch}
                    onChange={(e) => setProblemSearch(e.target.value)}
                    placeholder={t('topicDetail.searchProblem')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="mt-2 max-h-48 overflow-y-auto">
                    {searchLoading && <p className="text-xs text-gray-400 text-center py-2">{t('topicDetail.searching')}</p>}
                    {!searchLoading && searchResults.length === 0 && problemSearch && (
                      <p className="text-xs text-gray-400 text-center py-2">{t('topicDetail.notFound')}</p>
                    )}
                    {searchResults.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => handleAddProblem(p.id)}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition"
                      >
                        <span className="font-medium text-gray-900">{p.title}</span>
                        <span className="ml-2 text-xs text-gray-400">#{p.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isAdmin && (
                <button
                  onClick={() => setShowAiGenerate(!showAiGenerate)}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {t('topicDetail.aiGenerate')}
                </button>
              )}
              {isAdmin && showAiGenerate && (
                <div className="mt-2 bg-white border border-purple-200 rounded-xl shadow-lg p-4 w-full space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('topicDetail.aiGenerateCount')}</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={aiCount}
                      onChange={(e) => setAiCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('topicDetail.aiGenerateDifficulty')}</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">{t('difficulty.easy')}</option>
                      <option value="medium">{t('difficulty.medium')}</option>
                      <option value="hard">{t('difficulty.hard')}</option>
                    </select>
                  </div>
                  {aiError && <p className="text-xs text-red-600">{aiError}</p>}
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {aiLoading ? t('topicDetail.aiGenerating') : t('topicDetail.aiGenerateBtn')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: Share */}
      {activeTab === 'share' && canEdit && (
        <div className="space-y-6 max-w-xl">
          {/* Link sharing */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {t('topicDetail.shareLinkTitle')}
            </h3>
            {shareToken ? (
              <div>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                  >
                    {t('topicDetail.copyLink')}
                  </button>
                </div>
                <button
                  onClick={handleGenerateToken}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  {t('topicDetail.generateNewLink')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateToken}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                {t('topicDetail.generateLink')}
              </button>
            )}
          </div>

          {/* Email sharing */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('topicDetail.shareEmailTitle')}
            </h3>
            <form onSubmit={handleShareEmail} className="flex gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={shareLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition"
              >
                {shareLoading ? '...' : t('topicDetail.addEmail')}
              </button>
            </form>
            {shareMsg && (
              <p className={`mt-2 text-xs ${shareMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>
                {shareMsg}
              </p>
            )}

            {topic.access_list && topic.access_list.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('topicDetail.accessList')}</p>
                {topic.access_list.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{a.email}</span>
                    <button
                      onClick={() => handleRevokeAccess(a.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      {t('topicDetail.revokeAccess')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Analytics */}
      {activeTab === 'analytics' && canEdit && (
        <div>
          {analyticsLoading ? (
            <p className="text-center text-gray-400 py-8">{t('topicDetail.loading')}</p>
          ) : analytics.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">{t('topicDetail.analyticsEmpty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Problem legend: the matrix columns are numbered, full titles live here */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('topicDetail.analyticsLegend')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  {analyticsProblems.map((tp: any, i: number) => (
                    <Link
                      key={tp.problem_id}
                      href={`/problems/${tp.problem_id}?topic_id=${id}`}
                      className="text-sm text-gray-700 hover:text-blue-600 transition truncate"
                    >
                      <span className="font-mono text-xs text-gray-400 mr-1.5">#{i + 1}</span>
                      {tp.problem?.title || `#${tp.problem_id}`}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('topicDetail.analyticsUser')}</th>
                      {analyticsProblems.map((tp: any, i: number) => (
                        <th
                          key={tp.problem_id}
                          className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase"
                          title={tp.problem?.title || `#${tp.problem_id}`}
                        >
                          #{i + 1}
                        </th>
                      ))}
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('topicDetail.analyticsTotal')}</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(analyticsUsers).map(([uid, userData]: any) => {
                      const solved = Object.values(userData.problems as Record<string, any>).filter((p: any) => p.solved).length;
                      const openUser = () => setAnalyticsUser({ id: uid, name: userData.user_name, email: userData.user_email });
                      return (
                        <tr key={uid} className="hover:bg-gray-50 cursor-pointer" onClick={openUser}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{userData.user_name}</p>
                            <p className="text-xs text-gray-400">{userData.user_email}</p>
                          </td>
                          {analyticsProblemIds.map((pid: any) => {
                            const p = userData.problems[pid];
                            return (
                              <td
                                key={pid}
                                className="px-3 py-3 text-center"
                                title={p ? `${p.title}\n${t('topicDetail.analyticsAttempts')}: ${p.attempts}${p.solved_at ? `\n${t('topicDetail.analyticsSolvedAt')}: ${new Date(p.solved_at).toLocaleString()}` : ''}` : undefined}
                              >
                                {p ? (
                                  p.solved ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </span>
                                      {p.solved_at && (
                                        <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                                          {new Date(p.solved_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-red-400 font-medium">{p.attempts}x</span>
                                  )
                                ) : (
                                  <span className="text-gray-200">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-gray-900">{solved}</span>
                            <span className="text-gray-400">/{analyticsProblemIds.length}</span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); openUser(); }}
                              className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                            >
                              {t('topicDetail.analyticsDetails')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400">{t('topicDetail.analyticsRowHint')}</p>
            </div>
          )}
        </div>
      )}

      {analyticsUser && (
        <UserAnalyticsModal
          topicId={id}
          userId={analyticsUser.id}
          userName={analyticsUser.name}
          userEmail={analyticsUser.email}
          stats={analyticsUsers[analyticsUser.id]?.problems || {}}
          topicProblems={problems || []}
          onClose={() => setAnalyticsUser(null)}
          t={t}
        />
      )}

      {/* TAB: Translate */}
      {activeTab === 'translate' && canEdit && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              {TRANSLATION_LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => setActiveTransLang(l.code)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition ${activeTransLang === l.code ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                >
                  {l.flag} {l.label} {topic.translations?.some((tr: any) => tr.language_code === l.code) ? '✓' : ''}
                </button>
              ))}
            </div>
            <button
              onClick={handleAiTranslateTopic}
              disabled={aiTranslateLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {aiTranslateLoading ? t('topicDetail.aiTranslating') : t('topicDetail.aiTranslateBtn')}
            </button>
          </div>
          {aiTranslateError && <p className="text-xs text-red-600">{aiTranslateError}</p>}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('topicDetail.translateTitleLabel')} ({TRANSLATION_LANGS.find(l => l.code === activeTransLang)?.label})
            </label>
            <input
              type="text"
              value={titleTranslation}
              onChange={(e) => setTitleTranslation(e.target.value)}
              placeholder={topic.title}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveTitleTranslation}
                disabled={translationSaving === 'title'}
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {t('topicDetail.saveTranslation')}
              </button>
              {topic.translations?.some((tr: any) => tr.language_code === activeTransLang) && (
                <button
                  onClick={handleDeleteTitleTranslation}
                  className="text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  {t('topicDetail.deleteTranslation')}
                </button>
              )}
            </div>
          </div>

          {topic.contents && topic.contents.length > 0 && (
            <div className="space-y-4">
              {[...topic.contents]
                .sort((a: any, b: any) => a.order_num - b.order_num)
                .map((block: any) => {
                  const draft = contentTranslations[block.id] || { content: block.content, caption: block.caption || '' };
                  const isEditableContent = block.type === 'text' || block.type === 'code';
                  const hasTranslation = block.translations?.some((tr: any) => tr.language_code === activeTransLang);
                  return (
                    <div key={block.id} className="bg-white border border-gray-200 rounded-xl p-5">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {CONTENT_TYPES.find(ct => ct.key === block.type)?.icon} {CONTENT_TYPES.find(ct => ct.key === block.type)?.label}
                      </span>
                      {isEditableContent ? (
                        <textarea
                          value={draft.content}
                          onChange={(e) => setContentTranslations(prev => ({ ...prev, [block.id]: { ...draft, content: e.target.value } }))}
                          rows={block.type === 'code' ? 6 : 4}
                          className={`mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${block.type === 'code' ? 'font-mono' : ''}`}
                        />
                      ) : (
                        <p className="mt-2 text-xs text-gray-400 break-all">{block.content}</p>
                      )}
                      <input
                        type="text"
                        value={draft.caption}
                        onChange={(e) => setContentTranslations(prev => ({ ...prev, [block.id]: { ...draft, caption: e.target.value } }))}
                        placeholder={t('topicDetail.contentCaption')}
                        className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveContentTranslation(block.id)}
                          disabled={translationSaving === block.id}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {t('topicDetail.saveTranslation')}
                        </button>
                        {hasTranslation && (
                          <button
                            onClick={() => handleDeleteContentTranslation(block.id)}
                            className="text-xs text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50"
                          >
                            {t('topicDetail.deleteTranslation')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{t('topicDetail.addContentModal')}</h3>
              <button onClick={() => { setShowAddContent(false); setContentError(''); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddContent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('topicDetail.contentType')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct.key}
                      type="button"
                      onClick={() => { setContentType(ct.key); setContentValue(''); setContentError(''); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition ${
                        contentType === ct.key
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{ct.icon}</span>{ct.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {contentType === 'text' ? t('topicDetail.contentText') : contentType === 'code' ? t('topicDetail.contentCode') : contentType === 'image' ? t('topicDetail.contentImageUrl') : contentType === 'video' ? t('topicDetail.contentVideoUrl') : t('topicDetail.contentLinkUrl')}
                </label>
                {contentType === 'text' || contentType === 'code' ? (
                  <textarea
                    value={contentValue}
                    onChange={(e) => setContentValue(e.target.value)}
                    rows={contentType === 'code' ? 8 : 5}
                    placeholder={contentType === 'code' ? 'print("Hello, world!")' : `${t('topicDetail.contentText')}...`}
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${contentType === 'code' ? 'font-mono' : ''}`}
                  />
                ) : (
                  <input
                    type="url"
                    value={contentValue}
                    onChange={(e) => setContentValue(e.target.value)}
                    placeholder={
                      contentType === 'image'
                        ? 'https://example.com/image.jpg'
                        : contentType === 'video'
                        ? 'https://www.youtube.com/watch?v=...'
                        : 'https://example.com'
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {contentType === 'code' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('topicDetail.codeLanguage')}</label>
                  <select
                    value={contentLanguage}
                    onChange={(e) => setContentLanguage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">{t('topicDetail.codeLanguageNone')}</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">{t('topicDetail.codeLanguageHint')}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('topicDetail.contentCaption')}</label>
                <input
                  type="text"
                  value={contentCaption}
                  onChange={(e) => setContentCaption(e.target.value)}
                  placeholder={t('topicDetail.captionPlaceholder')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {contentError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{contentError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={contentLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition"
                >
                  {contentLoading ? t('topicDetail.adding') : t('topicDetail.add')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddContent(false); setContentError(''); }}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                >
                  {t('topicDetail.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subtopic Modal */}
      {showAddSubtopic && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{t('topicDetail.addSubtopicModal')}</h3>
              <button onClick={() => setShowAddSubtopic(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSubtopic} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('topicDetail.subtopicName')}</label>
                <input
                  type="text"
                  value={subtopicTitle}
                  onChange={(e) => setSubtopicTitle(e.target.value)}
                  placeholder={t('topicDetail.subtopicNamePlaceholder')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('topicDetail.subtopicVisibility')}</label>
                <select
                  value={subtopicVis}
                  onChange={(e) => setSubtopicVis(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private">{t('topicDetail.subtopicPrivate')}</option>
                  <option value="public">{t('topicDetail.subtopicPublic')}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={subtopicLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition"
                >
                  {subtopicLoading ? t('topicDetail.creating') : t('topicDetail.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubtopic(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                >
                  {t('topicDetail.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function statusBadgeClass(status: string) {
  if (status === 'Accepted') return 'bg-green-100 text-green-700';
  if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function UserAnalyticsModal({
  topicId, userId, userName, userEmail, stats, topicProblems, onClose, t,
}: {
  topicId: string;
  userId: string;
  userName: string;
  userEmail: string;
  stats: Record<string, any>;
  topicProblems: any[];
  onClose: () => void;
  t: (k: string) => string;
}) {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSub, setOpenSub] = useState<number | null>(null);

  useEffect(() => {
    getTopicUserAnalytics(topicId, userId)
      .then((d) => setSubs(Array.isArray(d) ? d : []))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, [topicId, userId]);

  const subsByProblem: Record<number, any[]> = {};
  subs.forEach((s: any) => {
    (subsByProblem[s.problem_id] = subsByProblem[s.problem_id] || []).push(s);
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">{userName}</h3>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {loading ? (
            <p className="text-center text-gray-400 py-10">{t('topicDetail.loading')}</p>
          ) : (
            [...topicProblems]
              .sort((a: any, b: any) => a.order_num - b.order_num)
              .map((tp: any, i: number) => {
                const pid = tp.problem_id;
                const st = stats[pid];
                const list = subsByProblem[pid] || [];
                const title = tp.problem?.title || st?.title || `#${pid}`;
                return (
                  <div key={pid} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-400 font-mono shrink-0">#{i + 1}</span>
                        <Link href={`/problems/${pid}?topic_id=${topicId}`} className="font-medium text-sm text-gray-900 hover:text-blue-600 truncate">
                          {title}
                        </Link>
                      </div>
                      {st?.solved ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium shrink-0">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('topicDetail.solved')}
                        </span>
                      ) : st ? (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium shrink-0">{t('topicDetail.analyticsNotSolved')}</span>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{t('topicDetail.analyticsNotAttempted')}</span>
                      )}
                    </div>

                    {st && (
                      <div className="px-4 py-2 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1 border-b border-gray-100">
                        <span>{t('topicDetail.analyticsAttempts')}: <span className="font-medium text-gray-700">{st.attempts}</span></span>
                        {st.solved_at && (
                          <span>{t('topicDetail.analyticsSolvedAt')}: <span className="font-medium text-gray-700">{new Date(st.solved_at).toLocaleString()}</span></span>
                        )}
                        {st.last_attempt_at && (
                          <span>{t('topicDetail.analyticsLastAttempt')}: <span className="font-medium text-gray-700">{new Date(st.last_attempt_at).toLocaleString()}</span></span>
                        )}
                      </div>
                    )}

                    {list.length > 0 && (
                      <div className="divide-y divide-gray-100">
                        {list.map((s: any) => (
                          <div key={s.id}>
                            <div
                              className="px-4 py-2 flex items-center justify-between gap-3 hover:bg-gray-50 cursor-pointer transition"
                              onClick={() => setOpenSub(openSub === s.id ? null : s.id)}
                            >
                              <span className="text-xs text-gray-500">{new Date(s.created_at).toLocaleString()}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{s.language}</span>
                                <span className="text-xs text-gray-400 font-mono">{s.execution_time}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadgeClass(s.status)}`}>{s.status}</span>
                                <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform ${openSub === s.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            {openSub === s.id && (
                              <pre className="mx-4 mb-3 bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto text-xs font-mono whitespace-pre max-h-80 overflow-y-auto">
                                <code>{s.source_code}</code>
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}

export default function TopicDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">...</div>}>
      <TopicDetailContent />
    </Suspense>
  );
}
