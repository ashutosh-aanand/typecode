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
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Practice Typing Real Java Code
            </h2>
            <p className="text-sm mb-4">
              Improve your coding muscle memory with authentic Data Structures and Algorithms snippets. 
              Click on the code below and start typing - characters will light up as you type them correctly.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span>📊</span>
              <span>Your speed and accuracy will be tracked here in real-time</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`
        rounded-lg border p-6 transition-colors duration-300
        ${isComplete 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isComplete ? '🎉 Final Results' : '📊 Live Metrics'}
          </h3>
          {isComplete && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Session Complete!
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Time */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatTime(displayMetrics.timeInSeconds)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Time</div>
          </div>

          {/* WPM */}
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(displayMetrics.wpm)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">WPM</div>
            {isComplete && (
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {getPerformanceRating(displayMetrics.wpm)}
              </div>
            )}
          </div>

          {/* Accuracy */}
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {displayMetrics.accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
            {isComplete && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {getAccuracyRating(displayMetrics.accuracy)}
              </div>
            )}
          </div>

          {/* Characters */}
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {displayMetrics.correctCharacters}/{displayMetrics.totalCharacters}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Characters</div>
            {displayMetrics.errorCount > 0 && (
              <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                {displayMetrics.errorCount} error{displayMetrics.errorCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>
              {displayMetrics.totalCharacters} / {currentSnippet.code.length} characters
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isComplete 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`}
              style={{ 
                width: `${Math.min((displayMetrics.totalCharacters / currentSnippet.code.length) * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Additional Stats for Completed Sessions */}
        {isComplete && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Algorithm
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {currentSnippet.title}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Difficulty
                </div>
                <div className={`
                  inline-block px-2 py-1 rounded-full text-xs font-medium
                  ${currentSnippet.difficulty === 'easy' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : currentSnippet.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }
                `}>
                  {currentSnippet.difficulty.charAt(0).toUpperCase() + currentSnippet.difficulty.slice(1)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Category
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {currentSnippet.category}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
