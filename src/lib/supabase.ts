import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (typeof window === 'undefined') return false; // Skip during SSR
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && url !== 'your_supabase_url_here' && key !== 'your_supabase_anon_key_here';
};

export const getSupabase = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }
  
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// For backward compatibility - lazy initialization
export const supabase = {
  auth: {
    getSession: async () => {
      try {
        const client = getSupabase();
        return await client.auth.getSession();
      } catch {
        return { data: { session: null }, error: null };
      }
    },
    getUser: async () => {
      try {
        const client = getSupabase();
        return await client.auth.getUser();
      } catch {
        return { data: { user: null }, error: null };
      }
    },
    onAuthStateChange: (callback: any) => {
      try {
        const client = getSupabase();
        return client.auth.onAuthStateChange(callback);
      } catch {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    signInWithOAuth: async (options: any) => {
      try {
        const client = getSupabase();
        return await client.auth.signInWithOAuth(options);
      } catch (error) {
        console.error('OAuth sign-in failed:', error);
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        const client = getSupabase();
        return await client.auth.signOut();
      } catch (error) {
        console.error('Sign out failed:', error);
        return { error };
      }
    }
  },
  from: (table: string) => {
    try {
      const client = getSupabase();
      return client.from(table);
    } catch (error) {
      console.error('Database operation failed:', error);
      // Return a mock that throws on actual operations
      return {
        insert: () => Promise.reject(new Error('Supabase not configured')),
        select: () => Promise.reject(new Error('Supabase not configured')),
        eq: () => Promise.reject(new Error('Supabase not configured')),
        order: () => Promise.reject(new Error('Supabase not configured')),
        limit: () => Promise.reject(new Error('Supabase not configured'))
      };
    }
  }
};

// Database types
export type TypingSession = {
  id: string
  user_id: string | null
  language: string
  snippet_title: string
  snippet_id: string | null
  cpm: number
  wpm: number
  accuracy: number
  time_in_seconds: number
  total_characters: number
  correct_characters: number
  error_count: number
  completed: boolean
  created_at: string
}
