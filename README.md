# typecode - Typing Practice for Programmers

A specialized typing practice platform designed for programmers to master real Java code through Data Structures and Algorithms snippets.

## 🎯 Features

- **Real Java DSA Code**: Practice typing authentic algorithms including Binary Search, Sorting, Trees, and more
- **Syntax Highlighting**: Beautiful Java code display with Prism.js
- **Real-time Metrics**: Live WPM, accuracy, and time tracking
- **Character Validation**: Precise character-by-character comparison
- **Performance Ratings**: Get rated on your typing speed and accuracy
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Mode**: Automatic theme switching support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd typecode
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.x
- **State Management**: Zustand
- **Syntax Highlighting**: Prism.js
- **Build Tool**: Turbopack
- **Package Manager**: pnpm

## 📊 Available Algorithms

The app includes 10 carefully selected Java DSA algorithms:

- **Searching**: Binary Search
- **Sorting**: Bubble Sort, Quick Sort, Merge Sort
- **Trees**: DFS Binary Tree, BFS Binary Tree
- **Recursion**: Fibonacci (Recursive)
- **Arrays**: Two Sum, Reverse Linked List
- **Strings**: Valid Parentheses

## 🎮 How to Use

1. **Start**: Visit the app and a random Java algorithm will load
2. **Type**: Click in the typing area and start typing the code exactly as shown
3. **Track**: Watch your real-time metrics (WPM, accuracy, time)
4. **Complete**: Finish typing to see your final results and performance rating
5. **Practice**: Click "New Snippet" to try another algorithm

## 🎯 Keyboard Shortcuts

- `Ctrl+R`: Reset current session
- `Ctrl+A`: Select all text in typing area

## 📈 Performance Metrics

- **WPM (Words Per Minute)**: Based on 5 characters = 1 word
- **Accuracy**: Percentage of correctly typed characters
- **Time**: Session duration from first keystroke to completion
- **Ratings**: Performance ratings from Beginner to Excellent

## 🏗️ Development

### Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── CodeDisplay.tsx  # Syntax highlighted code display
│   ├── TypingArea.tsx   # Interactive typing interface
│   ├── MetricsDisplay.tsx # Real-time metrics dashboard
│   └── Controls.tsx     # Snippet controls (New/Reset)
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── data/               # Static data (snippets.json)
```

## 🚀 Deployment

The app is optimized for deployment on Vercel:

```bash
pnpm build  # Ensure production build works
```

Deploy to Vercel:
- Connect your repository to Vercel
- Vercel will automatically detect Next.js and use the correct build settings
- The app will be available at your Vercel domain

## 🎨 Design Philosophy

typecode focuses on:
- **Authenticity**: Real programming code, not random text
- **Precision**: Exact character matching including spaces and formatting
- **Feedback**: Immediate visual and metric feedback
- **Simplicity**: Clean, distraction-free interface
- **Performance**: Fast loading and smooth interactions

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**typecode** - Master real Java code through typing practice. Built with ❤️ for programmers.