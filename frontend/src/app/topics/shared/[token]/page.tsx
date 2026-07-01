'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTopicByToken } from '@/lib/api';

function ContentBlock({ block }: { block: any }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {block.content}
          {block.caption && <p className="text-xs text-gray-400 mt-1">{block.caption}</p>}
        </div>
      );
    case 'image':
      return (
        <div>
          <img src={block.content} alt={block.caption || ''} className="rounded-xl max-w-full border border-gray-100" />
          {block.caption && <p className="text-sm text-gray-500 mt-2 text-center">{block.caption}</p>}
        </div>
      );
    case 'video':
      return (
        <div className="rounded-xl overflow-hidden bg-black">
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={block.content}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {block.caption && <p className="text-xs text-gray-400 text-center py-2 px-3">{block.caption}</p>}
        </div>
      );
    case 'link':
      return (
        <a
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm break-all"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {block.caption || block.content}
        </a>
      );
    default:
      return null;
  }
}

export default function SharedTopicPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTopicByToken(token)
      .then(setData)
      .catch(() => setError('Тема табылган жок же шилтеме мурда жараксыз.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Жүктөлүп жатат...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Тема табылган жок</h1>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Башкы бетке кайтуу
          </Link>
        </div>
      </div>
    );
  }

  const { topic, problems } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top banner */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Online Judge
          </Link>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Бөлүшүлгөн тема
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Topic header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📁</span>
            <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            {topic.author?.name} тарабынан
          </p>

          <div className="flex flex-wrap gap-4 mt-4 ml-11 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {problems?.length || 0} задача
            </span>
            {topic.children && topic.children.length > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {topic.children.length} подтема
              </span>
            )}
          </div>
        </div>

        {/* Content blocks */}
        {topic.contents && topic.contents.length > 0 && (
          <div className="space-y-4">
            {[...topic.contents]
              .sort((a: any, b: any) => a.order_num - b.order_num)
              .map((block: any) => (
                <div key={block.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <ContentBlock block={block} />
                </div>
              ))}
          </div>
        )}

        {/* Subtopics */}
        {topic.children && topic.children.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Подтемалар</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topic.children.map((child: any) => (
                <div key={child.id} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                  <span className="text-xl">📂</span>
                  <span className="font-medium text-gray-900 text-sm">{child.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problems */}
        {problems && problems.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Задачалар</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Задача</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...problems]
                    .sort((a: any, b: any) => a.order_num - b.order_num)
                    .map((tp: any, i: number) => (
                      <tr key={tp.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/problems/${tp.problem_id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition text-sm"
                          >
                            {tp.problem?.title || `Задача #${tp.problem_id}`}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {tp.user_solved ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Чыгарылды
                            </span>
                          ) : (
                            <Link
                              href={`/problems/${tp.problem_id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Чыгаруу
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {problems?.length === 0 && !topic.contents?.length && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400">Бул тема бош</p>
          </div>
        )}
      </div>
    </div>
  );
}
