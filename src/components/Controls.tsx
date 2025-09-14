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
        className="p-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8"/>
          <path d="M4 20 21 3"/>
          <polyline points="21 16 21 21 16 21"/>
          <path d="M15 15 21 21"/>
          <path d="M4 4 9 9"/>
        </svg>
      </button>

      <button
        onClick={onReset}
        disabled={disabled || (!isActive && !isComplete)}
        title="Reset"
        className="p-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
    </div>
  );
}
