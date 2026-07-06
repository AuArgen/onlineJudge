'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL, deleteTopic, getTopics } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ToastProvider';

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [problems, setProblems] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'topics' | 'contests'>('problems');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/auth/login'); return; }
    const currentUser = JSON.parse(userData);
    setUser(currentUser);

    const loadData = async () => {
      setLoading(true);
      try {
        const [problemData, topicData, contestData] = await Promise.all([
          fetch(`${API_URL}/problems?filter=my`, { headers: { 'Authorization': `Bearer ${token}` } }).then((res) => res.json()),
          getTopics('my'),
          fetch(`${API_URL}/contests`, { headers: { 'Authorization': `Bearer ${token}` } }).then((res) => res.json()),
        ]);

        setProblems(Array.isArray(problemData) ? problemData : (problemData.data ?? []));
        setTopics(Array.isArray(topicData) ? topicData : []);
        const list: any[] = Array.isArray(contestData) ? contestData : (contestData.data ?? []);
        setContests(list.filter((c: any) => c.author_id === currentUser.id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleDeleteProblem = async (problemId: number) => {
    if (!confirm(t('dashboard.confirmDelete'))) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/problems/${problemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProblems(problems.filter((p: any) => p.id !== problemId));
        alert(t('dashboard.deleted'));
      } else {
        alert(t('dashboard.deleteError'));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm(t('dashboard.confirmDeleteTopic'))) return;
    try {
      await deleteTopic(topicId);
      setTopics((items) => items.filter((topic: any) => topic.id !== topicId));
      showToast(t('dashboard.topicDeleted'), 'success');
    } catch (error) {
      console.error(error);
      showToast(t('dashboard.deleteError'), 'error');
    }
  };

  const visibilityLabel = (visibility: string) => (
    visibility === 'public' ? t('dashboard.public') : t('dashboard.private')
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/problems/create" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition text-sm">
            {t('dashboard.createProblem')}
          </Link>
          <Link href="/topics/create" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition text-sm">
            {t('dashboard.createTopic')}
          </Link>
          <Link href="/contests/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
            {t('dashboard.createContest')}
          </Link>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'problems' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('problems')}
        >
          {t('dashboard.myProblems')}
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'topics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('topics')}
        >
          {t('dashboard.myTopics')}
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'contests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('contests')}
        >
          {t('dashboard.myContests')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
      ) : (
        <>
          {activeTab === 'problems' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.solved')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.date')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {problems.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-500">{t('dashboard.noProblems')}</td></tr>
                    ) : (
                      problems.map((problem: any) => (
                        <tr key={problem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/problems/${problem.id}`} className="text-sm font-medium text-blue-600 hover:underline">{problem.title}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${problem.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {problem.visibility}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{problem.solved_count || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(problem.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button onClick={() => router.push(`/problems/${problem.id}/edit`)} className="text-indigo-600 hover:text-indigo-900">
                              {t('dashboard.edit')}
                            </button>
                            <button onClick={() => handleDeleteProblem(problem.id)} className="text-red-600 hover:text-red-900">
                              {t('dashboard.delete')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.contents')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topics.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-10 text-gray-500">{t('dashboard.noTopics')}</td></tr>
                    ) : (
                      topics.map((topic: any) => (
                        <tr key={topic.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/topics/${topic.id}`} className="text-sm font-medium text-blue-600 hover:underline">{topic.title}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${topic.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {visibilityLabel(topic.visibility)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(topic.problem_count || 0)} {t('dashboard.problemsCount')}
                            {topic.subtopic_count > 0 ? ` · ${topic.subtopic_count} ${t('dashboard.subtopicsCount')}` : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button onClick={() => router.push(`/topics/${topic.id}`)} className="text-blue-600 hover:text-blue-900">
                              {t('dashboard.view')}
                            </button>
                            <button onClick={() => router.push(`/topics/${topic.id}/edit`)} className="text-indigo-600 hover:text-indigo-900">
                              {t('dashboard.edit')}
                            </button>
                            <button onClick={() => handleDeleteTopic(topic.id)} className="text-red-600 hover:text-red-900">
                              {t('dashboard.delete')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contests' && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.start')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.end')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contests.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-500">{t('dashboard.noContests')}</td></tr>
                    ) : (
                      contests.map((contest: any) => (
                        <tr key={contest.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/contests/${contest.id}`} className="text-sm font-medium text-blue-600 hover:underline">{contest.title}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {contest.status || 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(contest.start_time).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(contest.end_time).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button onClick={() => router.push(`/contests/${contest.id}/edit`)} className="text-indigo-600 hover:text-indigo-900">
                              {t('dashboard.manage')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
