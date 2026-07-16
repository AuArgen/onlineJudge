import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLearnTopic, type LearnNode } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { linkifyText } from '@/lib/linkify';
import { isLearnLang, learnAlternates, SITE_URL, type LearnLang } from '@/lib/learn';
import LearnLangSync from '@/components/LearnLangSync';
import LearnCodeRunner from '@/components/LearnCodeRunner';
import LearnChildList from '@/components/LearnChildList';
import LearnProblemList, { type LearnProblemRow } from '@/components/LearnProblemList';
import LessonCompleteButton from '@/components/LessonCompleteButton';

interface LearnCrumb {
  slug: string;
  title: string;
}

interface LearnTopicResponse {
  topic: {
    id: number;
    title: string;
    slug: string;
    summary: string;
    updated_at: string;
    contents: {
      id: number;
      type: string;
      content: string;
      caption: string;
      language?: string;
      sample_input?: string;
      order_num: number;
    }[] | null;
  };
  children: LearnNode[];
  problems: LearnProblemRow[];
  breadcrumbs: LearnCrumb[];
  prev: LearnCrumb | null;
  next: LearnCrumb | null;
}

function stripForDescription(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length <= 160 ? flat : flat.slice(0, 157).trimEnd() + '...';
}

export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  if (!isLearnLang(params.lang)) return { robots: { index: false, follow: false } };
  const lang = params.lang as LearnLang;

  const data: LearnTopicResponse | null = await getLearnTopic(params.slug, lang);
  if (!data) return { title: 'Learn', robots: { index: false, follow: false } };

  const { topic, children, problems } = data;
  const contents = topic.contents || [];
  const firstText = contents.find((c) => c.type === 'text')?.content || '';
  const description = stripForDescription(topic.summary || firstText || getTranslation(lang, 'learn.metaDescription'));
  const url = `${SITE_URL}/learn/${lang}/${params.slug}`;
  // Empty lesson stubs stay out of the index until they get real content.
  const isEmpty = contents.length === 0 && children.length === 0 && problems.length === 0;

  return {
    title: topic.title,
    description,
    alternates: learnAlternates(lang, `/${params.slug}`),
    robots: isEmpty ? { index: false, follow: true } : undefined,
    openGraph: {
      title: topic.title,
      description,
      url,
      siteName: 'Online Judge',
      type: 'article',
    },
    twitter: { card: 'summary', title: topic.title, description },
  };
}

function ContentBlock({
  block,
  lang,
}: {
  block: { id: number; type: string; content: string; caption: string; language?: string; sample_input?: string };
  lang: string;
}) {
  switch (block.type) {
    case 'text':
      return (
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {linkifyText(block.content, `learn-${block.id}`)}
          {block.caption && <p className="text-xs text-gray-400 mt-1">{block.caption}</p>}
        </div>
      );
    case 'code':
      // Code blocks with an explicit language become runnable right in the
      // lesson; language-less blocks stay a plain static snippet.
      if (block.language) {
        return (
          <LearnCodeRunner
            initialCode={block.content}
            language={block.language}
            caption={block.caption}
            lang={lang}
            sampleInput={block.sample_input || ''}
          />
        );
      }
      return (
        <div>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">
            <code>{block.content}</code>
          </pre>
          {block.caption && <p className="text-xs text-gray-400 mt-2 text-center">{block.caption}</p>}
        </div>
      );
    case 'image':
      return (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
              title={block.caption || 'video'}
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

export default async function LearnTopicPage({ params }: { params: { lang: string; slug: string } }) {
  if (!isLearnLang(params.lang)) notFound();
  const lang = params.lang as LearnLang;
  const t = (key: string) => getTranslation(lang, key);

  const data: LearnTopicResponse | null = await getLearnTopic(params.slug, lang);
  if (!data) notFound();

  const { topic, children, problems, breadcrumbs, prev, next } = data;
  const contents = topic.contents || [];
  const isEmpty = contents.length === 0 && children.length === 0 && problems.length === 0;

  const crumbs = [
    { slug: '', title: t('learn.title') },
    ...breadcrumbs,
    { slug: params.slug, title: topic.title },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.title,
          item: c.slug ? `${SITE_URL}/learn/${lang}/${c.slug}` : `${SITE_URL}/learn/${lang}`,
        })),
      },
      children.length > 0
        ? {
            '@type': 'Course',
            name: topic.title,
            description: topic.summary,
            url: `${SITE_URL}/learn/${lang}/${params.slug}`,
            provider: { '@type': 'Organization', name: 'Online Judge', url: SITE_URL },
          }
        : {
            '@type': 'LearningResource',
            name: topic.title,
            description: topic.summary,
            url: `${SITE_URL}/learn/${lang}/${params.slug}`,
            inLanguage: lang,
            dateModified: topic.updated_at,
          },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <LearnLangSync lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 mb-6">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast ? (
                <span className="text-gray-900 font-medium truncate">{c.title}</span>
              ) : (
                <Link
                  href={c.slug ? `/learn/${lang}/${c.slug}` : `/learn/${lang}`}
                  className="hover:text-blue-600 transition truncate"
                >
                  {c.title}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">{topic.title}</h1>
      {topic.summary && <p className="text-gray-600 leading-relaxed mb-8">{topic.summary}</p>}

      {/* Content blocks */}
      {contents.length > 0 && (
        <div className="space-y-6 mb-10">
          {contents.map((block) => (
            <ContentBlock key={block.id} block={block} lang={lang} />
          ))}
        </div>
      )}

      {/* Empty lesson stub */}
      {isEmpty && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 mb-10">
          <div className="text-5xl mb-4">🚧</div>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">{t('learn.emptyLesson')}</p>
        </div>
      )}

      {/* Child topics (levels of a track, lessons of a level) */}
      {children.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('learn.inThisSection')}</h2>
          <LearnChildList items={children} lang={lang} />
        </section>
      )}

      {/* Practice problems */}
      {problems.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('learn.practiceProblems')}</h2>
          <LearnProblemList problems={problems} lang={lang} />
        </section>
      )}

      {/* Lesson completion toggle (leaf lessons with real content only) */}
      {children.length === 0 && !isEmpty && <LessonCompleteButton topicId={topic.id} lang={lang} />}

      {/* Prev / next lesson navigation */}
      {(prev || next) && (
        <nav className="flex items-stretch gap-3 pt-6 border-t border-gray-200">
          {prev ? (
            <Link
              href={`/learn/${lang}/${prev.slug}`}
              className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition group"
            >
              <p className="text-xs text-gray-400 mb-1">← {t('learn.prevLesson')}</p>
              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition text-sm">{prev.title}</p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/learn/${lang}/${next.slug}`}
              className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition group text-right"
            >
              <p className="text-xs text-gray-400 mb-1">{t('learn.nextLesson')} →</p>
              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition text-sm">{next.title}</p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      )}
    </div>
  );
}
