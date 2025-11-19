# Analytics Tracking

This document outlines all analytics events tracked in the Subspace application.

## Analytics Platforms

The app uses two analytics platforms:
1. **Vercel Analytics** - Primary analytics via `@vercel/analytics`
2. **Google Analytics** - Secondary analytics (GA Measurement ID: G-LHBJ83RN4W)

## Events Tracked

### 🔐 Authentication Events

#### User Signup
**Event:** `user_signed_up`
- **Tracked when:** User creates a new account (email or Google)
- **Data collected:**
  - `method`: 'email' | 'google'
  - `userId`: User's unique ID
  - `timestamp`: ISO timestamp

#### User Signin
**Event:** `user_signed_in`
- **Tracked when:** User logs in (email or Google)
- **Data collected:**
  - `method`: 'email' | 'google'
  - `userId`: User's unique ID
  - `timestamp`: ISO timestamp

#### Authentication Error
**Event:** `authentication_error`
- **Tracked when:** Authentication fails
- **Data collected:**
  - `method`: 'email' | 'google'
  - `errorCode`: Firebase error code
  - `errorMessage`: Error message (truncated to 100 chars)

---

### 📝 Task Management Events

#### Task Created
**Event:** `task_created`
- **Tracked when:** User creates a new task
- **Data collected:**
  - `hasTags`: boolean
  - `hasDate`: boolean
  - `textLength`: number

#### Task Completed
**Event:** `task_completed`
- **Tracked when:** User marks a task as complete
- **Data collected:**
  - `textLength`: number
  - `completionTime`: seconds since task creation

#### Task Deleted
**Event:** `task_deleted`
- **Tracked when:** User deletes a task
- **Data collected:**
  - `textLength`: number

#### Task Edited
**Event:** `task_edited`
- **Tracked when:** User edits a task
- **Data collected:**
  - `originalLength`: number
  - `newLength`: number
  - `textChanged`: boolean

---

### 🎯 Onboarding Events

#### Onboarding Started
**Event:** `onboarding_started`
- **Tracked when:** User begins onboarding flow
- **Data collected:**
  - `userId`: User's unique ID
  - `timestamp`: ISO timestamp

#### Onboarding Step Completed
**Event:** `onboarding_step_completed`
- **Tracked when:** User completes an onboarding step
- **Data collected:**
  - `userId`: User's unique ID
  - `step`: Step ID ('add-task', 'try-dictation', 'explore-subspaces')
  - `timestamp`: ISO timestamp

#### Onboarding Completed
**Event:** `onboarding_completed`
- **Tracked when:** User completes all onboarding steps
- **Data collected:**
  - `userId`: User's unique ID
  - `completionTime`: seconds from start to completion
  - `timestamp`: ISO timestamp

#### Onboarding Skipped
**Event:** `onboarding_skipped`
- **Tracked when:** User skips onboarding without completing all steps
- **Data collected:**
  - `userId`: User's unique ID
  - `completedSteps`: number of steps completed
  - `totalSteps`: total number of steps
  - `completionRate`: percentage completed

---

### 🤖 AI Features Events

#### AI Categorization Used
**Event:** `ai_categorization_used`
- **Tracked when:** AI successfully categorizes a task
- **Data collected:**
  - `textLength`: number
  - `suggestedCategory`: string
  - `confidence`: string

#### AI Categorization Fallback
**Event:** `ai_categorization_fallback`
- **Tracked when:** AI categorization fails and fallback is used
- **Data collected:**
  - `textLength`: number
  - `reason`: string

#### Voice Input Used
**Event:** `voice_input_used`
- **Tracked when:** User uses voice input feature
- **Data collected:**
  - `inputLength`: number
  - `processingTime`: milliseconds

#### Voice Input Processed
**Event:** `voice_input_processed`
- **Tracked when:** Voice input is processed
- **Data collected:**
  - `success`: boolean
  - `extractedTags`: number
  - `hasDate`: boolean

---

### 📁 Category Management Events

#### Category Created
**Event:** `category_created`
- **Tracked when:** User creates a new category
- **Data collected:**
  - `categoryName`: string
  - `hasDescription`: boolean
  - `hasKeywords`: boolean

#### Category Used
**Event:** `category_used`
- **Tracked when:** User assigns a category to tasks
- **Data collected:**
  - `categoryName`: string
  - `taskCount`: number

---

### 🎨 View & Navigation Events

#### View Changed
**Event:** `view_changed`
- **Tracked when:** User switches between views
- **Data collected:**
  - `view`: 'todo' | 'backlog' | 'calendar' | 'pomodoro'

#### Pomodoro Session Started
**Event:** `pomodoro_session_started`
- **Tracked when:** User starts a pomodoro session
- **Data collected:**
  - `taskCount`: number
  - `duration`: minutes

#### Pomodoro Session Completed
**Event:** `pomodoro_session_completed`
- **Tracked when:** User completes a pomodoro session
- **Data collected:**
  - `duration`: minutes
  - `tasksCompleted`: number

---

### 👤 User Engagement Events

#### Session Started
**Event:** `session_started`
- **Tracked when:** User starts a session
- **Data collected:**
  - `userType`: 'new' | 'returning'

#### Feature Used
**Event:** `feature_used`
- **Tracked when:** User uses a specific feature
- **Data collected:**
  - `feature`: string
  - `context`: string (optional)

---

### ⚠️ Error & Performance Events

#### Error Occurred
**Event:** `error_occurred`
- **Tracked when:** An error occurs in the app
- **Data collected:**
  - `errorType`: string
  - `errorMessage`: string (truncated to 100 chars)
  - `context`: string (optional)

#### Performance Metric
**Event:** `performance_metric`
- **Tracked when:** Performance metrics are measured
- **Data collected:**
  - `metric`: string
  - `value`: number
  - `unit`: string

---

## Viewing Analytics

### Vercel Analytics
1. Go to your Vercel dashboard
2. Select your project
3. Navigate to the "Analytics" tab
4. View events, user flows, and custom events

### Google Analytics
1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property (GA Measurement ID: G-LHBJ83RN4W)
3. Navigate to "Reports" → "Events" to see custom events
4. Use "Exploration" for custom reports

---

## Privacy & Compliance

- User IDs are Firebase authentication UIDs (pseudonymized)
- No personally identifiable information (PII) is tracked
- Error messages are truncated to prevent leaking sensitive data
- All tracking complies with Vercel and Google Analytics privacy policies

---

## Implementation Files

- **Analytics Service:** `lib/analytics.ts`
- **Auth Events:** `app/signup/page.tsx`, `app/signin/page.tsx`, `lib/auth-context.tsx`
- **Onboarding Events:** `components/ui/Onboarding.tsx`
- **Task Events:** `app/page.tsx`
- **Google Analytics:** `components/GoogleAnalytics.tsx`, `lib/google-analytics.ts`
- **Root Integration:** `app/layout.tsx`

