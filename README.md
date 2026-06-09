# Client Management System — Deloitte

AI-powered task management system built with Spring Boot, PostgreSQL, and React.

## Backend
- Spring Boot 3 + PostgreSQL
- REST APIs: POST /tasks, GET /tasks, GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}
- JPA entities, DTOs, service layer, exception handling

## Frontend
- React + Vite + Tailwind
- Deloitte-branded portal with Auth, Dashboard, AI ChatBot
- ChatBot wired to real backend (creates/lists tasks in PostgreSQL)

## Run locally
### Backend
cd backend && ./gradlew bootRun

### Frontend  
cd frontend && npm run dev
