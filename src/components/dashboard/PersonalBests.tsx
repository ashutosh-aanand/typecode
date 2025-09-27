'use client';

interface PersonalBestsProps {
  bestCpm: number;
  bestAccuracy: number;
  completionRate: number;
  currentStreak: number;
}

export default function PersonalBests({ 
  bestCpm, 
  bestAccuracy, 
  completionRate, 
  currentStreak 
}: PersonalBestsProps) {
  const getPerformanceColor = (value: number, type: 'cpm' | 'accuracy') => {
    if (type === 'cpm') {
      if (value >= 300) return 'text-gray-700 dark:text-gray-300';
      if (value >= 200) return 'text-gray-700 dark:text-gray-300';
      if (value >= 125) return 'text-gray-600 dark:text-gray-400';
      return 'text-gray-500 dark:text-gray-500';
    } else {
      if (value >= 95) return 'text-gray-700 dark:text-gray-300';
      if (value >= 90) return 'text-gray-700 dark:text-gray-300';
      if (value >= 80) return 'text-gray-600 dark:text-gray-400';
      return 'text-gray-500 dark:text-gray-500';
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        personal bests
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">best cpm</span>
          <span className={`font-mono ${getPerformanceColor(bestCpm, 'cpm')}`}>
            {Math.round(bestCpm)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">best accuracy</span>
          <span className={`font-mono ${getPerformanceColor(bestAccuracy, 'accuracy')}`}>
            {bestAccuracy.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">completion rate</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {completionRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">current streak</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {currentStreak}d
          </span>
        </div>
      </div>
    </div>
  );
}
