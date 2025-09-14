import { AnalyticsData, TypingSession } from '@/types/analytics';
import { TypingMetrics } from '@/types';

const ANALYTICS_KEY = 'typecode-analytics';

// Initialize empty analytics data
const createEmptyAnalytics = (): AnalyticsData => ({
  sessions: [],
  dailyStats: {},
  overallStats: {
    totalSessions: 0,
    totalTimeSeconds: 0,
    averageCpm: 0,
    averageAccuracy: 0,
    bestCpm: 0,
    bestAccuracy: 0,
    favoriteLanguage: 'java',
    totalCompletedSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: '',
    languageStats: {},
    difficultyStats: {},
  },
  lastUpdated: Date.now(),
});

// Get analytics data from localStorage
export const getAnalyticsData = (): AnalyticsData => {
  if (typeof window === 'undefined') return createEmptyAnalytics();
  
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (!stored) return createEmptyAnalytics();
    
    const data = JSON.parse(stored) as AnalyticsData;
    
    // Ensure all required fields exist (for backwards compatibility)
    return {
      ...createEmptyAnalytics(),
      ...data,
      overallStats: {
        ...createEmptyAnalytics().overallStats,
        ...data.overallStats,
      },
    };
  } catch (error) {
    console.error('Failed to load analytics data:', error);
    return createEmptyAnalytics();
  }
};

// Save analytics data to localStorage
export const saveAnalyticsData = (data: AnalyticsData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    data.lastUpdated = Date.now();
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save analytics data:', error);
  }
};

// Add a new typing session
export const addTypingSession = (
  language: string,
  snippetId: string,
  snippetTitle: string,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string,
  metrics: TypingMetrics,
  completed: boolean,
  restarts: number = 0
): void => {
  const data = getAnalyticsData();
  
  const session: TypingSession = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    language,
    snippetId,
    snippetTitle,
    difficulty,
    category,
    timeInSeconds: metrics.timeInSeconds,
    accuracy: metrics.accuracy,
    cpm: metrics.cpm,
    wpm: metrics.wpm,
    totalCharacters: metrics.totalCharacters,
    correctCharacters: metrics.correctCharacters,
    errorCount: metrics.errorCount,
    completed,
    restarts,
  };
  
  // Add session to history
  data.sessions.push(session);
  
  // Keep only last 1000 sessions to prevent localStorage bloat
  if (data.sessions.length > 1000) {
    data.sessions = data.sessions.slice(-1000);
  }
  
  // Update daily stats
  updateDailyStats(data, session);
  
  // Update overall stats
  updateOverallStats(data, session);
  
  saveAnalyticsData(data);
};

// Update daily statistics
const updateDailyStats = (data: AnalyticsData, session: TypingSession): void => {
  const date = new Date(session.timestamp).toISOString().split('T')[0];
  
  if (!data.dailyStats[date]) {
    data.dailyStats[date] = {
      date,
      sessionsCount: 0,
      totalTimeSeconds: 0,
      averageCpm: 0,
      averageAccuracy: 0,
      bestCpm: 0,
      bestAccuracy: 0,
      languagesUsed: [],
      completedSessions: 0,
    };
  }
  
  const dayStats = data.dailyStats[date];
  
  dayStats.sessionsCount++;
  dayStats.totalTimeSeconds += session.timeInSeconds;
  dayStats.bestCpm = Math.max(dayStats.bestCpm, session.cpm);
  dayStats.bestAccuracy = Math.max(dayStats.bestAccuracy, session.accuracy);
  
  if (session.completed) {
    dayStats.completedSessions++;
  }
  
  if (!dayStats.languagesUsed.includes(session.language)) {
    dayStats.languagesUsed.push(session.language);
  }
  
  // Recalculate averages for the day
  const todaySessions = data.sessions.filter(s => 
    new Date(s.timestamp).toISOString().split('T')[0] === date
  );
  
  dayStats.averageCpm = todaySessions.reduce((sum, s) => sum + s.cpm, 0) / todaySessions.length;
  dayStats.averageAccuracy = todaySessions.reduce((sum, s) => sum + s.accuracy, 0) / todaySessions.length;
};

