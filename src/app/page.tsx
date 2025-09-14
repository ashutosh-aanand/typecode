'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTypingStore } from '@/store/typing-store';
import { ProgrammingLanguage } from '@/types';
import Controls from '@/components/Controls';
import EnhancedTypingArea from '@/components/EnhancedTypingArea';
import MetricsDisplay from '@/components/MetricsDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const { 
    currentSnippet, 
    isActive, 
    isComplete,
    selectedLanguage,
    setLanguage,
    loadRandomSnippet,
    resetSession
  } = useTypingStore();

  // Load initial snippet on mount
  useEffect(() => {
    loadRandomSnippet();
  }, [loadRandomSnippet]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className={`
        transition-all duration-500 ease-in-out overflow-hidden
        ${isActive ? 'max-h-0 py-0 opacity-0' : 'max-h-20 py-8 opacity-100'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              typecode
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                {['java', 'cpp', 'python', 'javascript'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => !isActive && setLanguage(lang as ProgrammingLanguage)}
                    disabled={isActive}
                    className={`
                      transition-colors duration-200
                      ${selectedLanguage === lang 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
                      }
                      ${isActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    {lang === 'cpp' ? 'c++' : lang === 'javascript' ? 'js' : lang}
                  </button>
                ))}
              </div>
              <Link 
                href="/dashboard"
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
              >
                dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`
        max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out
        ${isActive ? 'py-4' : 'py-6 sm:py-8'}
      `}>
        <div className={`
          transition-all duration-300 ease-in-out
          ${isActive ? 'space-y-4' : 'space-y-8'}
        `}>
          {/* Live Metrics */}
          <MetricsDisplay />

          {/* Controls */}
          <div className={`
            flex justify-center transition-all duration-300 ease-in-out
            ${isActive ? 'opacity-60 scale-90' : 'opacity-100 scale-100'}
          `}>
            <Controls
              onNewSnippet={loadRandomSnippet}
              onReset={resetSession}
              isActive={isActive}
              isComplete={isComplete}
            />
          </div>

          {/* Enhanced Typing Area */}
          {currentSnippet ? (
            <div className="max-w-4xl mx-auto">
              <EnhancedTypingArea />
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading snippet...</p>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
