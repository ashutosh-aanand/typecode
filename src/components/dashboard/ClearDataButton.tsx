'use client';

import { clearAnalyticsData } from '@/utils/analytics';

interface ClearDataButtonProps {
  usingSupabase?: boolean;
}

export default function ClearDataButton({ usingSupabase = false }: ClearDataButtonProps) {
  const handleClearData = () => {
    const dataSource = usingSupabase ? 'cloud and local' : 'local';
    const message = `Clear all ${dataSource} analytics data? This cannot be undone.`;
    
    if (confirm(message)) {
      clearAnalyticsData();
      
      if (usingSupabase) {
        alert('Note: Cloud data clearing requires manual deletion in Supabase dashboard. Local data has been cleared.');
      }
      
      window.location.reload();
    }
  };

  return (
    <div className="flex justify-end mt-12">
      <button
        onClick={handleClearData}
        className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        title="Clear all analytics data"
      >
        clear all data
      </button>
    </div>
  );
}
