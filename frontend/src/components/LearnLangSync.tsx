'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Aligns the client-side language context with the language segment of the
// current /learn URL, so the navbar and the rest of the UI match the page
// the visitor actually opened (e.g. from a search result in English).
export default function LearnLangSync({ lang }: { lang: string }) {
  const { lang: ctxLang, setLang } = useLanguage();

  useEffect(() => {
    if (lang !== ctxLang) setLang(lang);
    // The root layout hard-codes <html lang="ru">; reflect the actual page
    // language for assistive tech. Restore the default when leaving /learn.
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = 'ru';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return null;
}
