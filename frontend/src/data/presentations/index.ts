import type { LearnLang } from '@/lib/learn';
import type { LessonPresentationData } from './types';
import { complexityBigO } from './complexity-big-o';
import { implementationProblems } from './implementation-problems';
import { basicMath } from './basic-math';
import { sorting } from './sorting';
import { twoPointers } from './two-pointers';
import { prefixSums } from './prefix-sums';
import { binarySearch } from './binary-search';
import { stackQueue } from './stack-queue';
import { setsMaps } from './sets-maps';
import { recursionBacktracking } from './recursion-backtracking';
import { greedy } from './greedy';
import { dsu } from './dsu';
import { graphsBfsDfs } from './graphs-bfs-dfs';
import { shortestPaths } from './shortest-paths';
import { mst } from './mst';
import { dpBasics } from './dp-basics';
import { dpAdvanced } from './dp-advanced';
import { segmentTree } from './segment-tree';
import { stringAlgorithms } from './string-algorithms';
import { numberTheory } from './number-theory';
import { networkFlows } from './network-flows';
import { suffixStructures } from './suffix-structures';
import { computationalGeometry } from './computational-geometry';
import { cppFirstProgram } from './cpp-first-program';

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
  'binary-search': binarySearch,
  'stack-queue': stackQueue,
  'sets-maps': setsMaps,
  'recursion-backtracking': recursionBacktracking,
  greedy: greedy,
  dsu: dsu,
  'graphs-bfs-dfs': graphsBfsDfs,
  'shortest-paths': shortestPaths,
  mst: mst,
  'dp-basics': dpBasics,
  'dp-advanced': dpAdvanced,
  'segment-tree': segmentTree,
  'string-algorithms': stringAlgorithms,
  'number-theory': numberTheory,
  'network-flows': networkFlows,
  'suffix-structures': suffixStructures,
  'computational-geometry': computationalGeometry,
  'cpp-first-program': cppFirstProgram,
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
