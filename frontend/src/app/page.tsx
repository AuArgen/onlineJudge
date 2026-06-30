import { getProblems } from '@/lib/api';
import Link from 'next/link';

// Force dynamic rendering because we fetch data from API that might change
export const dynamic = 'force-dynamic';

export default async function Home() {
  let problems = [];
  try {
    const result = await getProblems();
    problems = Array.isArray(result) ? result : (result.data ?? []);
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-left md:w-1/2">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
              <span className="block">Совершенствуй свои</span>
              <span className="block text-blue-600">навыки кодинга</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500 mb-8 max-w-lg">
              Решай алгоритмические задачи, изучай новые языки программирования и готовься к техническим собеседованиям в IT-гиганты.
            </p>
            <div className="flex gap-4">
              <Link href="/problems" className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                Начать решать
              </Link>
              <Link href="/auth/login" className="flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition">
                Регистрация
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Simple Illustration/Icon */}
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse-slow">
               <div className="text-9xl">🚀</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-500 font-medium">Задач разной сложности</div>
            </div>
            <div className="p-6 border-l border-r border-gray-100">
              <div className="text-4xl font-bold text-green-600 mb-2">5</div>
              <div className="text-gray-500 font-medium">Поддерживаемых языков</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">Fast</div>
              <div className="text-gray-500 font-medium">Мгновенная проверка</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Почему выбирают нас?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 text-2xl">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Быстрая компиляция</h3>
            <p className="text-gray-500">Наш движок компиляции на базе Docker обеспечивает безопасное и быстрое выполнение вашего кода.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 text-2xl">🌍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Мультиязычность</h3>
            <p className="text-gray-500">Поддержка популярных языков: Python, C++, Java, Go, JavaScript. Выбирайте то, что вам удобно.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 text-2xl">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Подробная статистика</h3>
            <p className="text-gray-500">Отслеживайте свой прогресс, анализируйте ошибки и улучшайте свои алгоритмические навыки.</p>
          </div>
        </div>
      </div>

      {/* Problems List Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Последние задачи</h2>
          <Link href="/problems" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            Все задачи <span className="ml-1">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Нет доступных задач.</p>
            </div>
          ) : (
            problems.slice(0, 6).map((problem: any) => (
              <Link key={problem.id} href={`/problems/${problem.id}`} className="block group h-full">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-200 p-6 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                      {problem.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium border border-gray-200">
                      #{problem.id}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow">
                    {problem.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                      <span className="mr-1">⏱️</span>
                      {problem.time_limit}s
                    </div>
                    <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                      <span className="mr-1">💾</span>
                      {problem.memory_limit}MB
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
