'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { login } = useAuth();
  const { t } = useLanguage();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (code && !hasFetched.current) {
      hasFetched.current = true;

      fetch(`${API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            login(data.token, data.user);
          } else {
            console.error('Login failed:', data);
            alert('Login failed: ' + (data.error || 'Unknown error'));
            router.push('/auth/login');
          }
        })
        .catch((err) => {
          console.error('Error logging in:', err);
          alert('Error logging in');
          router.push('/auth/login');
        });
    }
  }, [code, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">{t('auth.authorizing')}</div>
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>}>
      <CallbackContent />
    </Suspense>
  );
}
