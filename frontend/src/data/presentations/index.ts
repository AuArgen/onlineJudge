import type { LearnLang } from '@/lib/learn';
import type { LessonPresentationData } from './types';
import { complexityBigO } from './complexity-big-o';
import { implementationProblems } from './implementation-problems';
import { basicMath } from './basic-math';
import { sorting } from './sorting';
import { twoPointers } from './two-pointers';
import { prefixSums } from './prefix-sums';

// Registry of lesson presentations, keyed by the lesson's slug. Decks are
// authored one file per lesson in this directory; register them here to make
// them appear on the lesson page.
const registry: Record<string, LessonPresentationData> = {
  'complexity-big-o': complexityBigO,
  'implementation-problems': implementationProblems,
  'basic-math': basicMath,
  sorting: sorting,
  'two-pointers': twoPointers,
  'prefix-sums': prefixSums,
};

// getLessonPresentation returns the deck for a lesson in the given language
// (falling back to Russian, the platform's base content language), or null
// when the lesson has no presentation yet.
export function getLessonPresentation(
  slug: string,
  lang: LearnLang,
): { slides: string[]; accent?: string } | null {
  const deck = registry[slug];
  if (!deck) return null;
  const slides = deck.slides[lang]?.length ? deck.slides[lang] : deck.slides.ru;
  if (!slides?.length) return null;
  return { slides, accent: deck.accent };
}
