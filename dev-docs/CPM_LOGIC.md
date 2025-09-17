# CPM (Characters Per Minute) Logic Documentation

## Overview

xtype uses CPM (Characters Per Minute) instead of WPM (Words Per Minute) as the primary typing speed metric. CPM is more accurate for code typing because it accounts for the varied character types in programming (symbols, brackets, operators) rather than assuming 5 characters = 1 word.

## Key Principle: Effective Keystrokes

**CPM is calculated based on "effective keystrokes" - only counting characters that the user actually typed, excluding auto-generated content.**

## Implementation

### 1. Keystroke Counting Function

Located in: `src/components/EnhancedTypingArea.tsx`

```typescript
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
          i++; // Auto-spaces/tabs NOT counted
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
```

### 2. CPM Calculation

Located in: `src/utils/metrics.ts`

```typescript
export const calculateTypingMetrics = (
  startTime: number,
  endTime: number,
  totalChars: number, // This is effective keystrokes
  correctChars: number,
  errorCount: number = 0
): TypingMetrics => {
  const timeInSeconds = (endTime - startTime) / 1000;
  const minutes = timeInSeconds / 60;
  
  // CPM calculation: effective keystrokes / minutes
  const cpm = minutes > 0 ? correctChars / minutes : 0;
  
  return {
    // ... other metrics
    cpm: Math.round(cpm),
    // ...
  };
};
```

### 3. Store Integration

Located in: `src/store/typing-store.ts`

```typescript
updateUserInput: (input: string, manuallyTypedChars?: number) => {
  // ...
  const effectiveKeystrokes = countEffectiveKeystrokes(input, currentSnippet.code);
  
  // Pass effective keystrokes to metrics calculation
  const metrics = calculateTypingMetrics(
    newStartTime,
    endTime,
    effectiveKeystrokes, // Use effective keystrokes for CPM
    comparison.correctChars,
    comparison.errors.length
  );
  // ...
}
```

## Keystroke Counting Rules

### ✅ Counted as Keystrokes (1 each):

1. **Regular Characters**: Letters, numbers, symbols
   ```java
   "public" → 6 keystrokes (p-u-b-l-i-c)
   ```

2. **Manual Spaces**: Deliberately typed spaces
   ```java
   "int x" → 5 keystrokes (i-n-t-[space]-x)
   ```

3. **Newlines**: Enter key presses
   ```java
   "{\n" → 2 keystrokes ({-[Enter])
   ```

4. **Incorrect Characters**: Wrong keystrokes still count
   ```java
   Target: "int x"
   Typed:  "int y" → 5 keystrokes (including wrong 'y')
   ```

5. **Manual Tabs**: Tab key presses when expected
   ```java
   "\tint x" → 4 keystrokes ([Tab]-i-n-t-[space]-x)
   ```

### ❌ NOT Counted as Keystrokes (0 each):

1. **Auto-Generated Indentation**: Spaces/tabs added after Enter
   ```java
   User presses Enter after "if (condition) {"
   Auto-adds: "    " (4 spaces) → 0 keystrokes
   Only the Enter counts as 1 keystroke
   ```

2. **Backspace Operations**: Don't add to keystroke count
   ```java
   Type "hello", backspace twice → 3 effective keystrokes ("hel")
   ```

## Real-World Examples

### Example 1: Simple Method
```java
Target: "public int add(int a, int b) {"
User types each character manually
Result: 32 keystrokes (every character typed)
```

### Example 2: Method with Auto-Indentation
```java
Target: 
```
if (condition) {
    return true;
}
```

User actions:
1. Types "if (condition) {" → 17 keystrokes
2. Presses Enter → 1 keystroke (auto-adds "    ")
3. Types "return true;" → 12 keystrokes  
4. Presses Enter → 1 keystroke
5. Types "}" → 1 keystroke

Total: 32 keystrokes (auto-indentation spaces not counted)
```

### Example 3: With Corrections
```java
Target: "int result = 0;"
User types: "int resuly" (wrong), backspaces twice, types "lt = 0;"
Effective keystrokes: 15 (final correct characters)
```

## Benefits of This Approach

1. **Fair Measurement**: Only counts actual typing effort
2. **Encourages Accuracy**: Corrections don't inflate scores
3. **Code-Friendly**: Accounts for programming-specific patterns
4. **Auto-Feature Compatible**: Works with helpful editor features
5. **Realistic Performance**: Reflects true typing skill

## Performance Ratings

CPM performance ratings (defined in `src/utils/metrics.ts`):

- **300+ CPM**: Excellent
- **200-299 CPM**: Good  
- **125-199 CPM**: Average
- **75-124 CPM**: Below Average
- **<75 CPM**: Beginner

## Completion Logic

Located in: `src/utils/metrics.ts`

```typescript
// Check if typing is complete (user has typed all characters, regardless of accuracy)
results.isComplete = userInput.length === targetText.length;
```

**Key Behavior**: The typing session completes when the user has typed the same number of characters as the target text, **regardless of accuracy**. This ensures:

1. **Timer Always Stops**: No more infinite sessions when users make errors
2. **Results Always Display**: Users see their performance even with mistakes
3. **Fair Analytics**: All completed attempts are recorded in session history
4. **Better UX**: Clear completion feedback regardless of typing accuracy

## Technical Notes

- CPM updates in real-time every 100ms during typing
- Final CPM is calculated when snippet is completed (length match)
- Auto-indentation detection works by comparing input vs target after newlines
- The system handles both spaces and tabs for indentation
- Cursor movement is restricted to maintain linear typing flow
- Sessions complete on character count match, not perfect accuracy

## Future Considerations

- Could add separate metrics for "gross keystrokes" vs "effective keystrokes"
- Potential to track keystroke efficiency ratio
- Consider different weighting for different character types
- Possible integration with error recovery patterns