// Update overall statistics
const updateOverallStats = (data: AnalyticsData, session: TypingSession): void => {
  const stats = data.overallStats;
  
  stats.totalSessions++;
  stats.totalTimeSeconds += session.timeInSeconds;
  stats.bestCpm = Math.max(stats.bestCpm, session.cpm);
  stats.bestAccuracy = Math.max(stats.bestAccuracy, session.accuracy);
  
  if (session.completed) {
    stats.totalCompletedSessions++;
  }
  
  // Update language stats
  if (!stats.languageStats[session.language]) {
    stats.languageStats[session.language] = {
      sessions: 0,
      averageCpm: 0,
      averageAccuracy: 0,
      bestCpm: 0,
      totalTimeSeconds: 0,
    };
  }
  
  const langStats = stats.languageStats[session.language];
  langStats.sessions++;
  langStats.totalTimeSeconds += session.timeInSeconds;
  langStats.bestCpm = Math.max(langStats.bestCpm, session.cpm);
  
  // Update difficulty stats
  if (!stats.difficultyStats[session.difficulty]) {
    stats.difficultyStats[session.difficulty] = {
      sessions: 0,
      averageCpm: 0,
      averageAccuracy: 0,
      completionRate: 0,
    };
  }
  
  const diffStats = stats.difficultyStats[session.difficulty];
  diffStats.sessions++;
  
  // Recalculate overall averages
  stats.averageCpm = data.sessions.reduce((sum, s) => sum + s.cpm, 0) / data.sessions.length;
  stats.averageAccuracy = data.sessions.reduce((sum, s) => sum + s.accuracy, 0) / data.sessions.length;
  
  // Recalculate language averages
  Object.keys(stats.languageStats).forEach(lang => {
    const langSessions = data.sessions.filter(s => s.language === lang);
    const langStatsObj = stats.languageStats[lang];
    langStatsObj.averageCpm = langSessions.reduce((sum, s) => sum + s.cpm, 0) / langSessions.length;
    langStatsObj.averageAccuracy = langSessions.reduce((sum, s) => sum + s.accuracy, 0) / langSessions.length;
  });
  
  // Recalculate difficulty averages
  Object.keys(stats.difficultyStats).forEach(diff => {
    const diffSessions = data.sessions.filter(s => s.difficulty === diff);
    const diffStatsObj = stats.difficultyStats[diff];
    diffStatsObj.averageCpm = diffSessions.reduce((sum, s) => sum + s.cpm, 0) / diffSessions.length;
    diffStatsObj.averageAccuracy = diffSessions.reduce((sum, s) => sum + s.accuracy, 0) / diffSessions.length;
    diffStatsObj.completionRate = (diffSessions.filter(s => s.completed).length / diffSessions.length) * 100;
  });
  
  // Find favorite language (most sessions)
  const languageCounts = Object.entries(stats.languageStats)
    .map(([lang, langStats]) => ({ lang, count: langStats.sessions }))
    .sort((a, b) => b.count - a.count);
  
  if (languageCounts.length > 0) {
    stats.favoriteLanguage = languageCounts[0].lang;
  }
  
  // Update streaks
  updateStreaks(data, session);
};

// Update typing streaks
const updateStreaks = (data: AnalyticsData, session: TypingSession): void => {
  const stats = data.overallStats;
  const sessionDate = new Date(session.timestamp).toISOString().split('T')[0];
  
  if (session.completed) {
    const lastDate = stats.lastSessionDate;
    
    if (!lastDate) {
      // First completed session
      stats.currentStreak = 1;
      stats.longestStreak = 1;
    } else {
      const lastDateTime = new Date(lastDate);
      const sessionDateTime = new Date(sessionDate);
      const daysDiff = Math.floor((sessionDateTime.getTime() - lastDateTime.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        stats.currentStreak++;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      } else if (daysDiff === 0) {
        // Same day, maintain streak
        // Don't change streak count
      } else {
        // Streak broken
        stats.currentStreak = 1;
      }
    }
    
    stats.lastSessionDate = sessionDate;
  }
};

// Get recent sessions (last N sessions)
export const getRecentSessions = (count: number = 10): TypingSession[] => {
  const data = getAnalyticsData();
  return data.sessions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, count);
};

// Get sessions for a specific date range
export const getSessionsInRange = (startDate: Date, endDate: Date): TypingSession[] => {
  const data = getAnalyticsData();
  return data.sessions.filter(session => {
    const sessionDate = new Date(session.timestamp);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
};

// Clear all analytics data
export const clearAnalyticsData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ANALYTICS_KEY);
};

// Export analytics data as JSON
export const exportAnalyticsData = (): string => {
  const data = getAnalyticsData();
  return JSON.stringify(data, null, 2);
};

// Import analytics data from JSON
export const importAnalyticsData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData) as AnalyticsData;
    saveAnalyticsData(data);
    return true;
  } catch (error) {
    console.error('Failed to import analytics data:', error);
    return false;
  }
};
