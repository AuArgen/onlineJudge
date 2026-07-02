'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const TESTS_PAGE_SIZE = 10;

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

export default function ReviewProblem() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');

  const [testCases, setTestCases] = useState<any[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsPage, setTestsPage] = useState(1);
  const [testsTotalPages, setTestsTotalPages] = useState(1);
  const [testsTotal, setTestsTotal] = useState(0);

  const [validation, setValidation] = useState<{ issues: { level: string; message: string }[]; ok: boolean; test_case_count: number } | null>(null);
  const [validationLoading, setValidationLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch(`${API_URL}/problems/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setProblem)
      .catch(console.error)
      .finally(() => setLoading(false));

    setValidationLoading(true);
    fetch(`${API_URL}/admin/problems/${id}/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(setValidation)
      .catch(console.error)
      .finally(() => setValidationLoading(false));
  }, [id, router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setTestsLoading(true);
    fetch(`${API_URL}/problems/${id}/testcases?page=${testsPage}&limit=${TESTS_PAGE_SIZE}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setTestCases(data.data || []);
        setTestsTotalPages(data.total_pages || 1);
        setTestsTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setTestsLoading(false));
  }, [id, testsPage]);

  const handleApprove = async () => {
    if (!confirm(t('adminReview.confirmApprove'))) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/admin/problems/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || t('adminReview.validationBlocked'));
      return;
    }
    router.push('/admin');
  };

  const handleReject = async () => {
    if (!reason) {
      alert(t('adminReview.requireReason'));
      return;
    }
    if (!confirm(t('adminReview.confirmReject'))) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/admin/problems/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ reason })
    });
    router.push('/admin');
  };

  if (loading) return <div className="p-10 text-center">{t('adminReview.loading')}</div>;
  if (!problem) return <div className="p-10 text-center">{t('adminReview.notFound')}</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('adminReview.title')}</h1>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{problem.title}</h2>
        {problem.created_at && (
          <span className="text-xs text-gray-400">{t('adminReview.created')} {formatDate(problem.created_at)}</span>
        )}
      </div>

      {/* Validation */}
      <div className={`shadow rounded-lg p-6 mb-8 border ${validation && !validation.ok ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-bold mb-2">{t('adminReview.validation')}</h3>
        {validationLoading ? (
          <p className="text-sm text-gray-500">{t('adminReview.validationLoading')}</p>
        ) : validation ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{t('adminReview.testCaseCount').replace('{n}', String(validation.test_case_count))}</p>
            {(validation.issues || []).length === 0 ? (
              <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t('adminReview.validationOk')}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {validation.issues.map((iss, i) => (
                  <li key={i} className={`text-sm flex items-start gap-2 ${iss.level === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                    <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${iss.level === 'error' ? 'bg-red-100' : 'bg-amber-100'}`}>
                      {iss.level === 'error' ? 'Error' : 'Warning'}
                    </span>
                    <span>{iss.message}</span>
                  </li>
                ))}
              </ul>
            )}
            {!validation.ok && (
              <p className="text-xs text-red-600 mt-2 font-medium">{t('adminReview.validationBlocked')}</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold mb-2">{t('adminReview.description')}</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{problem.description}</p>
        <div className="flex gap-3 mt-4 text-xs font-medium text-gray-600">
          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">Time: {problem.time_limit}s</span>
          <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100">Memory: {problem.memory_limit}MB</span>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{t('adminReview.tests')}</h3>
          <span className="text-xs text-gray-500">{t('adminReview.testCaseCount').replace('{n}', String(testsTotal))}</span>
        </div>
        {testsLoading && testCases.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">{t('adminReview.validationLoading')}</p>
        ) : testCases.length > 0 ? (
          <div className="space-y-2">
            {testCases.map((tc: any, i: number) => (
              <div key={tc.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-600">Test #{(testsPage - 1) * TESTS_PAGE_SIZE + i + 1}</span>
                  <div className="flex items-center gap-2">
                    {tc.created_at && <span className="text-[11px] text-gray-400">{formatDate(tc.created_at)}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${tc.is_sample ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-gray-500 border-gray-200 bg-white'}`}>
                      {tc.is_sample ? t('adminReview.sample') : t('adminReview.hidden')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Input</div>
                    <pre className="text-xs font-mono bg-white border rounded p-2 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{tc.input}</pre>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Output</div>
                    <pre className="text-xs font-mono bg-white border rounded p-2 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{tc.expected_output}</pre>
                  </div>
                </div>
              </div>
            ))}
            {testsTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t text-sm">
                <button
                  onClick={() => setTestsPage(p => Math.max(1, p - 1))}
                  disabled={testsPage <= 1 || testsLoading}
                  className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('adminReview.prevPage')}
                </button>
                <span className="text-gray-500 text-xs">{testsPage} / {testsTotalPages}</span>
                <button
                  onClick={() => setTestsPage(p => Math.min(testsTotalPages, p + 1))}
                  disabled={testsPage >= testsTotalPages || testsLoading}
                  className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('adminReview.nextPage')}
                </button>
              </div>
            )}
          </div>
        ) : <p>{t('adminReview.noTests')}</p>}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">{t('adminReview.decision')}</h3>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-grow w-full">
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              placeholder={t('adminReview.rejectPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg">
              {t('adminReview.reject')}
            </button>
            <button
              onClick={handleApprove}
              disabled={!!validation && !validation.ok}
              title={validation && !validation.ok ? t('adminReview.validationBlocked') : undefined}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('adminReview.approve')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
