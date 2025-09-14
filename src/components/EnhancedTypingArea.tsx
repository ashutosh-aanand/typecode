'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useTypingStore } from '@/store/typing-store';

interface EnhancedTypingAreaProps {
  disabled?: boolean;
}

export default function EnhancedTypingArea({ disabled = false }: EnhancedTypingAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const { 
    currentSnippet, 
    userInput, 
    isActive, 
    isComplete,
    updateUserInput,
    resetSession
  } = useTypingStore();

  // Auto-focus textarea when component mounts or snippet changes
  useEffect(() => {
    if (textareaRef.current && !disabled && !isComplete) {
      textareaRef.current.focus();
    }
  }, [currentSnippet, disabled, isComplete]);

  // Auto-scroll functionality when moving to new lines
  useEffect(() => {
    if (!containerRef.current || !currentSnippet || !isActive) return;

    const currentLine = userInput.split('\n').length;
    const lineHeight = 24; // matches our line-height in CSS (leading-relaxed)
    
    // Start scrolling when we're past the first 8 lines
    if (currentLine > 8) {
      const scrollPosition = (currentLine - 8) * lineHeight;
      
      // Auto-scroll to keep current line in view
      
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [userInput, currentSnippet, isActive]);

  // Get current line indentation (currently unused but kept for future features)
  // const getCurrentLineIndentation = (text: string, cursorPos: number): string => {
  //   const lines = text.substring(0, cursorPos).split('\n');
  //   const currentLine = lines[lines.length - 1];
  //   const match = currentLine.match(/^(\s*)/);
  //   return match ? match[1] : '';
  // };

  // Check what the expected character should be at current position
  const getExpectedCharAt = (position: number): string => {
    if (!currentSnippet || position >= currentSnippet.code.length) return '';
    return currentSnippet.code[position];
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || isComplete) return;
    
    const value = e.target.value;
    const effectiveKeystrokes = currentSnippet ? countEffectiveKeystrokes(value, currentSnippet.code) : value.length;
    updateUserInput(value, effectiveKeystrokes);
  };

  // Count effective keystrokes (excluding auto-generated indentation)
  const countEffectiveKeystrokes = (input: string, target: string): number => {
    let effectiveCount = 0;
    let i = 0;
    
    while (i < input.length && i < target.length) {
      if (input[i] === target[i]) {
        // This is a correct character
        if (input[i] === '\n') {
          // Count newline as 1 keystroke
          effectiveCount += 1;
          i++;
          
          // Skip auto-generated indentation in both input and target
          while (i < input.length && i < target.length && 
                 input[i] === target[i] && 
                 (input[i] === ' ' || input[i] === '\t')) {
            i++;
          }
        } else {
          // Regular character - count as 1 keystroke
          effectiveCount += 1;
          i++;
        }
      } else {
        // Incorrect character - still count as a keystroke attempt
        effectiveCount += 1;
        i++;
      }
    }
    
    return effectiveCount;
  };

  // Handle key events with smart indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled || isComplete) return;

    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;

    // Prevent cursor movement with arrow keys
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      return;
    }

    // Prevent Home, End, Page Up, Page Down
    if (e.key === 'Home' || e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      return;
    }

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

  // Handle mouse events to prevent cursor repositioning
  const handleMouseDown = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    // Keep focus but don't allow cursor repositioning
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Ensure cursor stays at the end of typed text
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current && !disabled && !isComplete) {
      const textarea = textareaRef.current;
      const expectedPos = userInput.length;
      
      if (textarea.selectionStart !== expectedPos || textarea.selectionEnd !== expectedPos) {
        textarea.selectionStart = expectedPos;
        textarea.selectionEnd = expectedPos;
      }
    }
  }, [userInput, disabled, isComplete]);

  // Monitor selection changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelect = () => handleSelectionChange();
    
    textarea.addEventListener('select', handleSelect);
    textarea.addEventListener('click', handleSelect);
    
    return () => {
      textarea.removeEventListener('select', handleSelect);
      textarea.removeEventListener('click', handleSelect);
    };
  }, [userInput, disabled, isComplete, handleSelectionChange]);

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
          // Incorrect character - always show the expected character with red background
          className = 'text-white bg-red-500 dark:bg-red-600 relative';
          displayChar = char; // Show expected character, not what was typed
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

      // For incorrect characters, add a tooltip showing what was actually typed
      if (index < input.length && input[index] !== char) {
        const typedChar = input[index];
        const typedCharDisplay = typedChar === ' ' ? '␣' : typedChar === '\t' ? '→' : typedChar === '\n' ? '↵' : typedChar;
        
        return (
          <span 
            key={index} 
            className={`${className} group cursor-help`}
            title={`Expected: "${char === ' ' ? '␣' : char === '\t' ? '→' : char === '\n' ? '↵' : char}" | Typed: "${typedCharDisplay}"`}
          >
            {displayChar}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Typed: {typedCharDisplay}
            </span>
          </span>
        );
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
      <div className={`
        px-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden
        ${isActive ? 'max-h-0 py-0 opacity-0' : 'max-h-20 py-3 opacity-100'}
      `}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {currentSnippet.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{currentSnippet.difficulty}</span>
            <span>•</span>
            <span>{currentSnippet.category}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Typing Area */}
      <div 
        ref={containerRef}
        className="relative bg-white dark:bg-gray-900 max-h-[600px] overflow-auto scrollbar-hide"
      >
        {/* Code overlay with character-by-character coloring */}
        <div 
          className={`
            absolute inset-0 p-6 font-mono text-sm leading-relaxed
            pointer-events-none z-10 whitespace-pre-wrap
            ${isComplete ? 'bg-green-50 dark:bg-green-900/10' : ''}
          `}
        >
          {renderOverlayText()}
        </div>

        {/* Content wrapper to ensure proper height for scrolling */}
        <div 
          className="relative"
          style={{
            height: `${Math.max(400, (currentSnippet.code.split('\n').length * 24) + 48)}px`
          }}
        >
          {/* Hidden textarea for input capture */}
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onMouseDown={handleMouseDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || isComplete}
            className={`
              w-full h-full p-6 
              font-mono text-sm leading-relaxed
              border-0 resize-none overflow-hidden
              bg-transparent text-transparent caret-transparent
              focus:outline-none
              ${isComplete ? 'cursor-not-allowed' : 'cursor-text'}
            `}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Focus prompt */}
        {!isFocused && !isComplete && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-[0.5px] z-30">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Click to start typing
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
