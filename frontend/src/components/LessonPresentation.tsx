'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getTranslation } from '@/lib/translations';

// LessonPresentation shows a "watch the presentation" banner on a lesson
// page and, when clicked, opens a fullscreen animated slide player.
//
// Slides are self-contained HTML strings authored in src/data/presentations.
// Elements with class "step" are revealed one reveal-group at a time:
// data-g assigns an explicit group (elements sharing a group appear
// together), steps without data-g each form their own group in DOM order.
// data-a picks the reveal animation (see globals.css, .lp-* styles).
export default function LessonPresentation({
  slides,
  title,
  lang,
  accent,
}: {
  slides: string[];
  title: string;
  lang: string;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  // Number of revealed step groups on the current slide. Jumping to a
  // previous slide sets a large sentinel that is clamped to the slide's own
  // group count after render, so the slide arrives fully revealed.
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const t = useCallback((key: string) => getTranslation(lang, key), [lang]);

  const scanSteps = useCallback(() => {
    const root = stageRef.current;
    if (!root) return { els: [] as { el: Element; g: number }[], total: 0 };
    let auto = 0;
    let max = -1;
    const els = Array.from(root.querySelectorAll('.step')).map((el) => {
      const attr = (el as HTMLElement).dataset.g;
      const g = attr !== undefined ? parseInt(attr, 10) : auto++;
      if (g > max) max = g;
      return { el, g };
    });
    return { els, total: max + 1 };
  }, []);

  // Apply reveal state to the DOM after every render: the slide's HTML is
  // remounted on slide change (key={slide}), so classes must be re-applied.
  useEffect(() => {
    if (!open) return;
    const { els, total } = scanSteps();
    if (total !== totalSteps) setTotalSteps(total);
    if (step > total) setStep(total);
    const shown = Math.min(step, total);
    els.forEach(({ el, g }) => el.classList.toggle('on', g < shown));
  });

  const next = useCallback(() => {
    const { total } = scanSteps();
    if (step < total) setStep(step + 1);
    else if (slide < slides.length - 1) {
      setSlide(slide + 1);
      setStep(0);
    }
  }, [step, slide, slides.length, scanSteps]);

  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1);
    else if (slide > 0) {
      setSlide(slide - 1);
      setStep(9999);
    }
  }, [step, slide]);

  const requestFs = () => {
    const el = overlayRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    try {
      const p = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.();
      (p as Promise<void> | undefined)?.catch?.(() => {});
    } catch {
      /* pseudo-fullscreen overlay is the fallback (e.g. iOS Safari) */
    }
  };

  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else requestFs();
  };

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setOpen(false);
  }, []);

  const openPlayer = () => {
    setSlide(0);
    setStep(0);
    setOpen(true);
  };

  // While open: go fullscreen right away, lock page scroll, track
  // fullscreen state (Esc exits fullscreen first, then closes the player).
  useEffect(() => {
    if (!open) return;
    requestFs();
    overlayRef.current?.focus();
    document.documentElement.style.overflow = 'hidden';
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('fullscreenchange', onFsChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          e.preventDefault();
          setSlide(0);
          setStep(0);
          break;
        case 'End':
          e.preventDefault();
          setSlide(slides.length - 1);
          setStep(9999);
          break;
        case 'f':
        case 'F':
        case 'а': // f on the ЙЦУКЕН layout
        case 'А':
          toggleFs();
          break;
        case 'Escape':
          if (!document.fullscreenElement) close();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, next, prev, close, slides.length]);

  const onOverlayClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    if (window.getSelection()?.toString()) return; // don't advance while copying code
    next();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const p = e.touches[0];
    touchRef.current = { x: p.clientX, y: p.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  const frac = totalSteps > 0 ? Math.min(step, totalSteps) / totalSteps : 1;
  const progress = ((slide + frac) / slides.length) * 100;

  return (
    <>
      {/* Banner on the lesson page */}
      <button
        type="button"
        onClick={openPlayer}
        className="group w-full text-left mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center gap-4">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 group-hover:scale-110 transition-transform">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-ping opacity-30" />
            <svg className="w-5 h-5 relative ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold text-base sm:text-lg">{t('learn.presOpen')}</span>
            <span className="block text-sm text-white/80 mt-0.5">{t('learn.presHint')}</span>
          </span>
          <span className="hidden sm:flex items-center gap-2 text-white/80 text-sm shrink-0">
            <span>{t('learn.presSlides').replace('{n}', String(slides.length))}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>

      {/* Fullscreen player */}
      {open && (
        <div
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="lp-overlay"
          style={accent ? ({ '--lpa': accent } as React.CSSProperties) : undefined}
          onClick={onOverlayClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="lp-blob lp-blob-a" />
          <div className="lp-blob lp-blob-b" />

          <div className="lp-topbar">
            <div className="lp-tbtitle">{title}</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="lp-btn"
                onClick={toggleFs}
                title={isFs ? t('learn.presExitFullscreen') : t('learn.presFullscreen')}
              >
                {isFs ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              <button type="button" className="lp-btn" onClick={close} title={t('learn.presClose')}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="lp-stage">
            <div
              key={slide}
              ref={stageRef}
              className="lp-slidebox"
              dangerouslySetInnerHTML={{ __html: slides[slide] }}
            />
          </div>

          <div className="lp-bottombar">
            <span className="lp-counter">
              {slide + 1} / {slides.length}
            </span>
            <span className="lp-keys">{t('learn.presKeys')}</span>
            <div className="flex items-center gap-2">
              <button type="button" className="lp-btn" onClick={prev} title={t('learn.presPrev')}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button type="button" className="lp-btn" onClick={next} title={t('learn.presNext')}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="lp-progress">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </>
  );
}
