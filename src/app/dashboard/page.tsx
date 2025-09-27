'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsData, getRecentSessions } from '@/utils/analytics';
import { AnalyticsData, TypingSession } from '@/types/analytics';
import Navbar from '@/components/common/Navbar';
import TimeframeSelector from '@/components/dashboard/TimeframeSelector';
import StatsOverview from '@/components/dashboard/StatsOverview';
import PersonalBests from '@/components/dashboard/PersonalBests';
import LanguageBreakdown from '@/components/dashboard/LanguageBreakdown';
import RecentSessions from '@/components/dashboard/RecentSessions';
import ClearDataButton from '@/components/dashboard/ClearDataButton';

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

  // Calculate completion rate
  const completionRate = displayStats.totalSessions > 0 
    ? (filteredStats.completedSessions / displayStats.totalSessions) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TimeframeSelector 
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />

        <StatsOverview 
          totalSessions={displayStats.totalSessions}
          averageCpm={displayStats.averageCpm}
          averageAccuracy={displayStats.averageAccuracy}
          totalTimeSeconds={displayStats.totalTimeSeconds}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
          <PersonalBests 
            bestCpm={displayStats.bestCpm}
            bestAccuracy={displayStats.bestAccuracy}
            completionRate={completionRate}
            currentStreak={overallStats.currentStreak}
          />

          <LanguageBreakdown 
            languageStats={overallStats.languageStats}
          />
        </div>

        <RecentSessions sessions={recentSessions} />

        <ClearDataButton />
      </main>
    </div>
  );
}
