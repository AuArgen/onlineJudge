'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { BoardBackground } from './WhiteboardCanvas';

const PREFS_KEY = 'oj.whiteboard.prefs.v1';
const SCENE_KEY = 'oj.whiteboard.scene.v1';

const WhiteboardCanvas = dynamic(() => import('./WhiteboardCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-white/80">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  ),
});

interface Prefs {
  background: BoardBackground;
  fullscreen: boolean;
}

export default function GlobalWhiteboard() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [background, setBackground] = useState<BoardBackground>('white');
  const [fullscreen, setFullscreen] = useState(false);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs: Partial<Prefs> = JSON.parse(raw);
        if (prefs.background === 'transparent' || prefs.background === 'white') {
          setBackground(prefs.background);
        }
        if (typeof prefs.fullscreen === 'boolean') setFullscreen(prefs.fullscreen);
      }
    } catch {
      // бузулган prefs — демейкилерди колдонобуз
    }
  }, []);

  const savePrefs = (prefs: Prefs) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  };

  const toggleBackground = () => {
    const next: BoardBackground = background === 'white' ? 'transparent' : 'white';
    setBackground(next);
    savePrefs({ background: next, fullscreen });
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    savePrefs({ background, fullscreen: !fullscreen });
  };

  const openBoard = () => {
    setOpen(true);
    setHasOpened(true);
  };

  const clearBoard = () => {
    if (!window.confirm(t('board.clearConfirm'))) return;
    apiRef.current?.updateScene({ elements: [] });
    try {
      localStorage.removeItem(SCENE_KEY);
    } catch {
      // ignore
    }
  };

  const transparent = background === 'transparent';

  return (
    <>
      {/* Экрандын оң четиндеги ачуу баскычы */}
      <button
        onClick={openBoard}
        title={t('board.open')}
        aria-label={t('board.open')}
        className={`fixed right-0 top-1/2 z-[60] -translate-y-1/2 rounded-l-xl bg-indigo-600 p-2.5 text-white shadow-lg transition-all hover:bg-indigo-700 hover:pr-4 ${
          open ? 'pointer-events-none translate-x-full opacity-0' : ''
        }`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>

      {/* Доска панели — оң жактан чыгат */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] flex flex-col transition-transform duration-300 ${
          fullscreen ? 'w-full' : 'w-full md:w-[60%] lg:w-[55%]'
        } ${open ? 'translate-x-0' : 'pointer-events-none translate-x-full'} ${
          transparent ? 'bg-transparent' : 'border-l border-gray-200 bg-white shadow-2xl'
        }`}
      >
        {/* Башкаруу панели */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white/90 px-3 py-1.5 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>{t('board.title')}</span>
            <span className="hidden text-xs font-normal text-gray-400 sm:inline">
              {t('board.savedLocally')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleBackground}
              title={transparent ? t('board.bgWhite') : t('board.bgTransparent')}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              {transparent ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="4 3" />
                </svg>
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              title={fullscreen ? t('board.sidePanel') : t('board.fullscreen')}
              className="hidden rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 md:block"
            >
              {fullscreen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            <button
              onClick={clearBoard}
              title={t('board.clear')}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              title={t('board.close')}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Excalidraw канвасы — биринчи ачылганда гана жүктөлөт */}
        <div className="min-h-0 flex-1">
          {hasOpened && (
            <WhiteboardCanvas
              background={background}
              lang={lang}
              onApiReady={(api) => {
                apiRef.current = api;
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
