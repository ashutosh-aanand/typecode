'use client';

import { clearAnalyticsData } from '@/utils/analytics';

export default function ClearDataButton() {
  const handleClearData = () => {
    if (confirm('Clear all analytics data? This cannot be undone.')) {
      clearAnalyticsData();
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
