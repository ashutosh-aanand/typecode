'use client';

interface TimeframeSelectorProps {
  selectedTimeframe: '1d' | '7d' | '30d' | '6m' | 'all';
  onTimeframeChange: (timeframe: '1d' | '7d' | '30d' | '6m' | 'all') => void;
}

export default function TimeframeSelector({ selectedTimeframe, onTimeframeChange }: TimeframeSelectorProps) {
  const timeframes: ('1d' | '7d' | '30d' | '6m' | 'all')[] = ['1d', '7d', '30d', '6m', 'all'];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-6">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => onTimeframeChange(timeframe)}
            className={`text-sm transition-colors ${
              selectedTimeframe === timeframe
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
          >
            {timeframe}
          </button>
        ))}
      </div>
    </div>
  );
}
