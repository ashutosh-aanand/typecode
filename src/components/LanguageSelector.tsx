'use client';

import { ProgrammingLanguage } from '@/types';
import { useTypingStore } from '@/store/typing-store';

const languages: { value: ProgrammingLanguage; label: string; icon: string }[] = [
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
];

export default function LanguageSelector() {
  const { selectedLanguage, setLanguage, isActive } = useTypingStore();

  const handleLanguageChange = (language: ProgrammingLanguage) => {
    if (!isActive) {
      setLanguage(language);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        Language:
      </span>
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.value}
            onClick={() => handleLanguageChange(lang.value)}
            disabled={isActive}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
              flex items-center gap-1.5 min-w-[80px] justify-center
              ${
                selectedLanguage === lang.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
              ${
                isActive
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:scale-105'
              }
            `}
            title={`Switch to ${lang.label}`}
          >
            <span className="text-base">{lang.icon}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
