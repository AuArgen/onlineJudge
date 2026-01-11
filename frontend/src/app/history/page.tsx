'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function HistoryContent() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get('id');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let url = 'http://localhost:8000/api/history';
    if (problemId) {
      url += `?problem_id=${problemId}`;
    }

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSubmissions)
      .catch(console.error);
  }, [problemId]);

  const viewDetails = (id: number) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8000/api/submission/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSelectedSubmission)
      .catch(console.error);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">История попыток</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Язык</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действие</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((sub: any) => (
              <tr key={sub.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sub.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.language}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.execution_time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => viewDetails(sub.id)} className="text-blue-600 hover:text-blue-900">
                    Посмотреть
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Details */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Детали решения #{selectedSubmission.id}</h3>
              <button onClick={() => setSelectedSubmission(null)} className="text-gray-500 hover:text-gray-700">X</button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold mb-2">Код:</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">{selectedSubmission.source_code}</pre>
            </div>

            {selectedSubmission.details && (
              <div>
                <h4 className="font-bold mb-2">Тесты:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedSubmission.details.map((d: any, i: number) => (
                    <div key={i} className="border p-2 rounded flex justify-between text-sm">
                      <span>Test #{i+1}</span>
                      <span className={d.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}>{d.status}</span>
                      <span>{d.execution_time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function History() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
