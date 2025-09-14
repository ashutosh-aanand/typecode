'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsData, getRecentSessions, clearAnalyticsData } from '@/utils/analytics';
import { AnalyticsData, TypingSession } from '@/types/analytics';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentSessions, setRecentSessions] = useState<TypingSession[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    const data = getAnalyticsData();
    setAnalytics(data);
    setRecentSessions(getRecentSessions(10));
  }, []);

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
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-2xl font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                typecode
              </Link>
              <span className="text-gray-400">•</span>
              <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | 'all')}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
                    clearAnalyticsData();
                    window.location.reload();
                  }
                }}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {overallStats.totalSessions}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average CPM</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(overallStats.averageCpm, 'cpm')}`}>
                  {Math.round(overallStats.averageCpm)}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Accuracy</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(overallStats.averageAccuracy, 'accuracy')}`}>
                  {overallStats.averageAccuracy.toFixed(1)}%
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-sm">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Practiced</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(overallStats.totalTimeSeconds)}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-sm">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Bests */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Personal Bests
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Best CPM</span>
                <span className={`font-bold ${getPerformanceColor(overallStats.bestCpm, 'cpm')}`}>
                  {Math.round(overallStats.bestCpm)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Best Accuracy</span>
                <span className={`font-bold ${getPerformanceColor(overallStats.bestAccuracy, 'accuracy')}`}>
                  {overallStats.bestAccuracy.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {overallStats.totalSessions > 0 
                    ? ((overallStats.totalCompletedSessions / overallStats.totalSessions) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {overallStats.currentStreak} days
                </span>
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Language Breakdown
            </h2>
            <div className="space-y-3">
              {Object.entries(overallStats.languageStats)
                .sort(([,a], [,b]) => b.sessions - a.sessions)
                .map(([language, stats]) => (
                  <div key={language} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {language === 'cpp' ? 'C++' : language === 'javascript' ? 'JS' : language}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.sessions} sessions
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {Math.round(stats.averageCpm)} CPM
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {stats.averageAccuracy.toFixed(1)}% acc
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Sessions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Language</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Snippet</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">CPM</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Accuracy</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 text-gray-900 dark:text-gray-100">
                      {formatDate(session.timestamp)}
                    </td>
                    <td className="py-3 text-gray-900 dark:text-gray-100 capitalize">
                      {session.language === 'cpp' ? 'C++' : session.language === 'javascript' ? 'JS' : session.language}
                    </td>
                    <td className="py-3 text-gray-900 dark:text-gray-100">
                      {session.snippetTitle}
                    </td>
                    <td className={`py-3 font-medium ${getPerformanceColor(session.cpm, 'cpm')}`}>
                      {Math.round(session.cpm)}
                    </td>
                    <td className={`py-3 font-medium ${getPerformanceColor(session.accuracy, 'accuracy')}`}>
                      {session.accuracy.toFixed(1)}%
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.completed 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {session.completed ? 'Completed' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
