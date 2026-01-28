'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-700 transition-colors">
                &lt;/&gt;
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                Online Judge
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              <Link 
                href="/problems" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/problems') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Задачи
              </Link>
              <Link 
                href="/contests" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/contests') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Соревнования
              </Link>
              <Link 
                href="/leaderboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/leaderboard') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Рейтинг
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link 
                    href="/dashboard" 
                    className={`p-2 rounded-full transition-colors ${
                      isActive('/dashboard') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title="Панель управления"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </Link>

                  <Link 
                    href="/profile" 
                    className={`p-2 rounded-full transition-colors ${
                      isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title="Личный кабинет"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                  
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className={`p-2 rounded-full transition-colors ${
                        isActive('/admin') ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title="Админ панель"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                  )}

                  <button 
                    onClick={logout} 
                    className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Выйти"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
