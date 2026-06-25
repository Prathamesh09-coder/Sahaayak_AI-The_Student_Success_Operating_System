# Sahaayak AI - Frontend Integration Report

This document reports on the frontend implementation updates, including routing changes, error boundary handling, and Empty States for all synchronized pages.

---

### 1. Global Setup & Central Client
- **File**: `frontend/src/lib/api.ts`
- **Key Enhancements**:
  - Implements a central Axios-like `API` object fetching from `http://localhost:8000/api/v1`.
  - Auto-extracts access token from `localStorage` and appends as `Authorization: Bearer <JWT>`.
  - Traps `401 Unauthorized` responses, attempts to call `/auth/refresh` with `refresh_token`, updates `localStorage`, and retries the failed requests.
  - Registers `AbortController` hooks to support request cancellation.
  - Implements development-only logging and error toast messages.

---

### 2. State & Data Persistence
- **Onboarding and Login**:
  - `components/auth/auth-ui.tsx` is updated to invoke real login and signup APIs, parsing and saving tokens in `localStorage`.
  - App state caches the student ID resolved from `OnboardingAPI.getMe()`.

---

### 3. Page Synchronization Checklist

#### Dashboard
- Uses React Query (`useQuery`) to retrieve `/dashboard/overview`.
- Listens to global WebSockets on `ws://localhost:8000/api/v1/ws`. When events like `twin.updated` or `dashboard.refresh` occur, it forces a TanStack Query cache invalidation to pull fresh data.
- Handles empty/unauthorized states gracefully.

#### AI Mentor
- Replaces mock conversations and histories with real state.
- WebSocket streaming maps to `ws://localhost:8000/api/v1/mentor/ws/{conversation_id}`.
- Exposes feedback button hooks calling `/chat/messages/{id}/feedback`.

#### Career GPS
- Replaces mock milstones timeline with `/career-gps/roadmap/{id}` metrics.
- Exposes "Recalculate Route" calling `/career-gps/generate`.
- Integrates `useQuery` for skill-gap analyses.

#### Opportunity Copilot & Scholarship Hub
- Fetches matches via `OpportunitiesAPI.getRecommended()` and `ScholarshipAPI.getRecommended()`.
- Maps eligibility indicators, match scores, and missing requirements directly to backend responses.
- Application status is tracked via `/opportunities/{id}/apply`.

#### Community Circles
- Displays circles, posts, and trending tags from real database endpoints.
- Replaces hardcoded likes and comments count.

#### Success Index
- Pulls index values, breakdown parameters, and predictive forecasting values directly from success index and predictions APIs.

#### Parent & Voice Integration
- Connects speech recognition transcripts to `/voice/transcribe`, `/voice/synthesize`, and `/voice/respond`.
- Connects Parent Query to `/parent/query` in local languages.
- Connects preferred languages toggle to local accessibility preferences.
