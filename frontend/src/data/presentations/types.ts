import type { LearnLang } from '@/lib/learn';

// One lesson presentation: ordered slides per language, each slide a
// self-contained HTML string rendered inside the fullscreen player.
//
// Authoring contract (understood by LessonPresentation + globals.css):
//  - elements with class "step" are hidden and revealed one by one;
//  - data-g="<n>" puts several elements into the same reveal group so they
//    appear together (when any step on a slide uses data-g, give explicit
//    groups to all steps on that slide);
//  - data-a picks the reveal animation: default fade-up, "left", "right",
//    "zoom", "none" (fade only), "grow" (animates .lp-bar fills inside),
//    "draw" (draws SVG paths with class "lpd" and pathLength="1").
export interface LessonPresentationData {
  // Accent color of the deck (progress bar, kicker, defaults of chips).
  accent?: string;
  slides: Record<LearnLang, string[]>;
}
