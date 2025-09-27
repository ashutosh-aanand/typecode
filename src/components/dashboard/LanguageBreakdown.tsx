'use client';

interface LanguageStats {
  sessions: number;
  averageCpm: number;
  averageAccuracy: number;
}

interface LanguageBreakdownProps {
  languageStats: Record<string, LanguageStats>;
}

export default function LanguageBreakdown({ languageStats }: LanguageBreakdownProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        languages
      </h2>
      <div className="space-y-4">
        {Object.entries(languageStats)
          .sort(([,a], [,b]) => b.sessions - a.sessions)
          .map(([language, stats]) => (
            <div key={language} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-900 dark:text-gray-100 font-mono">
                  {language === 'cpp' ? 'c++' : language === 'javascript' ? 'js' : language}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.sessions}
                </span>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {Math.round(stats.averageCpm)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.averageAccuracy.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
