'use client';

import { useEffect, useState, useRef } from 'react';
import { getAnalyticsData, getRecentSessions } from '@/utils/analytics';
import { AnalyticsData, TypingSession } from '@/types/analytics';
import { DatabaseService } from '@/lib/database';
import { isSupabaseConfigured, TypingSession as SupabaseSession } from '@/lib/supabase';
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
  const [loading, setLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode (development)
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    const loadAnalytics = async () => {
      try {
        // Check if Supabase is configured
        if (isSupabaseConfigured()) {
          console.log('📊 Loading analytics from Supabase for authenticated user...');
          // Use optimized method that fetches both analytics and recent sessions in one call
          // This method handles authentication internally and caches the user
          const { analytics: supabaseAnalytics, recentSessions: supabaseRecentSessions, isAuthenticated } = 
            await DatabaseService.getAnalyticsAndRecentSessions(10);
          
          // Check if user is authenticated (not just if they have data)
          if (isAuthenticated) {
          
          // Convert Supabase language stats to match analytics format
          const convertedLanguageStats: Record<string, {
            sessions: number;
            averageCpm: number;
            averageAccuracy: number;
            bestCpm: number;
            totalTimeSeconds: number;
          }> = {};

          Object.entries(supabaseAnalytics.languageStats).forEach(([language, stats]) => {
            convertedLanguageStats[language] = {
              sessions: stats.sessions,
              averageCpm: stats.averageCpm,
              averageAccuracy: stats.averageAccuracy,
              bestCpm: stats.averageCpm, // Use average as best for now
              totalTimeSeconds: 0 // Not available from Supabase yet
            };
          });

          // Convert Supabase data to match our analytics format
          const convertedAnalytics: AnalyticsData = {
            sessions: [], // We'll use the converted sessions
            dailyStats: {}, // Not implemented yet
            overallStats: {
              totalSessions: supabaseAnalytics.totalSessions,
              totalTimeSeconds: supabaseAnalytics.totalTimeSeconds,
              averageCpm: supabaseAnalytics.averageCpm,
              averageAccuracy: supabaseAnalytics.averageAccuracy,
              bestCpm: supabaseAnalytics.bestCpm,
              bestAccuracy: supabaseAnalytics.bestAccuracy,
              favoriteLanguage: 'java', // Default for now
              totalCompletedSessions: supabaseAnalytics.completedSessions,
              currentStreak: supabaseAnalytics.currentStreak,
              longestStreak: supabaseAnalytics.currentStreak, // Use current as longest for now
              lastSessionDate: new Date().toISOString().split('T')[0], // Today as default
              languageStats: convertedLanguageStats,
              difficultyStats: {} // Not implemented yet
            },
            lastUpdated: Date.now()
          };

          // Convert Supabase sessions to analytics format
          const convertedSessions = supabaseRecentSessions.map((session: SupabaseSession) => ({
            id: session.id,
            timestamp: new Date(session.created_at).getTime(),
            language: session.language,
            snippetTitle: session.snippet_title,
            snippetId: session.snippet_id || '',
            cpm: session.cpm,
            wpm: session.wpm,
            accuracy: session.accuracy,
            timeInSeconds: session.time_in_seconds,
            totalCharacters: session.total_characters,
            correctCharacters: session.correct_characters,
            errorCount: session.error_count,
            completed: session.completed,
            difficulty: 'medium' as const, // Default since not stored in DB
            category: 'algorithm' as const, // Default since not stored in DB
            restarts: 0 // Default since not stored in DB
          }));

            setAnalytics(convertedAnalytics);
            setRecentSessions(convertedSessions);
            setUsingSupabase(true);
            console.log('✅ Successfully loaded analytics from Supabase');
          } else {
            console.log('👤 User not authenticated, using localStorage');
            throw new Error('User not authenticated');
          }
        } else {
          console.log('⚙️ Supabase not configured, using localStorage');
          throw new Error('Supabase not configured');
        }
      } catch (error) {
        console.log('⚠️ Supabase unavailable, falling back to localStorage:', error);
        // Fallback to localStorage
        const localData = getAnalyticsData();
        setAnalytics(localData);
        setRecentSessions(getRecentSessions(10));
        setUsingSupabase(false);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
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

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            {usingSupabase ? 'Loading analytics from cloud...' : 'Loading analytics...'}
          </p>
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
        {/* Data Source Indicator */}
        <div className="flex justify-center mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            usingSupabase 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              usingSupabase ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            {usingSupabase ? 'Cloud Data - Synced across devices' : 'Local Data - Sign in for cloud sync'}
          </div>
        </div>

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

        <ClearDataButton usingSupabase={usingSupabase} />
      </main>
    </div>
  );
}
