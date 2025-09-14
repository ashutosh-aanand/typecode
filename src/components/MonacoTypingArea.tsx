'use client';

import { useRef, useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { useTypingStore } from '@/store/typing-store';

interface MonacoTypingAreaProps {
  disabled?: boolean;
}

export default function MonacoTypingArea({ disabled = false }: MonacoTypingAreaProps) {
  const editorRef = useRef<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [decorations, setDecorations] = useState<string[]>([]);
  
  const { 
    currentSnippet, 
    userInput, 
    isActive, 
    isComplete,
    errors,
    updateUserInput,
    resetSession
  } = useTypingStore();

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor for Java
    monaco.languages.setLanguageConfiguration('java', {
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      indentationRules: {
        increaseIndentPattern: /^.*\{[^}"']*$/,
        decreaseIndentPattern: /^.*\}.*$/
      }
    });

    // Focus editor
    if (!disabled && !isComplete) {
      editor.focus();
    }

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      resetSession();
    });

    // Prevent paste
    editor.onKeyDown((e: any) => {
      if (e.ctrlKey && (e.keyCode === monaco.KeyCode.KeyV)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  };

  // Handle editor content change
  const handleEditorChange = (value: string | undefined) => {
    if (disabled || isComplete) return;
    
    // Only update if the change is from user typing, not from our setValue
    const newValue = value || '';
    if (newValue !== userInput) {
      updateUserInput(newValue);
    }
  };

  // Update decorations based on typing progress
  useEffect(() => {
    if (!editorRef.current || !currentSnippet) return;

    const editor = editorRef.current;
    const monaco = editor.getModel()?.getModeId ? window.monaco : null;
    if (!monaco) return;

    const code = currentSnippet.code;
    const input = userInput;
    const newDecorations: any[] = [];

    // Create decorations for each character
    let line = 1;
    let column = 1;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      
      if (char === '\n') {
        line++;
        column = 1;
        continue;
      }

      let className = '';
      
      if (i < input.length) {
        if (input[i] === char) {
          // Correct character
          className = 'monaco-correct-char';
        } else {
          // Incorrect character
          className = 'monaco-incorrect-char';
        }
      } else if (i === input.length) {
        // Current cursor position
        className = 'monaco-cursor-char';
      } else {
        // Not yet typed
        className = 'monaco-pending-char';
      }

      if (className) {
        newDecorations.push({
          range: new monaco.Range(line, column, line, column + 1),
          options: {
            inlineClassName: className
          }
        });
      }

      column++;
    }

    // Apply decorations
    const decorationIds = editor.deltaDecorations(decorations, newDecorations);
    setDecorations(decorationIds);
  }, [userInput, currentSnippet, decorations]);

  // Auto-focus when snippet changes
  useEffect(() => {
    if (editorRef.current && !disabled && !isComplete) {
      editorRef.current.focus();
    }
  }, [currentSnippet, disabled, isComplete]);

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

      {/* Monaco Editor */}
      <div className="relative border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
        <Editor
          height="300px"
          language="java"
          value={userInput}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderWhitespace: 'selection',
            automaticLayout: true,
            wordWrap: 'off',
            contextmenu: false,
            selectOnLineNumbers: false,
            roundedSelection: false,
            cursorStyle: 'line',
            cursorBlinking: 'blink',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: false,
            trimAutoWhitespace: true,
            acceptSuggestionOnEnter: 'off',
            acceptSuggestionOnCommitCharacter: false,
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            wordBasedSuggestions: 'off',
            parameterHints: { enabled: false },
            hover: { enabled: false },
            links: false,
            colorDecorators: false,
            codeLens: false,
            lightbulb: { enabled: false },
            find: { addExtraSpaceOnTop: false },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
          theme="vs-dark"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Progress indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-black/80 text-white px-2 py-1 rounded z-10">
          {userInput.length} / {currentSnippet.code.length}
          {errors.length > 0 && (
            <span className="ml-2 text-red-400">
              • {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Completion overlay */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 z-20">
            <div className="bg-black/90 text-white px-6 py-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-lg font-semibold text-green-400 mb-1">
                Completed!
              </p>
              <p className="text-sm text-gray-300">
                Great job typing the {currentSnippet.title} algorithm
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for character highlighting */}
      <style jsx global>{`
        .monaco-correct-char {
          background-color: rgba(34, 197, 94, 0.3) !important;
          color: #059669 !important;
        }
        .monaco-incorrect-char {
          background-color: rgba(239, 68, 68, 0.8) !important;
          color: white !important;
        }
        .monaco-cursor-char {
          background-color: rgba(59, 130, 246, 0.5) !important;
          animation: pulse 1s infinite;
        }
        .monaco-pending-char {
          color: rgba(156, 163, 175, 0.6) !important;
        }
      `}</style>

      {/* Keyboard shortcuts */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        <span>Features: </span>
        <span>Auto-indentation • Bracket matching • </span>
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+R</kbd>
        <span> reset</span>
      </div>
    </div>
  );
}
