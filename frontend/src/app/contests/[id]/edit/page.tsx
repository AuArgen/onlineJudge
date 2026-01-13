'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EditContest() {
  const { id } = useParams();
  const [contest, setContest] = useState<any>(null);
  const [problemId, setProblemId] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8000/api/contests/${id}`)
      .then((res) => res.json())
      .then(setContest)
      .catch(console.error);
  }, [id]);

  const handleAddProblem = async () => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/contests/${id}/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ problem_id: parseInt(problemId) })
    });
    // Refresh contest data
    fetch(`http://localhost:8000/api/contests/${id}`).then(res => res.json()).then(setContest);
    setProblemId('');
  };

  if (!contest) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Редактировать соревнование</h1>
      <h2 className="text-xl text-gray-700 mb-8">{contest.title}</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Задачи в соревновании</h3>
        <ul>
          {contest.problems?.map((p: any) => (
            <li key={p.id} className="border-b py-2">
              {p.problem.title}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-4">
          <input 
            type="number" 
            placeholder="ID задачи" 
            className="border rounded p-2"
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
          />
          <button onClick={handleAddProblem} className="bg-blue-600 text-white px-4 py-2 rounded">
            Добавить задачу
          </button>
        </div>
      </div>
    </div>
  );
}
