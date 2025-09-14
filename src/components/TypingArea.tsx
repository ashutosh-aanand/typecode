'use client';

import { useRef, useEffect, useState } from 'react';
import { useTypingStore } from '@/store/typing-store';

interface TypingAreaProps {
  disabled?: boolean;
}

export default function TypingArea({ disabled = false }: TypingAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const { 
    currentSnippet, 
    userInput, 
    isActive, 
    isComplete,
    errors,
    updateUserInput,
    resetSession
  } = useTypingStore();

  // Auto-focus textarea when component mounts or snippet changes
  useEffect(() => {
    if (textareaRef.current && !disabled && !isComplete) {
      textareaRef.current.focus();
    }
  }, [currentSnippet, disabled, isComplete]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || isComplete) return;
    
    const value = e.target.value;
    updateUserInput(value);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled || isComplete) return;

    // Prevent certain keys that might interfere with typing practice
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Allow Ctrl+A for select all, Ctrl+R for reset
    if (e.ctrlKey) {
      if (e.key === 'r') {
        e.preventDefault();
        resetSession();
        return;
      }
      if (e.key === 'a') {
        // Allow select all
        return;
      }
      // Prevent other Ctrl combinations
      e.preventDefault();
      return;
    }
  };

  // Handle paste events (prevent pasting)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  if (!currentSnippet) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Instructions */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isComplete ? (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✅ Completed! Great job typing the {currentSnippet.title} algorithm.
            </span>
          ) : isActive ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              ⌨️ Keep typing... Match the code exactly including spaces and formatting.
            </span>
          ) : (
            <span>
              👆 Click in the text area below and start typing to begin. Match the code exactly.
            </span>
          )}
        </p>
      </div>

      {/* Typing Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled || isComplete}
          placeholder={isComplete ? "Session complete!" : "Start typing the code above..."}
          className={`
            w-full h-64 p-4 
            font-mono text-sm leading-relaxed
            border-2 rounded-lg resize-none
            transition-colors duration-200
            ${isFocused 
              ? 'border-blue-500 dark:border-blue-400' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${isComplete 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
              : 'bg-white dark:bg-gray-800'
            }
            ${disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            }
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
          `}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Character count and progress */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">
          {userInput.length} / {currentSnippet.code.length}
          {errors.length > 0 && (
            <span className="ml-2 text-red-500">
              • {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Focus indicator */}
        {!isFocused && !isComplete && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg pointer-events-none">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click here to start typing
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        <span>Shortcuts: </span>
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+R</kbd>
        <span> to reset • </span>
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+A</kbd>
        <span> to select all</span>
      </div>
    </div>
  );
}
