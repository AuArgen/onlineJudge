'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawImperativeAPI, BinaryFiles } from '@excalidraw/excalidraw/types';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';

const SCENE_KEY = 'oj.whiteboard.scene.v1';

export type BoardBackground = 'white' | 'transparent';

interface SavedScene {
  elements: readonly OrderedExcalidrawElement[];
  files: BinaryFiles;
}

function loadScene(): SavedScene | null {
  try {
    const raw = localStorage.getItem(SCENE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.elements)) return null;
    return { elements: parsed.elements, files: parsed.files ?? {} };
  } catch {
    return null;
  }
}

interface Props {
  background: BoardBackground;
  lang: string;
  onApiReady: (api: ExcalidrawImperativeAPI) => void;
}

const EXCALIDRAW_LANGS: Record<string, string> = {
  ru: 'ru-RU',
  ky: 'ru-RU', // Excalidraw'до кыргызча жок — орусчага түшөбүз
  en: 'en',
};

export default function WhiteboardCanvas({ background, lang, onApiReady }: Props) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialScene = useRef<SavedScene | null | undefined>(undefined);

  if (initialScene.current === undefined) {
    initialScene.current = loadScene();
  }

  const bgColor = background === 'transparent' ? 'transparent' : '#ffffff';

  useEffect(() => {
    apiRef.current?.updateScene({ appState: { viewBackgroundColor: bgColor } });
  }, [bgColor]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handleChange = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const api = apiRef.current;
      if (!api) return;
      try {
        localStorage.setItem(
          SCENE_KEY,
          JSON.stringify({
            elements: api.getSceneElements(),
            files: api.getFiles(),
          })
        );
      } catch {
        // localStorage толуп калса (чоң сүрөттөр) — унчукпай өткөрөбүз,
        // доска иштей берет, жөн гана сакталбайт
      }
    }, 600);
  }, []);

  return (
    <Excalidraw
      excalidrawAPI={(api) => {
        apiRef.current = api;
        onApiReady(api);
      }}
      initialData={{
        elements: initialScene.current?.elements ?? [],
        files: initialScene.current?.files ?? undefined,
        appState: { viewBackgroundColor: bgColor },
      }}
      onChange={handleChange}
      langCode={EXCALIDRAW_LANGS[lang] ?? 'en'}
    />
  );
}
