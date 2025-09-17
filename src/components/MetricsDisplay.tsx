'use client';

import { useEffect, useState } from 'react';
import { useTypingStore } from '@/store/typing-store';
// Removed unused imports: formatTime, getPerformanceRating, getAccuracyRating

export default function MetricsDisplay() {
  const { 
    isActive, 
    isComplete, 
    isPerfectCompletion,
    metrics: finalMetrics,
    calculateMetrics,
    currentSnippet
  } = useTypingStore();

  const [currentMetrics, setCurrentMetrics] = useState({
    timeInSeconds: 0,
    accuracy: 0,
    wpm: 0,
    cpm: 0,
    totalCharacters: 0,
    correctCharacters: 0,
    errorCount: 0,
  });

  // Update metrics in real-time while typing
  useEffect(() => {
    if (!isActive && !isComplete) {
      setCurrentMetrics({
        timeInSeconds: 0,
        accuracy: 0,
        wpm: 0,
        cpm: 0,
        totalCharacters: 0,
        correctCharacters: 0,
        errorCount: 0,
      });
      return;
    }

    const interval = setInterval(() => {
      const metrics = calculateMetrics();
      setCurrentMetrics(metrics);
    }, 100); // Update every 100ms for smooth real-time updates

    return () => clearInterval(interval);
  }, [isActive, isComplete, calculateMetrics]);

  // Use final metrics when complete, otherwise use current metrics
  const displayMetrics = isComplete && finalMetrics ? finalMetrics : currentMetrics;
  const showMetrics = isActive || isComplete;

  if (!showMetrics || !currentSnippet) {
    return null; // Show nothing when no active session
  }

  return (
    <div className="text-center py-4">
      {/* Simple metrics row */}
      <div className={`flex justify-center items-center transition-all duration-300 ${
        isComplete ? 'text-2xl md:text-3xl gap-12' : 'text-lg gap-8'
      }`}>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-mono">{Math.floor(displayMetrics.timeInSeconds || 0)}s</span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-mono">{Math.round(displayMetrics.cpm || 0)}</span> cpm
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-mono">{(displayMetrics.accuracy || 0).toFixed(1)}%</span>
        </div>
        {displayMetrics.errorCount > 0 && (
          <div className="text-red-500 dark:text-red-400">
            <span className="font-mono">{displayMetrics.errorCount}</span> error{displayMetrics.errorCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Completion message */}
      {isComplete && (
        <div className="mt-6">
          {isPerfectCompletion ? (
            <div className="text-green-600 dark:text-green-400">
              <span className="text-lg font-medium">🎉 Perfect!</span>
            </div>
          ) : (
            <div className="text-green-600 dark:text-green-400">
              <span className="text-lg font-medium">✓ Completed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
