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

// For backward compatibility - only create if configured
export const supabase = (() => {
  try {
    return getSupabase();
  } catch {
    // Return a mock client for build time
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
})();

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
