'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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
