'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTypingStore } from '@/store/typing-store';
import { ProgrammingLanguage } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const { selectedLanguage, setLanguage, isActive } = useTypingStore();

  const isDashboard = pathname === '/dashboard';

  return (
    <header className={`
      ${isDashboard 
        ? 'py-8' 
        : `transition-all duration-500 ease-in-out overflow-hidden ${
            isActive ? 'max-h-0 py-0 opacity-0' : 'max-h-20 py-8 opacity-100'
          }`
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-3xl font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              typecode
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {['java', 'cpp', 'python', 'javascript'].map((lang) => {
                const isSelected = selectedLanguage === lang;
                
                if (isDashboard) {
                  return (
                    <Link
                      key={lang}
                      href="/"
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors relative"
                    >
                      {lang === 'cpp' ? 'c++' : lang === 'javascript' ? 'js' : lang}
                    </Link>
                  );
                }

                return (
                  <button
                    key={lang}
                    onClick={() => !isActive && setLanguage(lang as ProgrammingLanguage)}
                    disabled={isActive}
                    className={`
                      transition-colors duration-200 relative
                      ${isSelected 
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                      }
                      ${isActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    {lang === 'cpp' ? 'c++' : lang === 'javascript' ? 'js' : lang}
                    {isSelected && (
                      <div className="absolute -bottom-1 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {isDashboard ? (
            <span className="text-sm text-gray-900 dark:text-gray-100 relative">
              dashboard
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
            </span>
          ) : (
            <Link 
              href="/dashboard"
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors relative"
            >
              dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
