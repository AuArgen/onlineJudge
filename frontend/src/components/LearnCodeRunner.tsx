'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuth } from '@/components/AuthProvider';

const LANGUAGE_LABELS: Record<string, string> = {
  cpp: 'C++',
  python: 'Python',
  java: 'Java',
  go: 'Go',
  javascript: 'JavaScript',
};

// Fixed display order for the language tabs.
const LANGUAGE_ORDER = ['cpp', 'python', 'java', 'go', 'javascript'];

// localStorage key for the reader's preferred example language: pick Python
// once — every lesson opens its examples on the Python tab from then on.
const PREF_KEY = 'learn-code-lang';

export interface CodeVariant {
  language: string;
  content: string;
  sample_input?: string;
}

interface RunResult {
  stdout: string;
  stderr: string;
  execution_time: string;
  timed_out: boolean;
}

// LearnCodeRunner renders a lesson code block as an editable snippet that can
// be executed against the judge's /run endpoint. Labels come from the URL
// language (passed as a prop) so server and client render identically.
// When the block has a sample input, it is pre-filled and shown right away;
// when it has variants in other programming languages, tabs let the reader
// pick their language, and the choice is remembered across lessons.
export default function LearnCodeRunner({
  initialCode,
  language,
  caption,
  lang,
  sampleInput = '',
  variants = [],
}: {
  initialCode: string;
  language: string;
  caption?: string;
  lang: string;
  sampleInput?: string;
  variants?: CodeVariant[];
}) {
  const t = (key: string) => getTranslation(lang, key);
  const { user } = useAuth();
  const router = useRouter();

  // All language versions of this example, base language first in tab order.
  const versions = useMemo<CodeVariant[]>(() => {
    const all = [
      { language, content: initialCode, sample_input: sampleInput },
      ...variants.map((v) => ({ ...v, sample_input: v.sample_input || sampleInput })),
    ];
    return all.sort(
      (a, b) => LANGUAGE_ORDER.indexOf(a.language) - LANGUAGE_ORDER.indexOf(b.language)
    );
  }, [language, initialCode, sampleInput, variants]);

  const [active, setActive] = useState<CodeVariant>(
    () => versions.find((v) => v.language === language) || versions[0]
  );
  const [code, setCode] = useState(active.content);
  const [stdin, setStdin] = useState(active.sample_input || '');
  const [showStdin, setShowStdin] = useState((active.sample_input || '') !== '');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState('');

  const switchTo = (v: CodeVariant) => {
    setActive(v);
    setCode(v.content);
    setStdin(v.sample_input || '');
    setShowStdin((v.sample_input || '') !== '');
    setResult(null);
    setError('');
  };

  // After hydration, jump to the reader's remembered language if this
  // example has it.
  useEffect(() => {
    const pref = localStorage.getItem(PREF_KEY);
    if (pref && pref !== language) {
      const v = versions.find((x) => x.language === pref);
      if (v) switchTo(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => Math.min(Math.max(active.content.split('\n').length, 3), 22), [active]);

  const handleRun = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setRunning(true);
    setResult(null);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language: active.language, source_code: code, stdin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('learn.runError'));
        return;
      }
      setResult(data);
    } catch {
      setError(t('learn.runError'));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          {versions.length > 1 ? (
            <div className="flex items-center gap-1 shrink-0">
              {versions.map((v) => (
                <button
                  key={v.language}
                  onClick={() => {
                    localStorage.setItem(PREF_KEY, v.language);
                    switchTo(v);
                  }}
                  className={`text-xs font-semibold px-2 py-0.5 rounded transition ${
                    active.language === v.language
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {LANGUAGE_LABELS[v.language] || v.language}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-700 text-gray-200 shrink-0">
              {LANGUAGE_LABELS[active.language] || active.language}
            </span>
          )}
          <span className="text-xs text-gray-400 truncate hidden sm:inline">{t('learn.tryIt')}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(code !== active.content || stdin !== (active.sample_input || '')) && (
            <button
              onClick={() => { setCode(active.content); setStdin(active.sample_input || ''); setResult(null); setError(''); }}
              className="text-xs text-gray-400 hover:text-gray-200 transition"
            >
              {t('learn.reset')}
            </button>
          )}
          <button
            onClick={() => setShowStdin((v) => !v)}
            className={`text-xs px-2 py-1 rounded transition ${showStdin ? 'bg-gray-600 text-gray-100' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {t('learn.stdin')}
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 rounded transition"
            title={user ? t('learn.run') : t('learn.loginToRun')}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {running ? t('learn.running') : user ? t('learn.run') : t('learn.loginToRun')}
          </button>
        </div>
      </div>

      {/* Editable code */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="block w-full bg-gray-900 text-gray-100 p-4 text-sm font-mono leading-relaxed resize-y focus:outline-none whitespace-pre overflow-x-auto"
      />

      {/* Stdin: pre-filled with the block's sample input when it has one */}
      {showStdin && (
        <div className="border-t border-gray-700 bg-gray-900 px-4 py-3">
          <label className="block text-xs text-gray-400 mb-1.5">
            {(active.sample_input || '') !== '' ? t('learn.stdinSample') : t('learn.stdin')}
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={Math.min(Math.max(stdin.split('\n').length, 2), 8)}
            spellCheck={false}
            className="block w-full bg-gray-800 text-gray-100 rounded-lg p-3 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Output */}
      {(result || error) && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{t('learn.output')}</span>
                {result.execution_time && <span>{result.execution_time}</span>}
                {result.timed_out && <span className="text-red-600 font-medium">{t('learn.timedOut')}</span>}
              </div>
              <pre className="bg-white border border-gray-200 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap break-words text-gray-800 max-h-64 overflow-y-auto">
                {result.stdout || t('learn.emptyOutput')}
              </pre>
              {result.stderr && (
                <>
                  <p className="text-xs font-medium text-red-600">{t('learn.errors')}</p>
                  <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap break-words text-red-700 max-h-48 overflow-y-auto">
                    {result.stderr}
                  </pre>
                </>
              )}
            </>
          )}
        </div>
      )}

      {caption && <p className="text-xs text-gray-400 text-center py-2 bg-white border-t border-gray-100">{caption}</p>}
    </div>
  );
}
