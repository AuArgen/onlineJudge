import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLearnTracks, type LearnNode } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { isLearnLang, learnAlternates, SITE_URL, type LearnLang } from '@/lib/learn';
import LearnLangSync from '@/components/LearnLangSync';

const ROADMAP_SLUG = 'olympiad-roadmap';

// Course card accents keyed by track slug; unknown tracks fall back to gray.
const COURSE_BADGES: Record<string, { label: string; classes: string }> = {
  'course-cpp': { label: 'C++', classes: 'bg-blue-100 text-blue-700' },
  'course-python': { label: 'Py', classes: 'bg-yellow-100 text-yellow-700' },
  'course-java': { label: 'Java', classes: 'bg-orange-100 text-orange-700' },
  'course-go': { label: 'Go', classes: 'bg-cyan-100 text-cyan-700' },
};

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  if (!isLearnLang(params.lang)) return { robots: { index: false, follow: false } };
  const lang = params.lang as LearnLang;
  const title = getTranslation(lang, 'learn.metaTitle');
  const description = getTranslation(lang, 'learn.metaDescription');
  return {
    title,
    description,
    alternates: learnAlternates(lang, ''),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/learn/${lang}`,
      siteName: 'Online Judge',
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function LearnLandingPage({ params }: { params: { lang: string } }) {
  if (!isLearnLang(params.lang)) notFound();
  const lang = params.lang as LearnLang;
  const t = (key: string) => getTranslation(lang, key);

  let tracks: LearnNode[] = [];
  try {
    tracks = await getLearnTracks(lang);
  } catch {
    // Backend unreachable — render the static guide anyway.
  }

  const roadmap = tracks.find((tr) => tr.slug === ROADMAP_SLUG);
  const courses = tracks.filter((tr) => tr.slug !== ROADMAP_SLUG);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('learn.metaTitle'),
    itemListElement: tracks.map((tr, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: tr.title,
        description: tr.summary,
        url: `${SITE_URL}/learn/${lang}/${tr.slug}`,
        provider: { '@type': 'Organization', name: 'Online Judge', url: SITE_URL },
      },
    })),
  };

  const howSteps = [1, 2, 3, 4].map((n) => ({
    title: t(`learn.how${n}Title`),
    desc: t(`learn.how${n}Desc`),
  }));

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <LearnLangSync lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('learn.metaTitle')}</h1>
        <p className="text-lg text-gray-600 leading-relaxed">{t('learn.intro')}</p>
      </div>

      {/* How to use the site */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('learn.howTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {howSteps.map((step, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Olympiad roadmap */}
      {roadmap && (
        <section className="mb-16">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              <Link href={`/learn/${lang}/${roadmap.slug}`} className="hover:text-blue-600 transition">
                {roadmap.title}
              </Link>
            </h2>
            <span className="text-sm text-gray-400 shrink-0">
              {roadmap.children.length} {t('learn.levelsCount')}
            </span>
          </div>
          <p className="text-gray-500 mb-6 max-w-3xl">{roadmap.summary}</p>

          <ol className="space-y-3">
            {roadmap.children.map((level, i) => (
              <li key={level.id}>
                <Link
                  href={`/learn/${lang}/${level.slug}`}
                  className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition group"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {level.title}
                    </h3>
                    {level.summary && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{level.summary}</p>}
                    <p className="text-xs text-gray-400 mt-2">
                      {level.children.length} {t('learn.lessonsCount')}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Language courses */}
      {courses.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('learn.coursesTitle')}</h2>
          <p className="text-gray-500 mb-6">{t('learn.coursesSubtitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => {
              const badge = COURSE_BADGES[course.slug] || { label: '</>', classes: 'bg-gray-100 text-gray-700' };
              return (
                <Link
                  key={course.id}
                  href={`/learn/${lang}/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition group flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${badge.classes} mb-3`}>
                    {badge.label}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{course.title}</h3>
                  {course.summary && (
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed flex-1">{course.summary}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    {course.children.length} {t('learn.lessonsCount')}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
