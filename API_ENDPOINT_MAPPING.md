# Sahaayak AI - API Endpoint Mapping

This document provides a detailed mapping of every endpoint, its HTTP method, URL path, parameters, request body schemas, and response body schemas.

---

### 1. Authentication (`/api/v1/auth`)

#### Sign Up
- **Method**: `POST`
- **Path**: `/api/v1/auth/signup`
- **Request Body**:
  ```json
  {
    "email": "student@college.edu",
    "password": "securepassword",
    "full_name": "Student Name"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "uuid",
      "email": "student@college.edu",
      "full_name": "Student Name",
      "role": "STUDENT"
    }
  }
  ```

#### Login
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "student@college.edu",
    "password": "securepassword"
  }
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "token_type": "bearer"
    }
  }
  ```

#### Refresh Token
- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh`
- **Request Body**:
  ```json
  {
    "refresh_token": "jwt_refresh_token"
  }
  ```

---

### 2. Onboarding & Profiles (`/api/v1/onboarding` & `/api/v1/digital-twin`)

#### Get Onboarding Status
- **Method**: `GET`
- **Path**: `/api/v1/onboarding/status`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, message: "Status fetched", data: { current_step: int, completed: bool, completeness: float } }`

#### Get Student Profile Data
- **Method**: `GET`
- **Path**: `/api/v1/onboarding/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Details of student_profile, family_profile, career_profile, goals, and assessment.

#### Recalculate Digital Twin
- **Method**: `PUT`
- **Path**: `/api/v1/digital-twin/recalculate`
- **Headers**: `Authorization: Bearer <token>`

---

### 3. Dashboard (`/api/v1/dashboard`)

#### Get Overview Metrics
- **Method**: `GET`
- **Path**: `/api/v1/dashboard/overview`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Overview metrics (CGPA, goals progress, matching opportunities, recommended actions, and recent activities).

---

### 4. Career GPS (`/api/v1/career-gps`)

#### Generate Roadmap
- **Method**: `POST`
- **Path**: `/api/v1/career-gps/generate`
- **Request Body**:
  ```json
  {
    "student_id": "string",
    "career_id": "string",
    "existing_skills": ["string"]
  }
  ```

#### Get Roadmap Data
- **Method**: `GET`
- **Path**: `/api/v1/career-gps/roadmap/{roadmap_id}`

#### Update Roadmap Step
- **Method**: `PUT`
- **Path**: `/api/v1/career-gps/roadmap/step/{step_id}?student_id={student_id}`

#### Get Skill Gap Analysis
- **Method**: `GET`
- **Path**: `/api/v1/career-gps/skill-gap?student_id={student_id}&career_id={career_id}`

---

### 5. AI Mentor Chat (`/api/v1/chat`)

#### Get All Conversations
- **Method**: `GET`
- **Path**: `/api/v1/chat/conversations?student_id={student_id}`

#### Get Conversation History
- **Method**: `GET`
- **Path**: `/api/v1/chat/conversations/{conversation_id}`

#### Send Message Feedback
- **Method**: `POST`
- **Path**: `/api/v1/chat/messages/{message_id}/feedback`
- **Request Body**: `{ "score": int, "comment": "string" }`

---

### 6. Opportunities & Scholarships (`/api/v1/opportunities` & `/api/v1/scholarships`)

#### Get Recommended Opportunities
- **Method**: `GET`
- **Path**: `/api/v1/opportunities/recommended?student_id={student_id}`

#### Track Opportunity Application
- **Method**: `POST`
- **Path**: `/api/v1/opportunities/{opportunity_id}/apply?student_id={student_id}`

#### Get Recommended Scholarships
- **Method**: `GET`
- **Path**: `/api/v1/scholarships/recommended?student_id={student_id}`

---

### 7. Mentor Network & Community (`/api/v1/mentors` & `/api/v1/community`)

#### Get Recommended Mentors
- **Method**: `GET`
- **Path**: `/api/v1/mentors/recommended?student_id={student_id}`

#### Book Session
- **Method**: `POST`
- **Path**: `/api/v1/sessions/book?student_id={student_id}`

#### Get Community Posts Feed
- **Method**: `GET`
- **Path**: `/api/v1/community/posts?student_id={student_id}`

#### Create Community Post
- **Method**: `POST`
- **Path**: `/api/v1/community/posts`
- **Request Body**: `{ "author_id": "string", "content": "string", "title": "string", "group": "string" }`

---

### 8. Voice & Parent Support (`/api/v1/voice` & `/api/v1/parent`)

#### Audio Transcribe
- **Method**: `POST`
- **Path**: `/api/v1/voice/transcribe`
- **Request Body**: `Multipart form-data` with `audio` binary file.

#### Audio Synthesis
- **Method**: `POST`
- **Path**: `/api/v1/voice/synthesize`
- **Request Body**: `{ "text": "string", "language": "string" }`

#### Parent Mode Query
- **Method**: `POST`
- **Path**: `/api/v1/parent/query`
- **Request Body**:
  ```json
  {
    "student_id": "string",
    "topic": "string",
    "language": "string"
  }
  ```
