# Sahaayak AI Production Architecture (v2.0)

## Overview
Sahaayak AI operates on a highly available, containerized microservices architecture. It incorporates ML models, real-time analytics, and robust security suitable for national scale.

## Core Infrastructure
*   **Frontend**: Next.js/Vite deployed on Vercel Edge Network.
*   **Backend API**: FastAPI (Async) deployed on Render/Railway.
*   **Database (Transactional)**: PostgreSQL (Neon Serverless).
*   **Database (Graph)**: Neo4j Aura for the Education Knowledge Graph.
*   **Database (Vector)**: ChromaDB (Persistent Volume) for RAG.
*   **Cache & Message Broker**: Redis (Upstash) for Dashboard/Mentor matching cache and Celery workers.
*   **Background Jobs**: Celery/APScheduler for daily risk predictions and scholarship scans.

## Observability Stack
*   **Prometheus**: Scrapes metrics from FastAPI endpoints, worker queues, and database latency.
*   **Grafana**: Dashboards visualizing API usage, ML prediction latency, and error rates.
*   **Sentry**: Application-level error tracking and tracing.
*   **MLflow**: Tracking model drift, prediction accuracy, and MLOps registry.

## Security Architecture
*   **Authentication**: JWT with short-lived access tokens and refresh rotation.
*   **RBAC**: 5-tier role system (Student, Mentor, Parent, Admin, Moderator).
*   **API Security**: Rate limiting, Helmet headers, CORS policies, Input Sanitization.
*   **Auditing**: Comprehensive `AuditLog` table tracking IP, User-Agent, and Actions.

## Disaster Recovery
*   Automated daily snapshots of PostgreSQL.
*   Weekly exports of Neo4j graph data.
*   Persistent backups of Vector Embeddings in S3 buckets.
