import { getSupabase, TypingSession, isSupabaseConfigured } from './supabase';
import { User } from '@supabase/supabase-js';

// Analytics data type
type AnalyticsData = {
  totalSessions: number;
  averageCpm: number;
  averageAccuracy: number;
  bestCpm: number;
  bestAccuracy: number;
  totalTimeSeconds: number;
  completedSessions: number;
  currentStreak: number;
  languageStats: Record<string, {
    sessions: number;
    averageCpm: number;
    averageAccuracy: number;
  }>;
};

export class DatabaseService {
  // Cache user to avoid multiple API calls within the same request
  private static cachedUser: User | null | undefined = undefined;
  
  // Cache analytics and sessions to prevent duplicate queries
  private static cachedAnalyticsData: {
    analytics: AnalyticsData;
    recentSessions: TypingSession[];
    timestamp: number;
  } | null = null;
  private static CACHE_DURATION = 5000; // 5 seconds cache
  
  // Get authenticated user (cached per request)
  // Uses getSession() instead of getUser() for better performance and consistency with AuthButton
  private static async getAuthenticatedUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }
    
    // Return cached user if available
    if (this.cachedUser !== undefined) {
      return this.cachedUser;
    }
    
    try {
      const supabase = getSupabase();
      // Use getSession() instead of getUser() - it's faster (checks local storage first)
      // and consistent with AuthButton component
      const { data: { session } } = await supabase.auth.getSession();
      this.cachedUser = session?.user || null;
      return this.cachedUser;
    } catch {
      this.cachedUser = null;
      return null;
    }
  }
  
  // Helper method to check if user is authenticated
  private static async isUserAuthenticated(): Promise<boolean> {
    const user = await this.getAuthenticatedUser();
    return !!user;
  }
  
  // Clear user cache (useful after sign out)
  static clearUserCache() {
    this.cachedUser = undefined;
  }
  // Save typing session
  static async saveSession(sessionData: Omit<TypingSession, 'id' | 'created_at' | 'user_id'>) {
    const user = await this.getAuthenticatedUser();
    
    if (!user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('typing_sessions')
      .insert({
        ...sessionData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user sessions
  static async getUserSessions(limit = 50) {
    const user = await this.getAuthenticatedUser();
    
    if (!user) {
      return [];
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('typing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get analytics data and recent sessions in one call (optimized)
  static async getAnalyticsAndRecentSessions(recentLimit = 10) {
    const user = await this.getAuthenticatedUser();
    
    if (!user) {
      // Return empty data for unauthenticated users
      return {
        analytics: {
          totalSessions: 0,
          averageCpm: 0,
          averageAccuracy: 0,
          bestCpm: 0,
          bestAccuracy: 0,
          totalTimeSeconds: 0,
          completedSessions: 0,
          currentStreak: 0,
          languageStats: {}
        },
        recentSessions: [],
        isAuthenticated: false
      };
    }

    // Check cache first (prevent duplicate queries)
    const now = Date.now();
    if (this.cachedAnalyticsData && 
        (now - this.cachedAnalyticsData.timestamp) < this.CACHE_DURATION) {
      // Return cached data, but slice recent sessions based on requested limit
      const recentSessions = this.cachedAnalyticsData.recentSessions.slice(0, recentLimit);
      return {
        analytics: this.cachedAnalyticsData.analytics,
        recentSessions,
        isAuthenticated: true
      };
    }

    // Fetch all sessions once (we'll use this for both analytics and recent)
    const supabase = getSupabase();
    const { data: sessions, error } = await supabase
      .from('typing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000); // Get enough for analytics
    
    if (error) throw error;
    const allSessions = sessions || [];
    
    // Get recent sessions (first N from the sorted list)
    const recentSessions = allSessions.slice(0, recentLimit);
    
    // Calculate analytics from all sessions
    const analytics = this.calculateAnalytics(allSessions);
    
    // Cache the results
    this.cachedAnalyticsData = {
      analytics,
      recentSessions: allSessions.slice(0, 10), // Cache full recent list
      timestamp: now
    };
    
    return { analytics, recentSessions, isAuthenticated: true };
  }
  
  // Clear analytics cache (useful after saving new sessions)
  static clearAnalyticsCache() {
    this.cachedAnalyticsData = null;
  }
  
  // Calculate analytics from sessions (extracted for reuse)
  private static calculateAnalytics(sessions: TypingSession[]) {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageCpm: 0,
        averageAccuracy: 0,
        bestCpm: 0,
        bestAccuracy: 0,
        totalTimeSeconds: 0,
        completedSessions: 0,
        currentStreak: 0,
        languageStats: {}
      };
    }

    // Calculate analytics
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const averageCpm = sessions.reduce((sum, s) => sum + s.cpm, 0) / totalSessions;
    const averageAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions;
    const bestCpm = Math.max(...sessions.map(s => s.cpm));
    const bestAccuracy = Math.max(...sessions.map(s => s.accuracy));
    const totalTimeSeconds = sessions.reduce((sum, s) => sum + s.time_in_seconds, 0);

    // Calculate current streak (consecutive days with sessions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    const checkDate = new Date(today);
    
    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasSessions = sessions.some(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      if (hasSessions) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Language stats
    const languageStatsTemp: Record<string, {
      sessions: number;
      totalCpm: number;
      totalAccuracy: number;
    }> = {};
    
    sessions.forEach(session => {
      if (!languageStatsTemp[session.language]) {
        languageStatsTemp[session.language] = {
          sessions: 0,
          totalCpm: 0,
          totalAccuracy: 0
        };
      }
      languageStatsTemp[session.language].sessions++;
      languageStatsTemp[session.language].totalCpm += session.cpm;
      languageStatsTemp[session.language].totalAccuracy += session.accuracy;
    });

    // Calculate final language stats with averages
    const languageStats: Record<string, {
      sessions: number;
      averageCpm: number;
      averageAccuracy: number;
    }> = {};
    
    Object.keys(languageStatsTemp).forEach(lang => {
      const temp = languageStatsTemp[lang];
      languageStats[lang] = {
        sessions: temp.sessions,
        averageCpm: temp.totalCpm / temp.sessions,
        averageAccuracy: temp.totalAccuracy / temp.sessions
      };
    });

    return {
      totalSessions,
      averageCpm,
      averageAccuracy,
      bestCpm,
      bestAccuracy,
      totalTimeSeconds,
      completedSessions,
      currentStreak,
      languageStats
    };
  }

  // Get analytics data (kept for backward compatibility, but uses optimized method)
  static async getAnalytics() {
    const { analytics } = await this.getAnalyticsAndRecentSessions(0);
    return analytics;
  }

  // Get recent sessions for dashboard (kept for backward compatibility)
  static async getRecentSessions(limit = 10) {
    const { recentSessions } = await this.getAnalyticsAndRecentSessions(limit);
    return recentSessions;
  }

  // Clear all user data from Supabase
  static async clearAllUserData() {
    console.log('🗑️ Starting cloud data deletion...');
    
    const user = await this.getAuthenticatedUser();
    
    if (!user) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    const supabase = getSupabase();

    console.log(`🗑️ Deleting all sessions for user: ${user.id}`);

    const { data, error } = await supabase
      .from('typing_sessions')
      .delete()
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('❌ Supabase deletion error:', error);
      throw error;
    }
    
    console.log('✅ All user data cleared from Supabase. Deleted rows:', data?.length || 0);
    return { deletedCount: data?.length || 0 };
  }
}
