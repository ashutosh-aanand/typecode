'use client';

interface ControlsProps {
  onNewSnippet: () => void;
  onReset: () => void;
  isActive: boolean;
  isComplete: boolean;
  disabled?: boolean;
}

export default function Controls({ 
  onNewSnippet, 
  onReset, 
  isActive, 
  isComplete, 
  disabled = false 
}: ControlsProps) {
  return (
    <div className="flex gap-3 justify-center items-center">
      <button
        onClick={onNewSnippet}
        disabled={disabled}
        title="New snippet"
        className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
      </button>

      <button
        onClick={onReset}
        disabled={disabled || (!isActive && !isComplete)}
        title="Reset"
        className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>
  );
}
