'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation } from '@/lib/translations';

export const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ru',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('ru');

  useEffect(() => {
    const saved = localStorage.getItem('lang') || 'ru';
    setLangState(saved);
  }, []);

  const setLang = (newLang: string) => {
    localStorage.setItem('lang', newLang);
    setLangState(newLang);
  };

  const t = (key: string) => getTranslation(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
