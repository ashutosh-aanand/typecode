'use client';

interface StatsOverviewProps {
  totalSessions: number;
  averageCpm: number;
  averageAccuracy: number;
  totalTimeSeconds: number;
}

export default function StatsOverview({ 
  totalSessions, 
  averageCpm, 
  averageAccuracy, 
  totalTimeSeconds 
}: StatsOverviewProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
          {totalSessions}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">sessions</div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {Math.round(averageCpm)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">avg cpm</div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
          {averageAccuracy.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">accuracy</div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
          {formatTime(totalTimeSeconds)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">practiced</div>
      </div>
    </div>
  );
}
