# Sahaayak AI

> **Empowering First-Generation Learners through AI-Driven Student Success Intelligence.**

---

## Hero Section

<div align="center">
  <!-- Project Logo Placeholder -->
  <img src="https://raw.githubusercontent.com/google/material-design-icons/master/png/social/school/materialicons/48dp/2x/baseline_school_black_48dp.png" alt="Sahaayak AI Logo" width="120" />
  
  <h3>Student Success Operating System (SSOS)</h3>
  <p>Bridging the social, academic, and economic capital divide for first-generation university students.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python Version" />
    <img src="https://img.shields.io/badge/FastAPI-0.100.0%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Neo4j-5-008CC1?style=for-the-badge&logo=neo4j&logoColor=white" alt="Neo4j" />
    <img src="https://img.shields.io/badge/NVIDIA%20AI-Qwen--72B-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="NVIDIA AI" />
    <img src="https://img.shields.io/badge/Docker-Compatible-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge" alt="Build Status" />
  </p>
</div>

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Vision](#vision)
- [Key Innovation Layers](#key-innovation-layers)
  - [AI Mentor Companion](#ai-mentor-companion)
  - [Student Digital Twin](#student-digital-twin)
  - [Career GPS & Orbital Graph](#career-gps--orbital-graph)
  - [Opportunity Copilot](#opportunity-copilot)
  - [Predictive Intelligence Engine](#predictive-intelligence-engine)
  - [Social Capital Engine](#social-capital-engine)
  - [Parent Guidance Assistant](#parent-guidance-assistant)
- [System Architecture](#system-architecture)
  - [Frontend Layer](#frontend-layer)
  - [Backend Layer](#backend-layer)
  - [AI & Vector Layer](#ai--vector-layer)
  - [Knowledge Graph Layer](#knowledge-graph-layer)
  - [Data Layer](#data-layer)
- [End-to-End System Flow](#end-to-end-system-flow)
- [High-Level Architecture Diagram](#high-level-architecture-diagram)
- [Database & Graph Schemas](#database--graph-schemas)
- [Local Setup & Installation](#local-setup--installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Testing & Verification](#testing--verification)
- [Production Deployment & Scaling](#production-deployment--scaling)

---

## Problem Statement

First-generation university students—those who are the first in their families to attend college—face systemic barriers that lead to high dropout rates, underemployment, and academic stress. While institutions offer resources, navigating them requires a level of institutional knowledge and support that these students often lack.

### Core Challenges

1. **The Guidance Deficit**: Unlike peers with university-educated parents, first-generation learners cannot rely on family networks for academic navigation, course selection, or career coaching.
2. **Asymmetric Opportunity Discovery**: Critical resources like scholarships, internships, and research opportunities are scattered. Students who need financial aid the most are often unaware of deadlines or eligibility requirements.
3. **The Social Capital Gap**: Career success is highly dependent on professional networks. Rural and low-income students start with minimal professional connections and face significant barriers in finding industry mentors.
4. **Financial and Psychological Stress**: The combination of financial pressure, academic adjustment, and isolation leads to high burnout and dropout rates.
5. **Language and Family Alignment Gaps**: Multilingual students and parents from rural backgrounds struggle to understand university milestones, leading to misalignment between family expectations and academic realities.

---

## Vision

Sahaayak AI aims to become the **Student Success Operating System (SSOS)** for universities globally. Our mission is to democratize student guidance, leveling the playing field for first-generation and underrepresented learners by translating complex institutional pathways into a clear, personalized, and actionable roadmap.

By unifying academic profiles, career aspirations, financial aids, and social connections into a single cohesive platform, Sahaayak AI shifts student support from *reactive intervention* to *proactive empowerment*.

---

## Key Innovation Layers

Sahaayak AI is built on seven interconnected innovation layers that work in unison to support the student journey.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SAHAAYAK AI PLATFORM                          │
├─────────────────┬─────────────────┬──────────────────┬──────────────────┤
│    AI Mentor    │  Digital Twin   │    Career GPS    │   Opportunity    │
│    Companion    │  State Engine   │  Orbital Graph   │     Copilot      │
├─────────────────┴─────────────────┼──────────────────┴──────────────────┤
│      Predictive Intelligence      │         Social Capital Engine       │
├───────────────────────────────────┴─────────────────────────────────────┤
│                       Parent Guidance Assistant                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Mentor Companion

The **AI Mentor Companion** provides 24/7 personalized, context-aware mentoring. Rather than serving as a generic chatbot, it operates on a Retrieval-Augmented Generation (RAG) pipeline coupled with the student's live **Digital Twin** context.
- **Context-Aware Responses**: Automatically weights queries with the student's current CGPA, active goals, skill gaps, and risk factors.
- **Conversational Memory**: Maintains a multi-turn history to guide students through long-term academic decisions.
- **Multilingual RAG**: Utilizes localized vector search to fetch university resources, policies, and program details in the student's preferred language.

### Student Digital Twin

The **Student Digital Twin** is a multi-dimensional, dynamic state representation of the student's academic, vocational, and psychological journey. It acts as the central data model that fuels the platform's intelligence.
- **Multi-Dimensional Metrics**: Captures academic performance (CGPA), career alignment, skill acquisition velocity, financial stability index, social engagement metrics, and wellness indicators.
- **Real-Time Synthesis**: Dynamically updates as the student completes coursework, attends mentor sessions, or logs community interactions.
- **Actionable State**: Rather than a static dashboard, it translates metrics into immediate, targeted system triggers (e.g., automatically flagging burnout risk if engagement drops while study hours spike).

### Career GPS & Orbital Graph

The **Career GPS** acts as a dynamic navigation system for career goals. Built on a custom orbital layout engine, it visualizes the complete educational and professional ecosystem surrounding the student.
- **Interactive Visualization**: Uses React Flow to render a solar-system style graph with the student node at the center, orbiting career goals, required skills, matching courses, eligible scholarships, and active mentors.
- **Dynamic Skill Gap Analysis**: Compares the student's current skill profile against the requirements of their dream career, dynamically highlighting priority skill nodes.
- **Orbital Hierarchy Layout**: Distributes first-degree targets in an inner orbit and second-degree dependencies (e.g., recommended courses linked to skills) in an outer orbit, maintaining clear visual relationships.

### Opportunity Copilot

The **Opportunity Copilot** actively matches students with scholarships, internships, jobs, and hackathons, eliminating discovery barriers.
- **Vector-Based Matchmaking**: Embeds opportunities and profiles in a high-dimensional space, ranking options by relevance, eligibility, and urgency.
- **Financial Aid Targeting**: Prioritizes emergency funds and merit-based scholarships for students identified with high financial risk.

### Predictive Intelligence Engine

The **Predictive Intelligence Engine** monitors student progression to forecast long-term outcomes and identify challenges early.
- **Risk Projections**: Calculates probabilities for dropout, academic probation, and wellness burnout.
- **Success Probabilities**: Forecasts job placement likelihood and scholarship acceptance rates based on matching criteria.
- **Explainability Layer**: Provides clear, human-readable explanations for every model prediction, detailing the exact contributing factors and recommending immediate mitigations.

### Social Capital Engine

The **Social Capital Engine** bridges the networking gap by connecting students with industry mentors and peer study groups.
- **Mentor Matching**: Ranks mentors based on industry alignment, shared background (e.g., alumni from the same town), and conversational compatibility.
- **Peer Cohort Formation**: Groups students working on similar career roadmaps to encourage collaborative learning.

### Parent Guidance Assistant

The **Parent Guidance Assistant** bridges the gap between the university and the student's home.
- **Multilingual Voice Updates**: Translates complex academic progress and financial aid milestones into simple, voice-synthesized updates in regional languages.
- **Guidance Alignment**: Empowers parents with context on how to support their child's career aspirations, removing educational barriers.

---

## System Architecture

Sahaayak AI utilizes a decoupled, high-throughput asynchronous architecture designed for real-time responsiveness, data integrity, and analytical scale.

```
                    ┌─────────────────┐
                    │  React Frontend │
                    └────────┬────────┘
                             │ (HTTP / WebSockets)
                             ▼
                    ┌─────────────────┐
                    │ FastAPI Gateway │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │      Redis      │ │      Neo4j      │
│  (Relational)   │ │  (Queue/Cache)  │ │ (Success Graph) │
└─────────────────┘ └────────┬────────┘ └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Celery Worker  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    AI Models    │
                    │  (NVIDIA/Chroma)│
                    └─────────────────┘
```

### Frontend Layer
- **Core Stack**: React 19, Vite, TypeScript, TailwindCSS.
- **State & Routing**: TanStack Router (Vite Start) and TanStack Query (React Query) for state synchronization.
- **Visual Engines**: React Flow for graph layouts, Framer Motion for micro-animations, and Recharts for progress metrics.
- **Why Vite & SSR**: Next-generation Vite tooling combined with TanStack Start enables instant local loading times, while maintaining Server-Side Rendering (SSR) capability for public SEO-optimized landing pages.

### Backend Layer
- **Core Stack**: FastAPI, SQLAlchemy (Async), Uvicorn.
- **Distributed Tasks**: Celery and Redis handle high-throughput background tasks (e.g., running predictive models, syncing Neo4j, generating voice syntheses).
- **Scheduler**: APScheduler runs daily success index recalculations at midnight.
- **Why Asynchronous**: FastAPI's native async/await model enables handling thousands of concurrent WebSocket connections (for real-time dashboard updates) without blocking system threads.

### AI & Vector Layer
- **LLM Inference**: NVIDIA Qwen-72B Instruct via high-throughput API endpoints.
- **Vector Database**: ChromaDB handles unstructured text storage and semantic indexing.
- **Embeddings**: HuggingFace `all-MiniLM-L6-v2` encodes documentation, scholarships, and career paths.
- **RAG Pipeline**: LangChain orchestrates semantic retrieval, document chunking, and prompt synthesis.

### Knowledge Graph Layer
- **Database**: Neo4j Community/Enterprise Edition.
- **Query Language**: Cypher with Map Projections for direct JSON serialization.
- **Why Neo4j**: Relational databases struggle with deep recursive queries (e.g., finding how a course connects to a skill, which targets a career, which matches a mentor). Neo4j executes these path-finding queries in milliseconds, representing the educational ecosystem as it naturally exists—a network.

### Data Layer
- **Database**: PostgreSQL.
- **Async Driver**: `asyncpg` with SQLAlchemy 2.0.
- **Why PostgreSQL**: Provides ACID-compliant transactional persistence for student authentication, onboarding records, success history snapshots, and system configurations.

---

## End-to-End System Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant DB as PostgreSQL
    participant G as Neo4j Graph
    participant AI as AI Engine (RAG/LLM)
    participant WS as WebSocket Manager

    Student->>FE: Complete Onboarding & Submit Goals
    FE->>BE: POST /api/v1/onboarding/complete
    BE->>DB: Save Academic & Career Profiles
    
    Note over BE,DB: Trigger Success Index Calculation
    BE->>DB: Compute SuccessIndex & Predictions
    BE->>DB: Save SuccessIndexHistory Snapshot
    
    Note over BE,G: Sync Neo4j Graph
    BE->>G: Write Student, Skill, Career, Mentor Nodes & Edges
    
    BE->>WS: Broadcast Update Event ("knowledge_graph.updated")
    WS-->>FE: Push WebSocket Invalidation Event
    FE->>BE: GET /api/v1/knowledge-graph/me
    BE-->>FE: Return Orbital Graph JSON
    FE->>Student: Render Interactive Success Universe
    
    Note over Student,AI: Ongoing AI Mentorship
    Student->>FE: Send Question ("How do I apply for the Tata Scholarship?")
    FE->>BE: POST /api/v1/chat/message
    BE->>AI: Query ChromaDB & Retrieve Scholarship Context
    BE->>AI: Inject Student Digital Twin Context
    AI-->>BE: Generate Personalized Guidance Response
    BE-->>FE: Stream Message Response via WebSocket
    FE->>Student: Display Mentorship Output
```

---

## High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client_Layer [Client Layer]
        Student([Student User]) -->|Interacts| FE[React / Vite Frontend]
        Parent([Parent User]) -->|Voice / Multilingual Updates| FE
    end

    subgraph API_Gateway [API Gateway & Routing]
        FE -->|HTTP / WebSockets| FastAPI{FastAPI Application}
        FastAPI -->|Real-Time Broadcasts| WS[WebSocket Connection Manager]
        WS -->|Pushes State Updates| FE
    end

    subgraph Service_Layer [Service & Background Jobs]
        FastAPI -->|Delegates Long Operations| Celery[Celery Task Queue]
        Celery -->|Broker / Backend| Redis[(Redis Cache & Queue)]
        FastAPI -->|Daily Triggers| Scheduler[APScheduler Job Daemon]
    end

    subgraph Data_Storage [State & Storage Layer]
        FastAPI -->|Transactional Persistence| Postgres[(PostgreSQL DB)]
        FastAPI -->|Relational Path Queries| Neo4j[(Neo4j Graph Database)]
        FastAPI -->|Semantic Vector Search| Chroma[(Chroma Vector DB)]
    end

    subgraph AI_Inference [AI Inference Engine]
        Celery -->|RAG Processing| LangChain[LangChain Pipeline]
        LangChain -->|Text Embeddings| HF[HuggingFace Embeddings]
        LangChain -->|LlamaIndex / LLM Context| NVIDIA[NVIDIA Qwen LLM]
    end

    %% Visual Styling
    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef gateway fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef service fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;
    classDef storage fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef ai fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#fff;

    class Student,Parent,FE client;
    class FastAPI,WS gateway;
    class Celery,Redis,Scheduler service;
    class Postgres,Neo4j,Chroma storage;
    class LangChain,HF,NVIDIA ai;
```

---

## Database & Graph Schemas

### PostgreSQL Relational Schema

Sahaayak AI utilizes SQLAlchemy models to enforce data integrity. The core tables include:
1. **users**: Primary user credentials, names, and authentication details.
2. **student_profiles**: Core academic records (college, branch, CGPA) and onboarding status.
3. **career_profiles**: Target career goals and current skill lists.
4. **success_indices**: Dynamic, multi-dimensional success scores.
5. **success_index_histories**: Daily snapshots tracking progress over time.
6. **predictions**: AI-generated risk levels and success probabilities.
7. **forecasting_data**: Future success trajectories (30, 90, 180 days).
8. **interventions**: System-generated alert flags.

### Neo4j Graph Schema

The graph database represents connections between entities in the student success ecosystem:

```
(Student:Student) -[:TARGETS]-> (Career:Career)
(Career:Career) -[:REQUIRES]-> (Skill:Skill)
(Student:Student) -[:HAS_SKILL]-> (Skill:Skill)
(Skill:Skill) -[:LEARN_VIA]-> (Course:Course)
(Student:Student) -[:ELIGIBLE_FOR]-> (Scholarship:Scholarship)
(Student:Student) -[:MATCHES]-> (Opportunity:Opportunity)
(Student:Student) -[:CONNECTED_TO]-> (Mentor:Mentor)
(Student:Student) -[:MEMBER_OF]-> (Community:Community)
(Student:Student) -[:INSPIRED_BY]-> (SuccessStory:SuccessStory)
```

---

## Local Setup & Installation

Follow these steps to run the complete Sahaayak AI stack locally.

### Prerequisites
- **Python**: Version 3.10 or higher.
- **Node.js**: Version 18 or higher (with npm).
- **PostgreSQL**: Version 15 running locally or via Docker.
- **Neo4j**: Version 5 running locally (port 7687) or via Docker.
- **Redis**: Running locally (port 6379) for Celery and caching.

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the Database**:
   Make sure PostgreSQL is running, then run the database migrations and seed initial career/course records:
   ```bash
   # Runs tables creation and migrations
   alembic upgrade head
   
   # Seeds the database with default career paths, mentors, and opportunities
   python seed_data.py
   ```

5. **Start the FastAPI Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Start the Celery Worker** (in a separate terminal):
   ```bash
   source venv/bin/activate
   celery -A app.workers.celery_worker.celery_app worker --loglevel=info
   ```

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:8080`.

---

### Environment Variables

Create a `.env` file in the `backend/` directory using the template below:

```ini
# System Configuration
PROJECT_NAME="Sahaayak AI"
ENV=development
SECRET_KEY="your-super-secret-key-change-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES=115200

# Databases Connections
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/sahaayak"
REDIS_URL="redis://localhost:6379/0"

# Neo4j Graph Configuration
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="password"

# AI & Vector Storage
CHROMA_DB_PATH="./chroma_db"
NVIDIA_API_KEY="nvapi-your-nvidia-api-key-here"

# Celery Configuration
CELERY_BROKER_URL="redis://localhost:6379/0"
CELERY_RESULT_BACKEND="redis://localhost:6379/0"
```

---

## Testing & Verification

Sahaayak AI features a robust test suite covering database operations, AI services, and frontend routes.

### Running Backend Tests
To run unit and integration tests on the backend:
```bash
cd backend
pytest
```

### Running Frontend Compilation Check
To verify TypeScript compilation and build success:
```bash
cd frontend
npm run build
```

---

## Production Deployment & Scaling

Sahaayak AI is designed to scale horizontally across kubernetes nodes.

### Containerization with Docker

The system provides complete multi-stage `Dockerfile` and `docker-compose` setups.

#### Running the entire stack via Docker Compose:
```bash
docker-compose up --build
```

### Scaling Strategies

1. **Stateless FastAPI Gateways**: FastAPI application servers do not maintain local sessions. They can be scaled horizontally behind an NGINX or AWS ALB load balancer.
2. **Celery Worker Scaling**: Background task workers can be scaled independently based on Redis queue length. Compute-heavy tasks (like LLM RAG pipelines) are isolated from transactional API requests.
3. **Neo4j Read Replicas**: For high-read workloads, Neo4j Causal Clustering is utilized. Read queries are routed to read replicas, while write transactions are directed to the leader node.
4. **PostgreSQL Connection Pooling**: Utilize `PgBouncer` to manage high-concurrency database connections, preventing connection exhaustion under heavy API traffic.

---

### License

Distributed under the MIT License. See `LICENSE` for more information.
