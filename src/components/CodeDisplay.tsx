'use client';

import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeDisplayProps {
  code: string;
  language?: string;
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function CodeDisplay({ 
  code, 
  language = 'java', 
  title, 
  difficulty, 
  category 
}: CodeDisplayProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <div className="w-full">
      {/* Header with snippet info */}
      {(title || difficulty || category) && (
        <div className="bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {category && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                  {category}
                </span>
              )}
            </div>
            {difficulty && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[difficulty]}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Code block */}
      <div className="relative">
        <pre className={`
          language-${language} 
          !bg-gray-900 
          !text-gray-100 
          !m-0 
          !p-4 
          !rounded-b-lg 
          ${title ? '' : '!rounded-lg'}
          !border 
          !border-gray-700 
          !overflow-x-auto
          !text-sm
          !leading-relaxed
        `}>
          <code 
            ref={codeRef} 
            className={`language-${language}`}
          >
            {code}
          </code>
        </pre>

        {/* Copy button */}
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded transition-colors"
          title="Copy code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
