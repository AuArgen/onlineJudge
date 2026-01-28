'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

export default function Login() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/auth/google/url`)
      .then((res) => res.json())
      .then((data) => setUrl(data.url));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Войти в аккаунт</h2>
        </div>
        <div className="mt-8 space-y-6">
          {url ? (
            <a
              href={url}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Войти через Google
            </a>
          ) : (
            <p className="text-center text-gray-500">Загрузка...</p>
          )}
        </div>
      </div>
    </div>
  );
}
