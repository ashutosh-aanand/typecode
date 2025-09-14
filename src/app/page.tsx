'use client';

import { useEffect } from 'react';
import { useTypingStore } from '@/store/typing-store';
import Controls from '@/components/Controls';
import OverlayTypingArea from '@/components/OverlayTypingArea';
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">x</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                xtype
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                Typing Practice for Programmers
              </span>
            </div>
            
            {/* Quick stats placeholder */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Java DSA Algorithms
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Live Metrics */}
          <MetricsDisplay />

          {/* Controls */}
          <Controls
            onNewSnippet={loadRandomSnippet}
            onReset={resetSession}
            isActive={isActive}
            isComplete={isComplete}
          />

          {/* Overlay Typing Area */}
          {currentSnippet ? (
            <div className="max-w-4xl mx-auto">
              <OverlayTypingArea />
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading snippet...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              xtype - A specialized typing practice platform for programmers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
