import React, { useMemo } from 'react';
import { TypingSession } from '@/types/analytics';

interface ActivityHeatmapProps {
    sessions: TypingSession[];
}

export default function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
    // Generate the last 365 days of data
    const heatmapData = useMemo(() => {
        const today = new Date();
        const map: Record<string, number> = {};

        // Initialize map with session counts
        sessions.forEach(session => {
            const date = new Date(session.timestamp).toISOString().split('T')[0];
            map[date] = (map[date] || 0) + 1;
        });

        const weeks = [];
        let currentWeek: { date: string; count: number; level: number }[] = [];

        // Start from 365 days ago
        for (let i = 365; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = map[dateStr] || 0;

            // Determine intensity level (0-4)
            let level = 0;
            if (count > 0) level = 1;
            if (count >= 3) level = 2;
            if (count >= 6) level = 3;
            if (count >= 10) level = 4;

            const dayData = { date: dateStr, count, level };

            // Add to current week
            currentWeek.push(dayData);

            // If Sunday or last day, push week and start new
            if (d.getDay() === 0 || i === 0) { // 0 is Sunday
                if (currentWeek.length > 0) {
                    // Fill partial first week if needed (visual alignment)
                    while (currentWeek.length < 7 && weeks.length === 0) {
                        currentWeek.unshift({ date: '', count: 0, level: -1 }); // Spacer
                    }
                    weeks.push(currentWeek);
                }
                currentWeek = [];
            }
        }
        return weeks;
    }, [sessions]);

    // Helper for color classes
    const getColorClass = (level: number) => {
        switch (level) {
            case -1: return 'bg-transparent'; // Spacer
            case 0: return 'bg-gray-200 dark:bg-gray-800';
            case 1: return 'bg-green-200 dark:bg-green-900/40';
            case 2: return 'bg-green-300 dark:bg-green-700/60';
            case 3: return 'bg-green-400 dark:bg-green-600/80';
            case 4: return 'bg-green-500 dark:bg-green-500';
            default: return 'bg-gray-200 dark:bg-gray-800';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activity History
            </h3>

            <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-1 min-w-full">
                    {heatmapData.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((day, dIndex) => (
                                day.level === -1 ? (
                                    <div key={`spacer-${dIndex}`} className="w-3 h-3" />
                                ) : (
                                    <div
                                        key={day.date}
                                        className={`w-3 h-3 rounded-sm ${getColorClass(day.level)} transition-colors duration-200 relative group cursor-default`}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {day.count} sessions on {day.date}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Less</span>
                <div className={`w-3 h-3 rounded-sm ${getColorClass(0)}`}></div>
                <div className={`w-3 h-3 rounded-sm ${getColorClass(1)}`}></div>
                <div className={`w-3 h-3 rounded-sm ${getColorClass(2)}`}></div>
                <div className={`w-3 h-3 rounded-sm ${getColorClass(3)}`}></div>
                <div className={`w-3 h-3 rounded-sm ${getColorClass(4)}`}></div>
                <span>More</span>
            </div>
        </div>
    );
}
