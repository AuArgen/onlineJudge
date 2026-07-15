'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLearnProgress, setLearnTopicCompleted } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuth } from '@/components/AuthProvider';

// Toggle at the bottom of a lesson: mark it completed / not completed.
// Anonymous visitors see a sign-in hint instead.
export default function LessonCompleteButton({ topicId, lang }: { topicId: number; lang: string }) {
  const t = (key: string) => getTranslation(lang, key);
  const { user, loading } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      getLearnProgress().then((p) => setCompleted(p.completed_topic_ids.includes(topicId)));
    }
  }, [user, topicId]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="text-center py-4">
        <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
          {t('learn.loginToTrack')}
        </Link>
      </div>
    );
  }

  const toggle = async () => {
    setSaving(true);
    try {
      await setLearnTopicCompleted(topicId, !completed);
      setCompleted(!completed);
    } catch {
      // keep previous state on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-center py-4">
      <button
        onClick={toggle}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition disabled:opacity-60 ${
          completed
            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
        }`}
      >
        {completed ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('learn.completed')}
          </>
        ) : (
          t('learn.markComplete')
        )}
      </button>
    </div>
  );
}
