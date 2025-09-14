# Product Requirements Document (PRD) – xtype

## 1. Overview

**xtype** is a web-based typing practice app designed specifically for programmers. Unlike generic typing platforms like Monkeytype that use random words or sentences, xtype focuses on typing authentic Java code snippets covering essential Data Structures and Algorithms (DSA) concepts.

The MVP will let users type popular Java DSA algorithms (like binary search, sorting, recursion), measure their typing performance, and practice coding fluency with real-world code.

## 2. Goals & Objectives

- Provide a typing practice tool for programmers, starting with Java DSA algorithms
- Improve coding muscle memory (brackets, semicolons, indentation, recursion patterns)
- Deliver a minimal, distraction-free UI optimized for typing
- Build a solid foundation to expand later into other languages and features

## 3. Scope (MVP)

### ✅ In Scope

**Snippet System**
- Predefined DSA algorithms in Java stored in `snippets.json`
- Each session loads a random algorithm snippet

**Typing Feature**
- User types snippet in a textarea
- Real-time input tracking
- Session ends when user input matches snippet

**Metrics**
- Time Taken (seconds)
- Accuracy % = correct characters / total
- WPM = (characters / 5) ÷ minutes

**UI/UX**
- Syntax highlighting (Prism.js)
- Clean, minimal design using TailwindCSS
- Restart / New Snippet button
- Java-only (no language selector yet)

**Tech Stack**
- Next.js (frontend, routing, deploy-ready)
- TailwindCSS (styling)
- Zustand (state management)
- Prism.js (syntax highlighting)
- Static JSON (snippets)
- pnpm/pnpx (package management)

### ❌ Out of Scope (Future)

- User authentication & profiles
- Leaderboards / multiplayer
- Community-contributed snippets
- Multiple languages
- Error heatmaps and advanced visualizations

## 4. User Stories

- As a programmer, I want to type authentic Java DSA code snippets so I can build muscle memory for real programming patterns
- As a programmer, I want syntax highlighting so the code feels authentic
- As a programmer, I want to see speed and accuracy stats after finishing a snippet
- As a programmer, I want a minimal interface so I can focus on typing
- As a programmer, I want a restart option so I can retry a snippet or load a new one

## 5. Success Metrics

MVP is successful if a user can:
- Load and type one complete Java DSA algorithm snippet
- See time, accuracy, and WPM results at the end

**Target performance:**
- App loads within 1 second
- Works smoothly on desktop and mobile

## 6. Constraints & Assumptions

- Only Java language supported in MVP
- Snippets are classic DSA algorithms (searching, sorting, recursion, etc.)
- Typing practice only → no algorithm explanation/teaching in MVP
- Hosted on Vercel (free & fast)

## 7. Deliverables

- Web App (Next.js + TailwindCSS + Zustand + Prism)
- `snippets.json` → contains at least 10 Java DSA algorithms
- Deployed MVP (Vercel link)

## 8. Timeline (Phases)

- **Week 1** → Project setup (Next.js, Tailwind, Zustand, Prism)
- **Week 2** → Snippet system + display with syntax highlighting
- **Week 3** → Typing engine + real-time tracking
- **Week 4** → Metrics (time, accuracy, WPM) + restart button + deployment

---

⚡ **xtype** is positioned as: *"A specialized typing practice platform for programmers to master real Java code through Data Structures and Algorithms snippets."*
