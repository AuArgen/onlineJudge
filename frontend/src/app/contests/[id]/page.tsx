'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft('Завершено');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono font-bold text-lg text-blue-600">{timeLeft}</span>;
}

export default function ContestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchContestData = () => {
    const userData = localStorage.getItem('user');
    
    fetch(`${API_URL}/contests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setContest(data);
        if (userData) {
          const u = JSON.parse(userData);
          const isJoined = data.participants?.some((p: any) => p.user_id === u.id);
          setJoined(isJoined);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch Leaderboard
    fetch(`${API_URL}/contests/${id}/leaderboard`)
      .then(res => res.json())
      .then(setLeaderboard)
      .catch(console.error);
  };

  useEffect(() => {
    fetchContestData();
    // Poll leaderboard every 30 seconds
    const interval = setInterval(fetchContestData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleJoin = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/contests/${id}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setJoined(true);
        alert('Вы успешно зарегистрировались!');
        fetchContestData();
      } else {
        alert('Ошибка при регистрации');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;
  if (!contest) return <div className="p-10 text-center">Соревнование не найдено</div>;

  const now = new Date();
  const startTime = new Date(contest.start_time);
  const endTime = new Date(contest.end_time);
  const isStarted = now >= startTime;
  const isFinished = now >= endTime;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="bg-white shadow rounded-xl border border-gray-200 p-8 mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{contest.title}</h1>
        <p className="text-gray-500 mb-6 max-w-2xl mx-auto">{contest.description}</p>
        
        <div className="flex justify-center gap-8 text-sm text-gray-600 mb-8">
          <div>
            <span className="block font-bold text-gray-900">Начало</span>
            {startTime.toLocaleString()}
          </div>
          <div>
            <span className="block font-bold text-gray-900">Конец</span>
            {endTime.toLocaleString()}
          </div>
        </div>

        {isStarted && !isFinished && (
          <div className="mb-6">
            <span className="text-gray-500 mr-2">Осталось времени:</span>
            <Countdown targetDate={endTime} />
          </div>
        )}

        {!isStarted && !isFinished && (
          joined ? (
            <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg inline-block font-medium">
              Вы зарегистрированы. Ожидайте начала.
            </div>
          ) : (
            <button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg shadow-blue-200">
              Зарегистрироваться
            </button>
          )
        )}

        {isStarted && (
          <div className={`px-6 py-3 rounded-lg inline-block font-medium ${isFinished ? 'bg-gray-100 text-gray-800' : 'bg-blue-50 text-blue-800'}`}>
            {isFinished ? 'Соревнование завершено' : 'Соревнование идет!'}
          </div>
        )}
      </div>

      {/* Problems List & Leaderboard */}
      {isStarted && (joined || isFinished) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Задачи</h2>
            <div className="space-y-4">
              {contest.problems?.map((cp: any, index: number) => (
                <Link key={cp.id} href={`/problems/${cp.problem_id}?contest_id=${contest.id}`} className="block group">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {cp.problem.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Лидерборд</h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">#</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Участник</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Решено</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">Нет данных</td></tr>
                  ) : (
                    leaderboard.map((rank: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{rank.user_name}</td>
                        <td className="px-4 py-2 text-right font-bold text-green-600">{rank.solved_count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
