'use client';

import { useEffect } from 'react';
import { useTypingStore } from '@/store/typing-store';
import Navbar from '@/components/Navbar';
import Controls from '@/components/Controls';
import EnhancedTypingArea from '@/components/EnhancedTypingArea';
import MetricsDisplay from '@/components/MetricsDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const { 
    currentSnippet, 
    isActive, 
    isComplete,
    loadRandomSnippet,
    resetSession
  } = useTypingStore();

  // Load initial snippet on mount
  useEffect(() => {
    loadRandomSnippet();
  }, [loadRandomSnippet]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

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
