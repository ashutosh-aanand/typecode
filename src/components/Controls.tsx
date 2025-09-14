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
    <div className="flex gap-4 justify-center items-center">
      <button
        onClick={onNewSnippet}
        disabled={disabled}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
      >
        new snippet
      </button>

      <button
        onClick={onReset}
        disabled={disabled || (!isActive && !isComplete)}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
      >
        reset
      </button>
    </div>
  );
}
