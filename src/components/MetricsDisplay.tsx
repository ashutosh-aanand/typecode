'use client';

import { useEffect, useState } from 'react';
import { useTypingStore } from '@/store/typing-store';
import { formatTime, getPerformanceRating, getAccuracyRating } from '@/utils/metrics';

export default function MetricsDisplay() {
  const { 
    isActive, 
    isComplete, 
    metrics: finalMetrics,
    calculateMetrics,
    currentSnippet
  } = useTypingStore();

  const [currentMetrics, setCurrentMetrics] = useState({
    timeInSeconds: 0,
    accuracy: 0,
    wpm: 0,
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
      <div className="flex justify-center items-center gap-8 text-lg">
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-mono">{Math.floor(displayMetrics.timeInSeconds)}s</span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-mono">{Math.round(displayMetrics.cpm)}</span> cpm
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-mono">{displayMetrics.accuracy.toFixed(1)}%</span>
        </div>
        {displayMetrics.errorCount > 0 && (
          <div className="text-red-500 dark:text-red-400">
            <span className="font-mono">{displayMetrics.errorCount}</span> error{displayMetrics.errorCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Completion message */}
      {isComplete && (
        <div className="mt-4 text-green-600 dark:text-green-400">
          <span className="text-sm">✓ {currentSnippet.title} completed</span>
        </div>
      )}
    </div>
  );
}
