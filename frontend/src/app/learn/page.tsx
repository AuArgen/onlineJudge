'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLearnLang } from '@/lib/learn';

// The learn section is always addressed with an explicit language segment
// so each localized version has its own indexable URL. Bare /learn forwards
// to the visitor's saved interface language (Russian by default). We read
// localStorage directly instead of the language context to avoid racing the
// provider's own localStorage hydration effect.
export default function LearnIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('lang') || 'ru';
    router.replace(`/learn/${isLearnLang(saved) ? saved : 'ru'}`);
  }, [router]);

  return null;
}
