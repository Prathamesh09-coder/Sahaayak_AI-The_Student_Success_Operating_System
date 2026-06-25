# Sahaayak AI Platform - Integration Audit Report

This report presents a comprehensive audit of all frontend pages and their synchronization with the FastAPI backend. It details missing or broken endpoints and specifies the required payload structures.

---

### Audit Matrix

| Page | Frontend File | Backend Route Prefix | Method | Request Schema | Response Schema | Status | Notes / Gaps |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sign In** | `sign-in.tsx` | `/api/v1/auth/login` | `POST` | `UserLogin` | `Token` | Mocked | Frontend form does not call backend. Needs implementation. |
| **Sign Up** | `sign-up.tsx` | `/api/v1/auth/signup` | `POST` | `UserCreate` | `UserResponse` | Mocked | Frontend form does not call backend. Needs implementation. |
| **Onboarding** | `onboarding.tsx` | `/api/v1/onboarding` | `POST`/`GET` | Academic, Career, Family, Goals, Assessment schemas | Onboarding Status | Integrated | Calls endpoints, but needs standard wrapping. |
| **Dashboard** | `_app.dashboard.tsx` | `/api/v1/dashboard` | `GET` | None (Auth Token) | `DashboardOverviewResponse` | Partial | Needs transition to TanStack Query and standard wrapping. |
| **AI Mentor** | `_app.ai-mentor.tsx` | `/api/v1/chat` | `GET`/`POST`/`DELETE` | `ChatRequest`, `MessageFeedbackRequest` | `ConversationResponse` | Partial | WebSocket route is correct; needs TanStack Query integration. |
| **Career GPS** | `_app.career-gps.tsx` | `/api/v1/career-gps` | `POST`/`GET`/`PUT` | `GenerateRoadmapRequest` | Raw Dictionary | Mocked | Needs full integration of roadmap, skill-gap, and milestones APIs. |
| **Opportunity Copilot** | `_app.opportunities.tsx` | `/api/v1/opportunities` | `GET`/`POST` | Query parameters | Match Results list | Mocked | Needs hookup to `/recommended` and `/{id}/apply`. |
| **Scholarship Hub** | `_app.scholarships.tsx` | `/api/v1/scholarships` | `GET` | Query parameters | Match Results list | Mocked | Needs hookup to `/recommended` and `/{id}`. |
| **Mentor Network** | `_app.mentors.tsx` | `/api/v1/mentors` | `GET`/`POST` | Query parameters | Recommended Mentors list | Mocked | Needs hookup to `/recommended` and `/request-session`. |
| **Community Circles** | `_app.community.tsx` | `/api/v1/community` | `GET`/`POST` | Query parameters, Post body | Suggested Groups, Trending, Posts | Mocked | **Missing API**: `GET /community/posts` (general post feed) and comments. |
| **Success Index** | `_app.success-index.tsx` | `/api/v1/success` & `/api/v1/predictions` | `GET` | Query parameters | Index details, predictions, history | Mocked | Needs hookup to `/me`, `/predictions/me`, `/predictions/forecast`. |
| **Parent Mode** | `_app.parent.tsx` | `/api/v1/parent` | `POST`/`GET`/`PUT` | `QueryRequest`, Profile body | Explanation, Profile status | Mocked | Needs hookup to `/query` and `/profile`. |
| **Voice Assistant** | `_app.voice.tsx` | `/api/v1/voice` | `POST` | Audio file / text | Transcripts, respond payload | Mocked | Needs hookup to `/transcribe`, `/synthesize`, and `/respond`. |
| **Accessibility Settings** | `_app.settings.tsx` | `/api/v1/accessibility` | `GET`/`PUT` | Preferences dictionary | Preferences dictionary | Mocked | Needs persistence hookup in Settings. |

---

### Identified Gaps & Action Items

1. **Central API Client**: Ensure `frontend/src/lib/api.ts` handles generic methods, attaches the JWT header, retries on 401 using the refresh token, and handles errors globally.
2. **Missing Backend Endpoints**:
   - `GET /api/v1/community/posts` (Return list of community posts)
   - `POST /api/v1/community/posts/{post_id}/comments` (Allow posting comments)
3. **Response Schema Standardization**: Wrap all backend router endpoints to consistently return the `{success: bool, message: str, data: Any}` schema structure.
4. **WebSocket Protocol Synchronisation**: Map the dashboard realtime listener to `ws://localhost:8000/api/v1/ws` and make sure it emits updates on event changes.
