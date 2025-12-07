# Database Integration - Supabase

This document covers the database setup, Supabase integration, and data management for the typecode application.

## Overview

The application uses **Supabase** as the backend database service, providing:
- PostgreSQL database with real-time capabilities
- User authentication (Google OAuth)
- Row Level Security (RLS)
- RESTful API with TypeScript support
- Real-time subscriptions

## Database Schema

### `typing_sessions` Table

```sql
CREATE TABLE IF NOT EXISTS public.typing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    snippet_title TEXT NOT NULL,
    snippet_id TEXT,
    cpm INTEGER NOT NULL,
    wpm INTEGER NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    time_in_seconds INTEGER NOT NULL,
    total_characters INTEGER NOT NULL,
    correct_characters INTEGER NOT NULL,
    error_count INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Field Descriptions:**
- `id` - Unique session identifier
- `user_id` - Reference to authenticated user
- `language` - Programming language (java, python, cpp, javascript)
- `snippet_title` - Name/title of the code snippet
- `snippet_id` - Reference to the snippet in JSON data
- `cpm` - Characters Per Minute achieved
- `wpm` - Words Per Minute achieved
- `accuracy` - Typing accuracy percentage (0-100)
- `time_in_seconds` - Duration of typing session
- `total_characters` - Total characters in the snippet
- `correct_characters` - Number of correctly typed characters
- `error_count` - Number of typing errors made
- `completed` - Whether the session was completed
- `created_at` - Timestamp of session creation

### Indexes

```sql
CREATE INDEX IF NOT EXISTS typing_sessions_user_id_idx ON public.typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS typing_sessions_created_at_idx ON public.typing_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS typing_sessions_language_idx ON public.typing_sessions(language);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON public.typing_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON public.typing_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON public.typing_sessions
    FOR DELETE USING (auth.uid() = user_id);
```

## Configuration

### Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Getting Credentials:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy **Project URL** and **anon public** key

### Authentication Setup

1. **Enable Google OAuth:**
   - Go to **Authentication** → **Providers**
   - Enable **Google** provider
   - Configure OAuth credentials

2. **Redirect URLs:**
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

## Code Architecture

### Supabase Client (`src/lib/supabase.ts`)

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-loaded Supabase client with configuration checks
export const getSupabase = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }
  // ... client initialization
};

// Configuration validation
export const isSupabaseConfigured = () => {
  if (typeof window === 'undefined') return false; // Skip during SSR
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && url !== 'your_supabase_url_here' && key !== 'your_supabase_anon_key_here';
};
```

### Database Service (`src/lib/database.ts`)

```typescript
export class DatabaseService {
  // Save typing session to database
  static async saveSession(sessionData: SessionData): Promise<TypingSession>
  
  // Get user's typing sessions
  static async getUserSessions(limit = 50): Promise<TypingSession[]>
  
  // Get analytics data for dashboard
  static async getAnalytics(): Promise<AnalyticsData>
  
  // Get recent sessions for display
  static async getRecentSessions(limit = 10): Promise<TypingSession[]>
}
```

### Authentication Component (`src/components/common/AuthButton.tsx`)

```typescript
export default function AuthButton() {
  // Handles Google OAuth sign-in/sign-out
  // Shows user email when authenticated
  // Gracefully handles missing Supabase configuration
}
```

## Data Flow

### Session Storage Flow

1. **User completes typing session**
2. **Metrics calculated** (CPM, WPM, accuracy, etc.)
3. **Session data prepared** with user context
4. **Saved to Supabase** via DatabaseService
5. **Fallback to localStorage** if Supabase unavailable
6. **Real-time updates** to dashboard analytics

### Analytics Calculation

```typescript
// Example analytics calculation
const analytics = {
  totalSessions: sessions.length,
  averageCpm: sessions.reduce((sum, s) => sum + s.cpm, 0) / sessions.length,
  averageAccuracy: sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length,
  bestCpm: Math.max(...sessions.map(s => s.cpm)),
  bestAccuracy: Math.max(...sessions.map(s => s.accuracy)),
  languageStats: calculateLanguageBreakdown(sessions),
  currentStreak: calculateConsecutiveDays(sessions)
};
```

## Migration Strategy

### From localStorage to Supabase

1. **Gradual Migration:**
   - Keep localStorage as fallback
   - Save new sessions to both systems
   - Migrate existing data when user authenticates

2. **Data Compatibility:**
   - Same data structure between systems
   - Type-safe interfaces for consistency
   - Graceful handling of missing data

### Backward Compatibility

- App works without Supabase configuration
- Falls back to localStorage for unauthenticated users
- No breaking changes to existing functionality

## Performance Considerations

### Optimizations

1. **Lazy Loading:** Supabase client only initialized when needed
2. **Batch Operations:** Multiple sessions can be saved together
3. **Caching:** Analytics data cached on client side
4. **Indexes:** Database indexes for common queries

### Query Patterns

```typescript
// Efficient session retrieval with pagination
const sessions = await supabase
  .from('typing_sessions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);

// Language-specific analytics
const languageStats = await supabase
  .from('typing_sessions')
  .select('language, cpm, accuracy')
  .eq('user_id', userId)
  .eq('language', 'javascript');
```

## Security

### Row Level Security (RLS)

- **User Isolation:** Users can only access their own data
- **Automatic Enforcement:** Database-level security policies
- **No Server-Side Logic:** Security handled by Supabase

### Data Validation

```typescript
// Type-safe session data
interface TypingSession {
  id: string;
  user_id: string | null;
  language: 'java' | 'python' | 'cpp' | 'javascript';
  cpm: number;
  accuracy: number;
  // ... other fields with proper types
}
```

## Monitoring & Debugging

### Development Tools

1. **Supabase Dashboard:** Real-time database monitoring
2. **Browser DevTools:** Network requests and client-side logs
3. **Next.js DevTools:** Server-side rendering debugging

### Common Issues

1. **Environment Variables:** Ensure proper configuration
2. **CORS Issues:** Check redirect URLs in Supabase
3. **RLS Policies:** Verify user permissions
4. **Network Errors:** Handle offline scenarios

## Future Enhancements

### Planned Features

1. **Real-time Leaderboards:** Live competition data
2. **Social Features:** Friend connections and sharing
3. **Advanced Analytics:** Detailed progress tracking
4. **Data Export:** User data portability
5. **Offline Sync:** Queue operations when offline

### Scalability

- **Connection Pooling:** Supabase handles automatically
- **Read Replicas:** Available in Supabase Pro
- **Caching Layer:** Redis integration possible
- **CDN Integration:** Static asset optimization

## Deployment

### Production Checklist

- [ ] Supabase project configured
- [ ] Environment variables set
- [ ] Google OAuth configured
- [ ] RLS policies enabled
- [ ] Database indexes created
- [ ] Backup strategy implemented

### Environment Setup

```bash
# Install dependencies
pnpm add @supabase/supabase-js

# Set environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# (Execute SQL schema in Supabase dashboard)
```

---

## Quick Start Guide

1. **Create Supabase Project:** [supabase.com](https://supabase.com)
2. **Run SQL Schema:** Copy schema from this document
3. **Configure Environment:** Update `.env.local`
4. **Enable Google Auth:** In Supabase dashboard
5. **Test Integration:** Sign in and complete a typing session

The database integration provides a solid foundation for user data management, analytics, and future social features while maintaining backward compatibility and graceful degradation.
