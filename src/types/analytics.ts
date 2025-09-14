// Analytics types for dashboard

export interface TypingSession {
  id: string;
  timestamp: number;
  language: string;
  snippetId: string;
  snippetTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  
  // Performance metrics
  timeInSeconds: number;
  accuracy: number;
  cpm: number;
  wpm: number;
  totalCharacters: number;
  correctCharacters: number;
  errorCount: number;
  
  // Additional stats
  completed: boolean;
  restarts: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  sessionsCount: number;
  totalTimeSeconds: number;
  averageCpm: number;
  averageAccuracy: number;
  bestCpm: number;
  bestAccuracy: number;
  languagesUsed: string[];
  completedSessions: number;
}

export interface OverallStats {
  totalSessions: number;
  totalTimeSeconds: number;
  averageCpm: number;
  averageAccuracy: number;
  bestCpm: number;
  bestAccuracy: number;
  favoriteLanguage: string;
  totalCompletedSessions: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
  
  // Language breakdown
  languageStats: Record<string, {
    sessions: number;
    averageCpm: number;
    averageAccuracy: number;
    bestCpm: number;
    totalTimeSeconds: number;
  }>;
  
  // Difficulty breakdown
  difficultyStats: Record<string, {
    sessions: number;
    averageCpm: number;
    averageAccuracy: number;
    completionRate: number;
  }>;
}

export interface AnalyticsData {
  sessions: TypingSession[];
  dailyStats: Record<string, DailyStats>; // date -> stats
  overallStats: OverallStats;
  lastUpdated: number;
}
