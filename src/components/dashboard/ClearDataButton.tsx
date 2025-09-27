'use client';

import { useState } from 'react';
import { clearAnalyticsData } from '@/utils/analytics';
import { DatabaseService } from '@/lib/database';

interface ClearDataButtonProps {
  usingSupabase?: boolean;
}

export default function ClearDataButton({ usingSupabase = false }: ClearDataButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearData = async () => {
    setIsClearing(true);
    
    try {
      // Clear local data first
      clearAnalyticsData();
      console.log('✅ Local data cleared');
      
      // Clear Supabase data if user is authenticated
      if (usingSupabase) {
        await DatabaseService.clearAllUserData();
        console.log('✅ Cloud data cleared');
      }
      
      // Show success message
      alert(usingSupabase 
        ? '✅ All data cleared successfully! Both cloud and local data have been removed.'
        : '✅ Local data cleared successfully!'
      );
      
      // Reload to refresh the dashboard
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      alert(usingSupabase 
        ? '⚠️ Local data cleared, but there was an error clearing cloud data. Please try again or check your connection.'
        : '❌ Error clearing local data. Please try again.'
      );
    } finally {
      setIsClearing(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mt-12">
        <button
          onClick={() => setShowConfirmation(true)}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="Clear all analytics data"
          disabled={isClearing}
        >
          {isClearing ? 'clearing...' : 'clear all data'}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Clear All Data
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Are you sure you want to clear all your typing analytics data?
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                  <li>• All typing session history</li>
                  <li>• Personal best records</li>
                  <li>• Language statistics</li>
                  <li>• Progress streaks</li>
                  {usingSupabase && <li>• Cloud data (synced across devices)</li>}
                  <li>• Local browser data</li>
                </ul>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone!
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                disabled={isClearing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isClearing && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {isClearing ? 'Clearing...' : 'Yes, Clear All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
