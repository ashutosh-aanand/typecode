'use client';

import { useRef, useEffect, useState } from 'react';
import { useTypingStore } from '@/store/typing-store';

interface OverlayTypingAreaProps {
  disabled?: boolean;
}

export default function OverlayTypingArea({ disabled = false }: OverlayTypingAreaProps) {
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

  // Get current line indentation
  const getCurrentLineIndentation = (text: string, cursorPos: number): string => {
    const lines = text.substring(0, cursorPos).split('\n');
    const currentLine = lines[lines.length - 1];
    const match = currentLine.match(/^(\s*)/);
    return match ? match[1] : '';
  };


  // Handle key events with code-friendly features
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled || isComplete) return;

    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;

    // Handle Enter key for auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentIndentation = getCurrentLineIndentation(value, cursorPos);
      const charBeforeCursor = value[cursorPos - 1];
      const charAfterCursor = value[cursorPos];
      
      let newValue = value;
      let newCursorPos = cursorPos;
      
      // Check if we're between opening and closing brackets
      const isBetweenBrackets = 
        (charBeforeCursor === '{' && charAfterCursor === '}') ||
        (charBeforeCursor === '(' && charAfterCursor === ')') ||
        (charBeforeCursor === '[' && charAfterCursor === ']');
      
      if (isBetweenBrackets) {
        // Add extra indentation for the cursor line and maintain indentation for closing bracket
        const extraIndent = '    '; // 4 spaces
        newValue = 
          value.substring(0, cursorPos) + 
          '\n' + currentIndentation + extraIndent + 
          '\n' + currentIndentation + 
          value.substring(cursorPos);
        newCursorPos = cursorPos + 1 + currentIndentation.length + extraIndent.length;
      } else {
        // Regular auto-indentation
        let indentation = currentIndentation;
        
        // Add extra indentation after opening brackets
        if (charBeforeCursor === '{' || charBeforeCursor === '(' || charBeforeCursor === '[') {
          indentation += '    '; // 4 spaces
        }
        
        newValue = 
          value.substring(0, cursorPos) + 
          '\n' + indentation + 
          value.substring(cursorPos);
        newCursorPos = cursorPos + 1 + indentation.length;
      }
      
      updateUserInput(newValue);
      
      // Set cursor position after state update
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }
      }, 0);
      
      return;
    }

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const indent = '    '; // 4 spaces
      const newValue = 
        value.substring(0, cursorPos) + 
        indent + 
        value.substring(cursorPos);
      
      updateUserInput(newValue);
      
      // Set cursor position after indentation
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = cursorPos + indent.length;
        }
      }, 0);
      
      return;
    }

    // Handle Backspace for smart indentation deletion
    if (e.key === 'Backspace') {
      const charBefore = value[cursorPos - 1];
      
      // Smart indentation deletion (delete 4 spaces at once if at beginning of line)
      if (charBefore === ' ') {
        const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
        const beforeCursor = value.substring(lineStart, cursorPos);
        
        if (beforeCursor.match(/^    $/)) { // Exactly 4 spaces
          e.preventDefault();
          const newValue = 
            value.substring(0, cursorPos - 4) + 
            value.substring(cursorPos);
          updateUserInput(newValue);
          
          setTimeout(() => {
            if (textarea) {
              textarea.selectionStart = textarea.selectionEnd = cursorPos - 4;
            }
          }, 0);
          return;
        }
      }
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
      // Allow other Ctrl shortcuts like Ctrl+Z, Ctrl+Y for undo/redo
      if (e.key === 'z' || e.key === 'y') {
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

      {/* Overlay Typing Area */}
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

      {/* Keyboard shortcuts and features */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <div>
          <span>Shortcuts: </span>
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+R</kbd>
          <span> reset • </span>
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Tab</kbd>
          <span> indent • </span>
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>
          <span> maintain indentation</span>
        </div>
        <div>
          <span>✨ Features: Smart indentation • Smart backspace (4 spaces)</span>
        </div>
      </div>
    </div>
  );
}
