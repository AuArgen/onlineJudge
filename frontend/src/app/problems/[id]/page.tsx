'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/components/ToastProvider';
import { API_URL } from '@/lib/api';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';

export const dynamic = 'force-dynamic';

const CODE_TEMPLATES: Record<string, string> = {
  python: `import sys
input = sys.stdin.readline

def main():
    # Your solution here
    pass

main()`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Your solution here

    return 0;
}`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Your solution here

    }
}`,
  go: `package main

import (
\t"bufio"
\t"fmt"
\t"os"
)

var reader *bufio.Reader
var writer *bufio.Writer

func main() {
\treader = bufio.NewReader(os.Stdin)
\twriter = bufio.NewWriter(os.Stdout)
\tdefer writer.Flush()
\t
\t// Your solution here
\t_ = fmt.Fscan
}`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', (line) => lines.push(line.trim()));
rl.on('close', () => {
    // Your solution here

});`,
};

const DEFAULT_CODE = '// Write your code here';
const ALL_TEMPLATES = new Set([DEFAULT_CODE, ...Object.values(CODE_TEMPLATES)]);

function OutputBlock({ label, text, truncated, tone, t }: { label: string; text: string; truncated?: boolean; tone: 'neutral' | 'error'; t: (k: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 400;
  const boxColor = tone === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-800';
  const labelColor = tone === 'error' ? 'text-red-500' : 'text-gray-500';

  return (
    <div>
      <div className={`text-xs font-bold uppercase mb-1 ${labelColor}`}>{label}</div>
      <pre className={`border rounded p-3 text-sm font-mono whitespace-pre-wrap overflow-y-auto ${boxColor} ${expanded ? 'max-h-96' : 'max-h-40'}`}>
        {text}
      </pre>
      {(isLong || truncated) && (
        <div className="flex items-center gap-3 mt-1">
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:underline font-medium">
              {expanded ? t('problem.showLess') : t('problem.showMore')}
            </button>
          )}
          {truncated && (
            <span className="text-xs text-amber-600">{t('problem.truncatedNotice')}</span>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionDetailsModal({ submission, onClose, t }: { submission: any; onClose: () => void; t: (k: string) => string }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);

  useEffect(() => {
    if (submission.details) {
      setDetails(submission);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    fetch(`${API_URL}/submission/${submission.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setDetails(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [submission]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('problem.attempt')} #{submission.id}</h3>
            <p className="text-sm text-gray-500 mt-1">{new Date(submission.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col h-full min-h-[400px]">
            <h4 className="font-semibold text-gray-700 mb-2">{t('problem.sourceCode')} ({submission.language})</h4>
            <div className="flex-grow border rounded-lg overflow-hidden bg-gray-50">
              <Editor
                height="100%"
                defaultLanguage={submission.language === 'cpp' ? 'cpp' : submission.language}
                value={submission.source_code}
                theme="vs-light"
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-700 mb-2">{t('problem.result')}</h4>
            {loading ? (
              <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('problem.loadingDetails')}
              </div>
            ) : details ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${details.status === 'Accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-2xl font-bold ${details.status === 'Accepted' ? 'text-green-700' : 'text-red-700'}`}>
                    {details.status}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 flex gap-4">
                    <span>{t('problem.timeLabel')} <span className="font-mono font-medium">{details.execution_time}</span></span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                    {t('problem.tests')}
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                    {details.details && details.details.map((d: any, i: number) => {
                      const canExpand = d.is_sample && (d.expected_output || d.actual_output || d.stderr);
                      const isOpen = expandedTest === i;
                      return (
                        <div key={i}>
                          <div
                            className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition ${canExpand ? 'cursor-pointer' : ''}`}
                            onClick={() => canExpand && setExpandedTest(isOpen ? null : i)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Test #{i + 1}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${d.is_sample ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-gray-400 border-gray-200 bg-gray-50'}`}>
                                {d.is_sample ? t('problem.sampleTest') : t('problem.hiddenTest')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 font-mono">{d.execution_time}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${d.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {d.status}
                              </span>
                              {canExpand && (
                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          {canExpand && isOpen && (
                            <div className="px-4 pb-4 space-y-3 bg-gray-50/50">
                              {d.input && <OutputBlock label={t('problem.input')} text={d.input} tone="neutral" t={t} />}
                              {d.expected_output && <OutputBlock label={t('problem.expectedOutput')} text={d.expected_output} truncated={d.truncated} tone="neutral" t={t} />}
                              {d.actual_output && <OutputBlock label={t('problem.actualOutput')} text={d.actual_output} truncated={d.truncated} tone={d.status === 'Accepted' ? 'neutral' : 'error'} t={t} />}
                              {d.stderr && <OutputBlock label={t('problem.errorLabel')} text={d.stderr} truncated={d.truncated} tone="error" t={t} />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(!details.details || details.details.length === 0) && (
                      <div className="p-4 text-center text-gray-500 text-sm">{t('problem.noTestDetails')}</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-500">{t('problem.failedLoadDetails')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemDetailContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const contestId = searchParams.get('contest_id');
  const shareToken = searchParams.get('token');
  const topicToken = searchParams.get('topic_token');
  const { showToast } = useToast();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [cooldown, setCooldown] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [customInput, setCustomInput] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<'run' | 'submit'>('submit');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem(`lang_problem_${id}`) || 'python';
    const savedCode = localStorage.getItem(`code_problem_${id}`);
    setLanguage(savedLang);
    setCode(savedCode || CODE_TEMPLATES[savedLang] || CODE_TEMPLATES.python);
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`code_problem_${id}`, code);
    localStorage.setItem(`lang_problem_${id}`, language);
  }, [code, language, id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    const tokenParam = shareToken ? `&token=${shareToken}` : '';
    const topicTokenParam = topicToken ? `&topic_token=${topicToken}` : '';
    fetch(`${API_URL}/problems/${id}?lang=${lang}${tokenParam}${topicTokenParam}`, { headers })
      .then((res) => res.json())
      .then(setProblem)
      .catch(console.error);
    fetchHistory();
  }, [id, lang, shareToken, topicToken]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const fetchHistory = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/history?problem_id=${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setHistory)
      .catch(console.error);
  };

  const handleSubmit = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (cooldown > 0) return;
    setSubmitting(true);
    setResult(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ problem_id: Number(id), contest_id: contestId ? Number(contestId) : undefined, language, source_code: code })
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) {
        if (data.status === 'Accepted') {
          showToast(t('problem.accepted'), 'success');
        } else {
          showToast(`${data.status}`, 'error');
        }
        fetchHistory();
        setCooldown(3);
      } else {
        showToast(data.error || t('problem.submitError'), 'error');
      }
    } catch (error) {
      console.error(error);
      showToast(t('problem.networkError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRun = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setRunning(true);
    setRunResult(null);
    setActiveOutputTab('run');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ language, source_code: code, stdin: customInput })
      });
      const data = await res.json();
      setRunResult(data);
    } catch (err) {
      console.error(err);
      showToast(t('problem.runError'), 'error');
    } finally {
      setRunning(false);
    }
  };

  if (!problem) return <div className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>;

  const isAuthor = user && (user.id === problem.author_id || user.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {selectedSubmission && (
        <SubmissionDetailsModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} t={t} />
      )}

      {/* Left Column */}
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
          <div className="flex justify-between items-center mb-6">
            {contestId ? (
              <Link href={`/contests/${contestId}`} className="text-sm text-blue-600 hover:underline flex items-center">
                {t('problem.backToContest')}
              </Link>
            ) : (
              <Link href="/problems" className="text-sm text-blue-600 hover:underline flex items-center">
                {t('problem.allProblems')}
              </Link>
            )}
            {isAuthor && (
              <Link href={`/problems/${id}/edit`} className="text-gray-400 hover:text-blue-600 transition p-1 rounded hover:bg-blue-50" title={t('problem.editProblem')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-3 text-gray-900">{problem.title}</h1>

          {problem.translations && problem.translations.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap">
              <button
                onClick={() => setLang('ru')}
                className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${lang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
              >
                🇷🇺 Русский
              </button>
              {problem.translations.map((tr: any) => {
                const l = LANGUAGES.find(l => l.code === tr.language_code);
                return (
                  <button
                    key={tr.language_code}
                    onClick={() => setLang(tr.language_code)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${lang === tr.language_code ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
                  >
                    {l?.flag} {l?.label || tr.language_code}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 mb-6 text-xs font-medium text-gray-600">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">Time: {problem.time_limit}s</span>
            <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100">Memory: {problem.memory_limit}MB</span>
          </div>

          <div className="prose prose-sm max-w-none mb-8 text-gray-800 leading-relaxed
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2
            [&_p]:mb-3
            [&_strong]:font-bold
            [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-gray-800
            [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-3
            [&_pre_code]:bg-transparent [&_pre_code]:p-0
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
            [&_li]:mb-1
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
          </div>

          {problem.test_cases && problem.test_cases.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">{t('problem.examples')}</h3>
              <div className="space-y-3">
                {problem.test_cases.map((tc: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden text-sm">
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{t('problem.input')}</span>
                          <button
                            onClick={() => handleCopy(tc.input, `${i}-in`)}
                            className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-0.5 transition"
                            title="Көчүрүү"
                          >
                            {copiedKey === `${i}-in` ? (
                              <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                            {copiedKey === `${i}-in` ? 'Көчүрүлдү' : 'Көчүрүү'}
                          </button>
                        </div>
                        <pre className="font-mono text-gray-800 whitespace-pre-wrap">{tc.input}</pre>
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{t('problem.output')}</span>
                          <button
                            onClick={() => handleCopy(tc.expected_output, `${i}-out`)}
                            className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-0.5 transition"
                            title="Көчүрүү"
                          >
                            {copiedKey === `${i}-out` ? (
                              <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                            {copiedKey === `${i}-out` ? 'Көчүрүлдү' : 'Көчүрүү'}
                          </button>
                        </div>
                        <pre className="font-mono text-gray-800 whitespace-pre-wrap">{tc.expected_output}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">{t('problem.attemptHistory')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('problem.status')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('problem.language')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('problem.time')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('problem.date')}</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('problem.action')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedSubmission(sub)}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        sub.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        sub.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{sub.language}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{sub.execution_time}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">{new Date(sub.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedSubmission(sub); }} className="text-blue-600 hover:text-blue-900">
                        {t('problem.details')}
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-gray-500 text-xs">{t('problem.noAttempts')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-4">
        <div className="sticky top-24 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  if (ALL_TEMPLATES.has(code)) setCode(CODE_TEMPLATES[newLang] || '');
                }}
                className="border rounded px-3 py-1.5 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="javascript">Node.js</option>
              </select>

              <div className="flex gap-2">
                {user ? (
                  <>
                    <button
                      onClick={handleRun}
                      disabled={running || submitting}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    >
                      {running ? (
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      {running ? t('problem.running') : t('problem.run')}
                    </button>
                    <button
                      onClick={() => { handleSubmit(); setActiveOutputTab('submit'); }}
                      disabled={submitting || cooldown > 0}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm min-w-[120px] justify-center"
                    >
                      {submitting ? (
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : null}
                      {submitting ? t('problem.submitting') : cooldown > 0 ? t('problem.wait').replace('{n}', String(cooldown)) : t('problem.submit')}
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-1.5 rounded-md text-sm font-medium transition shadow-sm">
                    {t('problem.login')}
                  </Link>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-inner h-[420px]">
              <Editor
                height="100%"
                defaultLanguage="python"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-light"
                options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 10 } }}
              />
            </div>

            <div className="mt-3 border-t pt-3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t('problem.stdin')}
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm font-mono h-20 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                placeholder={t('problem.stdinPlaceholder')}
              />
            </div>
          </div>

          {(result || runResult) && (
            <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b bg-gray-50">
                {runResult && (
                  <button
                    onClick={() => setActiveOutputTab('run')}
                    className={`px-4 py-2 text-sm font-medium transition ${activeOutputTab === 'run' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('problem.runOutput')}
                  </button>
                )}
                {result && (
                  <button
                    onClick={() => setActiveOutputTab('submit')}
                    className={`px-4 py-2 text-sm font-medium transition ${activeOutputTab === 'submit' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('problem.submitOutput')}
                  </button>
                )}
              </div>

              {activeOutputTab === 'run' && runResult && (
                <div className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${runResult.timed_out ? 'bg-yellow-100 text-yellow-700' : runResult.stderr ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {runResult.timed_out ? 'Time Limit Exceeded' : runResult.stderr ? 'Runtime Error' : 'OK'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{runResult.execution_time}</span>
                  </div>
                  {runResult.stdout && (
                    <div className="mb-2">
                      <OutputBlock label={t('problem.outputLabel')} text={runResult.stdout} truncated={runResult.stdout_truncated} tone="neutral" t={t} />
                    </div>
                  )}
                  {runResult.stderr && (
                    <OutputBlock label={t('problem.errorLabel')} text={runResult.stderr} truncated={runResult.stderr_truncated} tone="error" t={t} />
                  )}
                  {!runResult.stdout && !runResult.stderr && (
                    <p className="text-sm text-gray-500">{t('problem.noOutput')}</p>
                  )}
                </div>
              )}

              {activeOutputTab === 'submit' && result && (
                <div className={`p-4 ${result.status === 'Accepted' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`text-xl font-bold ${result.status === 'Accepted' ? 'text-green-700' : 'text-red-700'}`}>{result.status}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{t('problem.timeLabel')} <span className="font-mono font-medium">{result.execution_time}</span></p>
                    </div>
                    <button onClick={() => setSelectedSubmission(result)} className="text-sm text-blue-600 hover:underline">{t('problem.more')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProblemDetail(props: any) {
  return (
    <Suspense fallback={<div className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
      <ProblemDetailContent />
    </Suspense>
  );
}
