'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';

// Modal for Submission Details
function SubmissionDetailsModal({ submission, onClose }: { submission: any, onClose: () => void }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If submission already has details (from immediate result), use it
    if (submission.details) {
      setDetails(submission);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    fetch(`http://localhost:8000/api/submission/${submission.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [submission]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Попытка #{submission.id}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(submission.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Code */}
          <div className="flex flex-col h-full min-h-[400px]">
            <h4 className="font-semibold text-gray-700 mb-2">Исходный код ({submission.language})</h4>
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

          {/* Right: Results */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-700 mb-2">Результат</h4>
            {loading ? (
              <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Загрузка деталей...
              </div>
            ) : details ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  details.status === 'Accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`text-2xl font-bold ${
                    details.status === 'Accepted' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {details.status}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 flex gap-4">
                    <span>Время: <span className="font-mono font-medium">{details.execution_time}</span></span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                    Тесты
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {details.details && details.details.map((d: any, i: number) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                        <span className="text-sm font-medium text-gray-700">Test #{i + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-mono">{d.execution_time}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            d.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!details.details || details.details.length === 0) && (
                      <div className="p-4 text-center text-gray-500 text-sm">Нет деталей тестов</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-500">Не удалось загрузить детали</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [cooldown, setCooldown] = useState(0);

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(`code_problem_${id}`);
    if (savedCode) {
      setCode(savedCode);
    }
    
    const savedLang = localStorage.getItem(`lang_problem_${id}`);
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, [id]);

  // Save code to localStorage on change
  useEffect(() => {
    if (code !== '// Write your code here') {
      localStorage.setItem(`code_problem_${id}`, code);
    }
    localStorage.setItem(`lang_problem_${id}`, language);
  }, [code, language, id]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/problems/${id}`)
      .then((res) => res.json())
      .then(setProblem)
      .catch(console.error);
    
    fetchHistory();
  }, [id]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const fetchHistory = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:8000/api/history?problem_id=${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setHistory)
      .catch(console.error);
  };

  const handleSubmit = async () => {
    if (cooldown > 0) return;

    setSubmitting(true);
    setResult(null);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problem_id: Number(id),
          language,
          source_code: code
        })
      });
      const data = await res.json();
      setResult(data);
      fetchHistory(); // Refresh history
      setCooldown(3); // Set 3 seconds cooldown
    } catch (error) {
      console.error(error);
      alert('Error submitting solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-80px)]">
      {selectedSubmission && (
        <SubmissionDetailsModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
        />
      )}

      {/* Left Column: Problem & History */}
      <div className="flex flex-col h-full overflow-hidden gap-6">
        {/* Problem Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto flex-grow">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">{problem.title}</h1>
          
          <div className="flex gap-3 mb-6 text-xs font-medium text-gray-600">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">Time: {problem.time_limit}s</span>
            <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100">Memory: {problem.memory_limit}MB</span>
          </div>

          <div className="prose prose-sm max-w-none mb-8 text-gray-800 whitespace-pre-wrap leading-relaxed">
            {problem.description}
          </div>

          {/* Sample Test Cases */}
          {problem.test_cases && problem.test_cases.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">Примеры</h3>
              <div className="space-y-3">
                {problem.test_cases.map((tc: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden text-sm">
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      <div className="p-3">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Ввод</div>
                        <pre className="font-mono text-gray-800 whitespace-pre-wrap">{tc.input}</pre>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Вывод</div>
                        <pre className="font-mono text-gray-800 whitespace-pre-wrap">{tc.expected_output}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-1/3 overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold mb-3 text-gray-900 uppercase tracking-wide">История попыток</h3>
          <div className="overflow-y-auto flex-grow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Язык</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Время</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Действие</th>
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
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                      {new Date(sub.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedSubmission(sub); }} className="text-blue-600 hover:text-blue-900">
                        Детали
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-gray-500 text-xs">Нет попыток</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Editor & Result */}
      <div className="flex flex-col h-full gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="javascript">Node.js</option>
            </select>
            <button 
              onClick={handleSubmit}
              disabled={submitting || cooldown > 0}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm min-w-[140px] justify-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Проверка...
                </>
              ) : cooldown > 0 ? (
                `Ждите ${cooldown}с`
              ) : (
                'Отправить решение'
              )}
            </button>
          </div>

          <div className="flex-grow border rounded-lg overflow-hidden shadow-inner">
            <Editor
              height="100%"
              defaultLanguage="python"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 10 }
              }}
            />
          </div>
        </div>

        {/* Result Area (Immediate Feedback) */}
        {result && (
          <div className={`rounded-xl shadow-sm border p-5 transition-all duration-300 ${
            result.status === 'Accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className={`text-xl font-bold ${result.status === 'Accepted' ? 'text-green-700' : 'text-red-700'}`}>
                  {result.status}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Время выполнения: <span className="font-mono font-medium">{result.execution_time}</span>
                </p>
              </div>
              <button onClick={() => setSelectedSubmission(result)} className="text-sm text-blue-600 hover:underline">
                Подробнее
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
