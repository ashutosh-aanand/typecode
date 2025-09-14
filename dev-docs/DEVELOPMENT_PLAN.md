# xtype Development Plan

## Phase-by-Phase Implementation Guide

### Phase 1: Project Setup & Foundation (Week 1)

#### 1.1 Initialize Next.js Project
```bash
pnpx create-next-app@latest xtype --typescript --tailwind --eslint --app
cd xtype
```

#### 1.2 Install Dependencies
```bash
# State Management
pnpm add zustand

# Syntax Highlighting
pnpm add prismjs
pnpm add @types/prismjs

# Development Dependencies
pnpm add -D @types/node
```

#### 1.3 Project Structure Setup
```
xtype/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── TypingArea.tsx
│   │   ├── CodeDisplay.tsx
│   │   ├── MetricsDisplay.tsx
│   │   └── Controls.tsx
│   ├── store/
│   │   └── typing-store.ts
│   ├── data/
│   │   └── snippets.json
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── metrics.ts
├── dev-docs/
│   ├── PRD.md
│   └── DEVELOPMENT_PLAN.md
└── package.json
```

#### 1.4 Basic Configuration
- Configure TailwindCSS for dark theme
- Set up Prism.js for Java syntax highlighting
- Create basic TypeScript interfaces
- Set up Zustand store structure

#### 1.5 Deliverables
- ✅ Next.js app running on localhost:3000
- ✅ All dependencies installed
- ✅ Project structure created
- ✅ Basic routing working

---

### Phase 2: Snippet System & Display (Week 2)

#### 2.1 Create Snippets Data
- Create `snippets.json` with 10+ Java DSA algorithms:
  - Binary Search
  - Bubble Sort
  - Quick Sort
  - Merge Sort
  - DFS Traversal
  - BFS Traversal
  - Fibonacci (Recursive)
  - Two Sum
  - Reverse Linked List
  - Valid Parentheses

#### 2.2 Snippet Management
```typescript
// types/index.ts
interface Snippet {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  code: string;
  category: string;
}

// store/typing-store.ts
interface TypingStore {
  currentSnippet: Snippet | null;
  loadRandomSnippet: () => void;
  loadSnippetById: (id: string) => void;
}
```

#### 2.3 Code Display Component
- Implement `CodeDisplay.tsx` with Prism.js
- Add Java syntax highlighting
- Responsive design for mobile/desktop
- Line numbers (optional)

#### 2.4 Basic UI Layout
- Header with app title
- Code display area
- Placeholder for typing area
- Basic styling with TailwindCSS

#### 2.5 Deliverables
- ✅ 10+ Java DSA snippets in JSON
- ✅ Snippet loading system
- ✅ Syntax-highlighted code display
- ✅ Responsive UI layout

---

### Phase 3: Typing Engine & Real-time Tracking (Week 3)

#### 3.1 Typing Area Component
```typescript
// components/TypingArea.tsx
- Textarea for user input
- Real-time character comparison
- Visual feedback (correct/incorrect characters)
- Cursor position tracking
```

#### 3.2 Real-time Tracking Logic
```typescript
// store/typing-store.ts
interface TypingState {
  userInput: string;
  currentPosition: number;
  correctChars: number;
  totalChars: number;
  startTime: number | null;
  isComplete: boolean;
  errors: number[];
}
```

#### 3.3 Character-by-Character Validation
- Compare user input with target snippet
- Track correct/incorrect characters
- Handle special characters (spaces, tabs, newlines)
- Prevent user from advancing past errors (optional)

#### 3.4 Session Management
- Start timer on first keystroke
- End session when input matches snippet exactly
- Reset functionality
- New snippet loading

#### 3.5 Deliverables
- ✅ Functional typing area
- ✅ Real-time input validation
- ✅ Session start/end detection
- ✅ Character accuracy tracking

---

### Phase 4: Metrics & Polish (Week 4)

#### 4.1 Metrics Calculation
```typescript
// utils/metrics.ts
interface TypingMetrics {
  timeInSeconds: number;
  accuracy: number; // percentage
  wpm: number;
  totalCharacters: number;
  correctCharacters: number;
}

const calculateMetrics = (
  startTime: number,
  endTime: number,
  totalChars: number,
  correctChars: number
): TypingMetrics => {
  // Implementation
}
```

#### 4.2 Results Display
- `MetricsDisplay.tsx` component
- Show time, accuracy, WPM
- Visual progress indicators
- Comparison with previous attempts (localStorage)

#### 4.3 Controls & Navigation
```typescript
// components/Controls.tsx
- "New Snippet" button
- "Restart" button  
- "Reset" button
- Keyboard shortcuts (optional)
```

#### 4.4 UI Polish
- Smooth animations and transitions
- Loading states
- Error handling
- Mobile optimization
- Dark/light theme toggle (optional)

#### 4.5 Performance Optimization
- Code splitting
- Lazy loading
- Bundle size optimization
- Lighthouse score > 90

#### 4.6 Deployment Preparation
```bash
# Build and test
pnpm build
pnpm start

# Deploy to Vercel
pnpx vercel --prod
```

#### 4.7 Deliverables
- ✅ Complete metrics system
- ✅ Polished UI/UX
- ✅ Performance optimized
- ✅ Deployed to Vercel
- ✅ Mobile responsive

---

## Development Commands Reference

### Setup Commands
```bash
# Initial setup
pnpx create-next-app@latest xtype --typescript --tailwind --eslint --app
cd xtype
pnpm install

# Development
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Package Management
```bash
# Add dependencies
pnpm add [package]
pnpm add -D [dev-package]

# Remove dependencies
pnpm remove [package]

# Update dependencies
pnpm update
```

### Deployment
```bash
# Vercel deployment
pnpx vercel       # Deploy to preview
pnpx vercel --prod # Deploy to production
```

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Load random snippet
- [ ] Type complete snippet
- [ ] Verify metrics accuracy
- [ ] Test restart functionality
- [ ] Test on mobile device
- [ ] Test keyboard shortcuts
- [ ] Verify performance (< 1s load)

### Browser Compatibility
- Chrome (primary)
- Firefox
- Safari
- Edge
- Mobile browsers

---

## Success Criteria

### Phase 1 Success
- ✅ Next.js app running
- ✅ Dependencies installed
- ✅ Project structure complete

### Phase 2 Success
- ✅ Snippets loading correctly
- ✅ Syntax highlighting working
- ✅ UI layout responsive

### Phase 3 Success
- ✅ Typing detection working
- ✅ Real-time validation
- ✅ Session management

### Phase 4 Success
- ✅ Accurate metrics calculation
- ✅ Polished user experience
- ✅ Successfully deployed

### Overall MVP Success
- ✅ User can type a complete Java snippet
- ✅ Metrics display correctly
- ✅ App loads under 1 second
- ✅ Works on desktop and mobile
