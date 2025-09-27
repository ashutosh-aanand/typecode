'use client';

import { TypingSession } from '@/types/analytics';

interface RecentSessionsProps {
  sessions: TypingSession[];
}

export default function RecentSessions({ sessions }: RecentSessionsProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

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
        recent sessions
      </h2>
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          no sessions yet
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-[60px]">
                  {formatDate(session.timestamp)}
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-mono min-w-[40px]">
                  {session.language === 'cpp' ? 'c++' : session.language === 'javascript' ? 'js' : session.language}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                  {session.snippetTitle}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-mono ${getPerformanceColor(session.cpm, 'cpm')}`}>
                  {Math.round(session.cpm)}
                </span>
                <span className={`text-sm font-mono ${getPerformanceColor(session.accuracy, 'accuracy')}`}>
                  {session.accuracy.toFixed(1)}%
                </span>
                <span className={`text-xs ${session.completed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                  {session.completed ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
