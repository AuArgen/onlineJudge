import type { Metadata } from 'next';

// Shared helpers for the public /learn section. Learn pages are localized
// through the URL (/learn/ru/..., /learn/ky/..., /learn/en/...) so that
// every language version is crawlable and can be linked via hreflang —
// unlike the rest of the app, where language switching is client-side.

export const LEARN_LANGS = ['ru', 'ky', 'en'] as const;
export type LearnLang = (typeof LEARN_LANGS)[number];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function isLearnLang(lang: string): lang is LearnLang {
  return (LEARN_LANGS as readonly string[]).includes(lang);
}

// learnAlternates builds canonical + hreflang links for a learn page.
// pathSuffix is everything after the language segment, e.g. '' for the
// landing page or '/binary-search' for a lesson.
export function learnAlternates(lang: LearnLang, pathSuffix: string): Metadata['alternates'] {
  const url = (l: string) => `${SITE_URL}/learn/${l}${pathSuffix}`;
  return {
    canonical: url(lang),
    languages: {
      ru: url('ru'),
      ky: url('ky'),
      en: url('en'),
      'x-default': url('ru'),
    },
  };
}

// hrefLangHome returns the learn landing URL for in-app links.
export function learnHref(lang: string, slug?: string) {
  const l = isLearnLang(lang) ? lang : 'ru';
  return slug ? `/learn/${l}/${slug}` : `/learn/${l}`;
}
