import { getProblems } from '@/lib/api';
import Link from 'next/link';

// Force dynamic rendering because we fetch data from API that might change
export const dynamic = 'force-dynamic';

export default async function Home() {
  let problems = [];
  try {
    problems = await getProblems();
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Совершенствуй свои навыки</span>
            <span className="block text-blue-600">в программировании</span>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Решай алгоритмические задачи, изучай новые языки и соревнуйся с другими разработчиками.
          </p>
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
            <div className="rounded-md shadow">
              <Link href="/problems" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition">
                Начать решать
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/auth/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition">
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Problems List Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Последние задачи</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Нет доступных задач.</p>
            </div>
          ) : (
            problems.map((problem: any) => (
              <Link key={problem.id} href={`/problems/${problem.id}`} className="block group">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-200 p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {problem.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                      #{problem.id}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">
                    {problem.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {problem.time_limit}s
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
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
