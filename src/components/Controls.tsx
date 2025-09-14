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
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={onNewSnippet}
        disabled={disabled}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        New Snippet
      </button>

      <button
        onClick={onReset}
        disabled={disabled || (!isActive && !isComplete)}
        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Reset
      </button>

      {/* Status indicator */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className={`w-2 h-2 rounded-full ${
          isComplete ? 'bg-green-500' : 
          isActive ? 'bg-yellow-500' : 
          'bg-gray-400'
        }`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isComplete ? 'Complete' : isActive ? 'Typing...' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
