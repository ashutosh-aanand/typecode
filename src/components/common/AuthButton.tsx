'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Handle OAuth callback - check for hash fragments
    const handleAuthCallback = async () => {
      // Check if we're returning from OAuth (has hash fragment with access_token)
      if (window.location.hash.includes('access_token')) {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          setUser(session.user);
          setLoading(false);
          return;
        }
      }
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    handleAuthCallback();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: unknown) => {
        setUser((session as { user?: User | null })?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Get the current origin (works for both localhost and production)
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/`
      : '/';
    
    // Debug: log the redirect URL being used
    console.log('OAuth redirect URL:', redirectUrl);
    console.log('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('OAuth sign-in error:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear cached user in DatabaseService
    const { DatabaseService } = await import('@/lib/database');
    DatabaseService.clearUserCache();
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  // Don't show anything if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (loading) {
    return <div className="w-4 h-4 animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full"></div>;
  }

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 max-w-[120px] truncate">
            {user.email}
          </span>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            sign out
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
        >
          sign in
        </button>
      )}
    </div>
  );
}
