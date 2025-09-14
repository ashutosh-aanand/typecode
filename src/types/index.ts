// Core types for xtype application

export interface Snippet {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  code: string;
  category: string;
  description?: string;
}

export interface TypingMetrics {
  timeInSeconds: number;
  accuracy: number; // percentage (0-100)
  wpm: number; // words per minute
  totalCharacters: number;
  correctCharacters: number;
  errorCount: number;
}

export interface TypingState {
  // Current snippet being typed
  currentSnippet: Snippet | null;
  
  // User input and tracking
  userInput: string;
  currentPosition: number;
  
  // Session state
  isActive: boolean;
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
  
  // Real-time metrics
  correctChars: number;
  totalChars: number;
  errors: number[];
  
  // Final results
  metrics: TypingMetrics | null;
}

export interface TypingStore extends TypingState {
  // Actions
  loadRandomSnippet: () => void;
  loadSnippetById: (id: string) => void;
  updateUserInput: (input: string) => void;
  startSession: () => void;
  endSession: () => void;
  resetSession: () => void;
  calculateMetrics: () => TypingMetrics;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SnippetCategory = 'sorting' | 'searching' | 'recursion' | 'trees' | 'graphs' | 'arrays' | 'strings' | 'dynamic-programming';
