'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsData, getRecentSessions, clearAnalyticsData } from '@/utils/analytics';
import { AnalyticsData, TypingSession } from '@/types/analytics';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentSessions, setRecentSessions] = useState<TypingSession[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '6m' | 'all'>('7d');

  useEffect(() => {
    const data = getAnalyticsData();
    setAnalytics(data);
    setRecentSessions(getRecentSessions(10));
  }, []);

  // Filter sessions based on selected timeframe
  const getFilteredSessions = () => {
    if (!analytics) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedTimeframe) {
      case '1d':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'all':
        return analytics.sessions;
    }
    
    return analytics.sessions.filter(session => 
      new Date(session.timestamp) >= cutoffDate
    );
  };

  // Calculate filtered stats
  const filteredSessions = getFilteredSessions();
  const filteredStats = {
    totalSessions: filteredSessions.length,
    averageCpm: filteredSessions.length > 0 
      ? filteredSessions.reduce((sum, s) => sum + s.cpm, 0) / filteredSessions.length 
      : 0,
    averageAccuracy: filteredSessions.length > 0 
      ? filteredSessions.reduce((sum, s) => sum + s.accuracy, 0) / filteredSessions.length 
      : 0,
    totalTimeSeconds: filteredSessions.reduce((sum, s) => sum + s.timeInSeconds, 0),
    bestCpm: filteredSessions.length > 0 
      ? Math.max(...filteredSessions.map(s => s.cpm)) 
      : 0,
    bestAccuracy: filteredSessions.length > 0 
      ? Math.max(...filteredSessions.map(s => s.accuracy)) 
      : 0,
    completedSessions: filteredSessions.filter(s => s.completed).length,
  };

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { overallStats } = analytics;
  
  // Use filtered stats for display, fallback to overall stats for sections that don't change
  const displayStats = selectedTimeframe === 'all' ? overallStats : {
    ...overallStats,
    ...filteredStats
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getPerformanceColor = (value: number, type: 'cpm' | 'accuracy') => {
    if (type === 'cpm') {
      if (value >= 300) return 'text-green-600 dark:text-green-400';
      if (value >= 200) return 'text-blue-600 dark:text-blue-400';
      if (value >= 125) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-gray-600 dark:text-gray-400';
    } else {
      if (value >= 95) return 'text-green-600 dark:text-green-400';
      if (value >= 90) return 'text-blue-600 dark:text-blue-400';
      if (value >= 80) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="text-3xl font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                typecode
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                dashboard
              </span>
            </div>
            <button
              onClick={() => {
                if (confirm('Clear all data?')) {
                  clearAnalyticsData();
                  window.location.reload();
                }
              }}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Clear all analytics data"
            >
              clear
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timeframe Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-6">
            {(['1d', '7d', '30d', '6m', 'all'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`text-sm transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {displayStats.totalSessions}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">sessions</div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${getPerformanceColor(displayStats.averageCpm, 'cpm')}`}>
              {Math.round(displayStats.averageCpm)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">avg cpm</div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${getPerformanceColor(displayStats.averageAccuracy, 'accuracy')}`}>
              {displayStats.averageAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">accuracy</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {formatTime(displayStats.totalTimeSeconds)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">practiced</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
          {/* Personal Bests */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              • personal bests
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">best cpm</span>
                <span className={`font-mono ${getPerformanceColor(displayStats.bestCpm, 'cpm')}`}>
                  {Math.round(displayStats.bestCpm)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">best accuracy</span>
                <span className={`font-mono ${getPerformanceColor(displayStats.bestAccuracy, 'accuracy')}`}>
                  {displayStats.bestAccuracy.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">completion rate</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {displayStats.totalSessions > 0 
                    ? ((displayStats.completedSessions / displayStats.totalSessions) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">current streak</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {overallStats.currentStreak}d
                </span>
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
              • languages
            </h2>
            <div className="space-y-4">
              {Object.entries(overallStats.languageStats)
                .sort(([,a], [,b]) => b.sessions - a.sessions)
                .map(([language, stats]) => (
                  <div key={language} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 dark:text-gray-100 font-mono">
                        {language === 'cpp' ? 'c++' : language === 'javascript' ? 'js' : language}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.sessions}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {Math.round(stats.averageCpm)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.averageAccuracy.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            • recent sessions
          </h2>
          {recentSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              no sessions yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-[60px]">
                      {formatDate(session.timestamp)}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-mono min-w-[40px]">
                      {session.language === 'cpp' ? 'c++' : session.language === 'javascript' ? 'js' : session.language}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                      {session.snippetTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-mono ${getPerformanceColor(session.cpm, 'cpm')}`}>
                      {Math.round(session.cpm)}
                    </span>
                    <span className={`text-sm font-mono ${getPerformanceColor(session.accuracy, 'accuracy')}`}>
                      {session.accuracy.toFixed(1)}%
                    </span>
                    <span className={`text-xs ${session.completed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {session.completed ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
