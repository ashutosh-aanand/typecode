'use client';

import { useRef, useEffect, useState } from 'react';
import { useTypingStore } from '@/store/typing-store';

interface EnhancedTypingAreaProps {
  disabled?: boolean;
}

export default function EnhancedTypingArea({ disabled = false }: EnhancedTypingAreaProps) {
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

  // Get current line indentation
  const getCurrentLineIndentation = (text: string, cursorPos: number): string => {
    const lines = text.substring(0, cursorPos).split('\n');
    const currentLine = lines[lines.length - 1];
    const match = currentLine.match(/^(\s*)/);
    return match ? match[1] : '';
  };

  // Check what the expected character should be at current position
  const getExpectedCharAt = (position: number): string => {
    if (!currentSnippet || position >= currentSnippet.code.length) return '';
    return currentSnippet.code[position];
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || isComplete) return;
    
    const value = e.target.value;
    updateUserInput(value);
  };

  // Handle key events with smart indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled || isComplete) return;

    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;

    // Handle Enter key for auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check what the expected next characters should be
      const expectedChar = getExpectedCharAt(cursorPos);
      
      if (expectedChar === '\n') {
        // The snippet expects a newline here, so add it
        const nextExpectedChar = getExpectedCharAt(cursorPos + 1);
        let indentToAdd = '';
        
        // If the next expected character is whitespace, extract the indentation
        if (nextExpectedChar === ' ' || nextExpectedChar === '\t') {
          let pos = cursorPos + 1;
          while (pos < currentSnippet!.code.length && 
                 (currentSnippet!.code[pos] === ' ' || currentSnippet!.code[pos] === '\t')) {
            indentToAdd += currentSnippet!.code[pos];
            pos++;
          }
        }
        
        const newValue = value.substring(0, cursorPos) + '\n' + indentToAdd + value.substring(cursorPos);
        updateUserInput(newValue);
        
        // Set cursor position after the indentation
        setTimeout(() => {
          if (textarea) {
            textarea.selectionStart = textarea.selectionEnd = cursorPos + 1 + indentToAdd.length;
          }
        }, 0);
      }
      
      return;
    }

    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      
      // Check if the snippet expects tab/spaces at current position
      const expectedChar = getExpectedCharAt(cursorPos);
      
      if (expectedChar === '\t') {
        // Snippet expects a tab
        const newValue = value.substring(0, cursorPos) + '\t' + value.substring(cursorPos);
        updateUserInput(newValue);
        
        setTimeout(() => {
          if (textarea) {
            textarea.selectionStart = textarea.selectionEnd = cursorPos + 1;
          }
        }, 0);
      } else if (expectedChar === ' ') {
        // Check how many spaces the snippet expects
        let spacesToAdd = '';
        let pos = cursorPos;
        while (pos < currentSnippet!.code.length && currentSnippet!.code[pos] === ' ') {
          spacesToAdd += ' ';
          pos++;
        }
        
        if (spacesToAdd) {
          const newValue = value.substring(0, cursorPos) + spacesToAdd + value.substring(cursorPos);
          updateUserInput(newValue);
          
          setTimeout(() => {
            if (textarea) {
              textarea.selectionStart = textarea.selectionEnd = cursorPos + spacesToAdd.length;
            }
          }, 0);
        }
      }
      
      return;
    }

    // Handle Ctrl shortcuts
    if (e.ctrlKey) {
      if (e.key === 'r') {
        e.preventDefault();
        resetSession();
        return;
      }
      if (e.key === 'a') {
        return;
      }
      e.preventDefault();
      return;
    }
  };

  // Handle paste events (prevent pasting)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  // Render character by character with different states
  const renderOverlayText = () => {
    if (!currentSnippet) return null;

    const code = currentSnippet.code;
    const input = userInput;
    
    return code.split('').map((char, index) => {
      let className = '';
      let displayChar = char;

      if (index < input.length) {
        // Character has been typed
        if (input[index] === char) {
          // Correct character
          className = 'text-gray-900 dark:text-gray-100 bg-green-100 dark:bg-green-900/30';
        } else {
          // Incorrect character
          className = 'text-white bg-red-500 dark:bg-red-600';
          displayChar = input[index];
        }
      } else if (index === input.length) {
        // Current cursor position
        className = 'text-gray-900 dark:text-gray-100 bg-blue-200 dark:bg-blue-800/50 animate-pulse';
      } else {
        // Not yet typed - dark/faded
        className = 'text-gray-400 dark:text-gray-600';
      }

      // Handle special characters for display
      if (char === ' ') {
        displayChar = ' ';
      } else if (char === '\n') {
        return <br key={index} />;
      } else if (char === '\t') {
        displayChar = '\u00A0\u00A0\u00A0\u00A0'; // 4 non-breaking spaces
      }

      return (
        <span key={index} className={className}>
          {displayChar}
        </span>
      );
    });
  };

  if (!currentSnippet) {
    return (
      <div className="w-full">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentSnippet.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              currentSnippet.difficulty === 'easy' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : currentSnippet.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {currentSnippet.difficulty.charAt(0).toUpperCase() + currentSnippet.difficulty.slice(1)}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
              {currentSnippet.category}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Typing Area */}
      <div className="relative">
        {/* Code overlay with character-by-character coloring */}
        <div 
          className={`
            absolute inset-0 p-4 font-mono text-sm leading-relaxed
            pointer-events-none z-10 whitespace-pre-wrap
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700 rounded-b-lg
            ${isFocused ? 'border-blue-500 dark:border-blue-400' : ''}
            ${isComplete ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' : ''}
          `}
        >
          {renderOverlayText()}
        </div>

        {/* Hidden textarea for input capture */}
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled || isComplete}
          className={`
            w-full h-64 p-4 
            font-mono text-sm leading-relaxed
            border border-gray-200 dark:border-gray-700 rounded-b-lg resize-none
            bg-transparent text-transparent caret-transparent
            focus:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400
            ${isComplete ? 'cursor-not-allowed' : 'cursor-text'}
          `}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Progress indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm z-20">
          {userInput.length} / {currentSnippet.code.length}
          {errors.length > 0 && (
            <span className="ml-2 text-red-500">
              • {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Focus prompt */}
        {!isFocused && !isComplete && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-b-lg z-30">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click here to start typing
              </p>
            </div>
          </div>
        )}

        {/* Completion overlay */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-50/90 dark:bg-green-900/20 rounded-b-lg z-30">
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg border border-green-200 dark:border-green-700 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">
                Completed!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Great job typing the {currentSnippet.title} algorithm
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        <span>Features: Smart indentation • </span>
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>
        <span> auto-indent • </span>
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Tab</kbd>
        <span> smart-tab • </span>
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+R</kbd>
        <span> reset</span>
      </div>
    </div>
  );
}
