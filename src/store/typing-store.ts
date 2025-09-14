import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Snippet, TypingStore } from '@/types';
import snippetsData from '@/data/snippets.json';
import { calculateTypingMetrics, compareTexts } from '@/utils/metrics';

const initialState = {
  currentSnippet: null,
  userInput: '',
  currentPosition: 0,
  isActive: false,
  isComplete: false,
  startTime: null,
  endTime: null,
  correctChars: 0,
  totalChars: 0,
  errors: [],
  metrics: null,
};

export const useTypingStore = create<TypingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Load a random snippet from the JSON data
      loadRandomSnippet: () => {
        const snippets = snippetsData.snippets;
        const randomIndex = Math.floor(Math.random() * snippets.length);
        const snippet = snippets[randomIndex] as Snippet;
        
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
          errors: [],
          metrics: null,
        });
      },

      // Load a specific snippet by ID
      loadSnippetById: (id: string) => {
        const snippets = snippetsData.snippets;
        const snippet = snippets.find(s => s.id === id) as Snippet | undefined;
        
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
            errors: [],
            metrics: null,
          });
        }
      },

      // Update user input and track progress
      updateUserInput: (input: string) => {
        const state = get();
        const { currentSnippet, startTime } = state;
        
        if (!currentSnippet) return;

        // Start session on first keystroke
        const newStartTime = startTime || Date.now();
        const isFirstInput = !startTime;

        // Compare input with target text
        const comparison = compareTexts(input, currentSnippet.code);
        
        // Check if typing is complete
        if (comparison.isComplete) {
          const endTime = Date.now();
          const metrics = calculateTypingMetrics(
            newStartTime,
            endTime,
            comparison.totalChars,
            comparison.correctChars,
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
            totalCharacters: 0,
            correctCharacters: 0,
            errorCount: 0,
          };
        }

        const currentTime = state.endTime || Date.now();
        return calculateTypingMetrics(
          state.startTime,
          currentTime,
          state.totalChars,
          state.correctChars,
          state.errors.length
        );
      },
    }),
    {
      name: 'typing-store',
    }
  )
);
