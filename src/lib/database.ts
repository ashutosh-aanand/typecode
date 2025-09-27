import { getSupabase, TypingSession, isSupabaseConfigured } from './supabase';

export class DatabaseService {
  // Helper method to check if user is authenticated
  private static async isUserAuthenticated(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }
    
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  }
  // Save typing session
  static async saveSession(sessionData: Omit<TypingSession, 'id' | 'created_at' | 'user_id'>) {
    if (!(await this.isUserAuthenticated())) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // We already checked authentication, but TypeScript doesn't know that
    if (!user) {
      throw new Error('User not authenticated');
    }

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
    if (!(await this.isUserAuthenticated())) {
      return [];
    }

    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // We already checked authentication, but TypeScript doesn't know that
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('typing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get analytics data
  static async getAnalytics() {
    if (!(await this.isUserAuthenticated())) {
      // Return empty analytics for unauthenticated users
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

    const sessions = await this.getUserSessions(1000); // Get more for analytics
    
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

  // Get recent sessions for dashboard
  static async getRecentSessions(limit = 10) {
    if (!(await this.isUserAuthenticated())) {
      return [];
    }
    
    return this.getUserSessions(limit);
  }

  // Clear all user data from Supabase
  static async clearAllUserData() {
    if (!(await this.isUserAuthenticated())) {
      throw new Error('User not authenticated or Supabase not configured');
    }

    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // We already checked authentication, but TypeScript doesn't know that
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('typing_sessions')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    
    console.log('✅ All user data cleared from Supabase');
    return true;
  }
}
