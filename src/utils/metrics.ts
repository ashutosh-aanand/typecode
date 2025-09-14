import { TypingMetrics } from '@/types';

/**
 * Calculate typing metrics based on session data
 */
export const calculateTypingMetrics = (
  startTime: number,
  endTime: number,
  totalChars: number,
  correctChars: number,
  errorCount: number = 0
): TypingMetrics => {
  const timeInSeconds = (endTime - startTime) / 1000;
  // Ensure accuracy never exceeds 100% by capping correctChars at totalChars
  const cappedCorrectChars = Math.min(correctChars, totalChars);
  const accuracy = totalChars > 0 ? (cappedCorrectChars / totalChars) * 100 : 0;
  
  const minutes = timeInSeconds / 60;
  
  // WPM calculation: (characters / 5) / minutes
  // Standard formula where 5 characters = 1 word
  const wpm = minutes > 0 ? (cappedCorrectChars / 5) / minutes : 0;
  
  // CPM calculation: characters / minutes
  // More accurate for code typing with symbols and varied character types
  const cpm = minutes > 0 ? cappedCorrectChars / minutes : 0;

  return {
    timeInSeconds: Math.round(timeInSeconds * 100) / 100, // Round to 2 decimal places
    accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
    wpm: Math.round(wpm),
    cpm: Math.round(cpm),
    totalCharacters: totalChars,
    correctCharacters: cappedCorrectChars,
    errorCount
  };
};

/**
 * Compare user input with target text character by character
 */
export const compareTexts = (userInput: string, targetText: string) => {
  const results = {
    correctChars: 0,
    totalChars: userInput.length,
    errors: [] as number[],
    isComplete: false
  };

  for (let i = 0; i < userInput.length; i++) {
    if (i < targetText.length && userInput[i] === targetText[i]) {
      results.correctChars++;
    } else {
      results.errors.push(i);
    }
  }

  // Check if typing is complete and accurate
  results.isComplete = userInput.length === targetText.length && results.errors.length === 0;

  return results;
};

/**
 * Format time in a human-readable format
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

/**
 * Get performance rating based on WPM
 */
export const getPerformanceRating = (wpm: number): string => {
  if (wpm >= 60) return 'Excellent';
  if (wpm >= 40) return 'Good';
  if (wpm >= 25) return 'Average';
  if (wpm >= 15) return 'Below Average';
  return 'Beginner';
};

/**
 * Get performance rating based on CPM (more accurate for code)
 */
export const getCpmPerformanceRating = (cpm: number): string => {
  if (cpm >= 300) return 'Excellent';
  if (cpm >= 200) return 'Good';
  if (cpm >= 125) return 'Average';
  if (cpm >= 75) return 'Below Average';
  return 'Beginner';
};

/**
 * Get accuracy rating based on percentage
 */
export const getAccuracyRating = (accuracy: number): string => {
  if (accuracy >= 95) return 'Perfect';
  if (accuracy >= 90) return 'Excellent';
  if (accuracy >= 80) return 'Good';
  if (accuracy >= 70) return 'Fair';
  return 'Needs Improvement';
};
