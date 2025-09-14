import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Snippet, TypingStore, ProgrammingLanguage } from '@/types';
import multiLanguageSnippets from '@/data/multi-language-snippets.json';
import { calculateTypingMetrics, compareTexts } from '@/utils/metrics';

const initialState = {
  currentSnippet: null,
  selectedLanguage: 'java' as ProgrammingLanguage,
  userInput: '',
  currentPosition: 0,
  isActive: false,
  isComplete: false,
  startTime: null,
  endTime: null,
  correctChars: 0,
  totalChars: 0,
  manuallyTypedChars: 0,
  errors: [],
  metrics: null,
};

export const useTypingStore = create<TypingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Load a random snippet from the current language
      loadRandomSnippet: () => {
        const { selectedLanguage } = get();
        const languageSnippets = multiLanguageSnippets[selectedLanguage] || [];
        
        if (languageSnippets.length === 0) {
          console.warn(`No snippets available for language: ${selectedLanguage}`);
          return;
        }
        
        const randomIndex = Math.floor(Math.random() * languageSnippets.length);
        const snippet = languageSnippets[randomIndex] as Snippet;
        
        set({
          currentSnippet: snippet,
          userInput: '',
          currentPosition: 0,
          isActive: false,
          isComplete: false,
          startTime: null,
          endTime: null,
          correctChars: 0,
          totalChars: 0,
          manuallyTypedChars: 0,
          errors: [],
          metrics: null,
        });
      },

      // Load a specific snippet by ID
      loadSnippetById: (id: string) => {
        const { selectedLanguage } = get();
        const languageSnippets = multiLanguageSnippets[selectedLanguage] || [];
        const snippet = languageSnippets.find(s => s.id === id) as Snippet | undefined;
        
        if (snippet) {
          set({
            currentSnippet: snippet,
            userInput: '',
            currentPosition: 0,
            isActive: false,
            isComplete: false,
            startTime: null,
            endTime: null,
            correctChars: 0,
            totalChars: 0,
            manuallyTypedChars: 0,
            errors: [],
            metrics: null,
          });
        }
      },

      // Set the selected programming language
      setLanguage: (language: ProgrammingLanguage) => {
        set({ selectedLanguage: language });
        // Auto-load a new snippet when language changes
        const { loadRandomSnippet } = get();
        loadRandomSnippet();
      },

      // Update user input and track progress
      updateUserInput: (input: string, manuallyTypedChars?: number) => {
        const state = get();
        const { currentSnippet, startTime, manuallyTypedChars: currentManualChars } = state;
        
        if (!currentSnippet) return;

        // Start session on first keystroke
        const newStartTime = startTime || Date.now();
        const isFirstInput = !startTime;

        // Update manually typed characters count
        const newManualChars = manuallyTypedChars !== undefined ? manuallyTypedChars : currentManualChars;

        // Compare input with target text
        const comparison = compareTexts(input, currentSnippet.code);
        
        // Check if typing is complete
        if (comparison.isComplete) {
          const endTime = Date.now();
          
          // Ensure consistent accuracy calculation
          const totalCharsForAccuracy = newManualChars;
          const correctCharsForAccuracy = Math.min(comparison.correctChars, totalCharsForAccuracy);
          
          const metrics = calculateTypingMetrics(
            newStartTime,
            endTime,
            totalCharsForAccuracy,
            correctCharsForAccuracy,
            comparison.errors.length
          );

          set({
            userInput: input,
            startTime: newStartTime,
            endTime,
            isActive: false,
            isComplete: true,
            correctChars: comparison.correctChars,
            totalChars: comparison.totalChars,
            manuallyTypedChars: newManualChars,
            errors: comparison.errors,
            metrics,
          });
        } else {
          set({
            userInput: input,
            startTime: newStartTime,
            isActive: isFirstInput ? true : state.isActive,
            correctChars: comparison.correctChars,
            totalChars: comparison.totalChars,
            manuallyTypedChars: newManualChars,
            errors: comparison.errors,
            currentPosition: input.length,
          });
        }
      },

      // Start a new typing session
      startSession: () => {
        set({
          startTime: Date.now(),
          isActive: true,
          isComplete: false,
          userInput: '',
          correctChars: 0,
          totalChars: 0,
          errors: [],
          metrics: null,
        });
      },

      // End the current session
      endSession: () => {
        const state = get();
        if (state.startTime && !state.isComplete) {
          const endTime = Date.now();
          const metrics = calculateTypingMetrics(
            state.startTime,
            endTime,
            state.totalChars,
            state.correctChars,
            state.errors.length
          );

          set({
            endTime,
            isActive: false,
            isComplete: true,
            metrics,
          });
        }
      },

      // Reset the current session
      resetSession: () => {
        set({
          userInput: '',
          currentPosition: 0,
          isActive: false,
          isComplete: false,
          startTime: null,
          endTime: null,
          correctChars: 0,
          totalChars: 0,
          manuallyTypedChars: 0,
          errors: [],
          metrics: null,
        });
      },

      // Calculate current metrics (for real-time display)
      calculateMetrics: () => {
        const state = get();
        if (!state.startTime) {
          return {
            timeInSeconds: 0,
            accuracy: 0,
            wpm: 0,
            cpm: 0,
            totalCharacters: 0,
            correctCharacters: 0,
            errorCount: 0,
          };
        }

        const currentTime = state.endTime || Date.now();
        
        // Ensure accuracy calculation uses consistent values
        // If we're tracking manually typed chars, use that for both total and correct
        const totalCharsForAccuracy = state.manuallyTypedChars || state.totalChars;
        const correctCharsForAccuracy = Math.min(state.correctChars, totalCharsForAccuracy);
        
        return calculateTypingMetrics(
          state.startTime,
          currentTime,
          totalCharsForAccuracy,
          correctCharsForAccuracy,
          state.errors.length
        );
      },
    }),
    {
      name: 'typing-store',
    }
  )
);
