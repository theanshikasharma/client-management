# Requirements — Deloitte Client Management System

## Functional Requirements

### FR-1: User Authentication
- FR-1.1: Users must be able to register with name, email, password, and company
- FR-1.2: Passwords must be hashed using BCrypt before storage
- FR-1.3: Successful registration/login must return a signed JWT token
- FR-1.4: JWT must contain email and role claims, expire in 24 hours
- FR-1.5: Users must verify identity via OTP before accessing portal
- FR-1.6: OTP must be 6 digits, stored in-memory, expire after use

### FR-2: Task Management
- FR-2.1: Users must be able to create tasks with title, description, priority, deadline
- FR-2.2: Tasks must support three statuses: PENDING, IN_PROGRESS, DONE
- FR-2.3: Tasks must support three priorities: LOW, MEDIUM, HIGH
- FR-2.4: System must support paginated task retrieval with sorting
- FR-2.5: Tasks must be persisted in PostgreSQL with audit timestamps
- FR-2.6: Users must be able to update and delete tasks

### FR-3: AI ChatBot
- FR-3.1: System must detect user intent from natural language
- FR-3.2: Supported intents: CREATE_TASK, LIST_TASKS, TASK_STATUS, GENERAL
- FR-3.3: System must extract entities: title, priority, deadline from messages
- FR-3.4: CREATE_TASK intent must create real task in PostgreSQL
- FR-3.5: General queries must be answered by Groq/Llama-3.1 AI
- FR-3.6: AI must understand full project architecture via system context

### FR-4: Document Intelligence
- FR-4.1: Users must be able to upload documents to MinIO object store
- FR-4.2: Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
- FR-4.3: Maximum file size: 10MB
- FR-4.4: System must extract text from documents using Apache Tika
- FR-4.5: AI must generate summary, action items, and priorities from document
- FR-4.6: Users must be able to download and delete files
- FR-4.7: File list must show all uploaded files with size and date

### FR-5: Dashboard
- FR-5.1: Dashboard must show real KPIs from live database
- FR-5.2: KPIs: total tasks, completion %, high priority count, in-progress count
- FR-5.3: Charts must be built from real task timestamps
- FR-5.4: Recent tasks list must reflect current database state

### FR-6: Admin Console
- FR-6.1: Admin must be able to view all registered users from database
- FR-6.2: Admin must be able to view all tasks with full metadata
- FR-6.3: System status panel must show all microservices and ports
- FR-6.4: Admin endpoints must require JWT authentication

### FR-7: Team Messages
- FR-7.1: Users must be able to send messages to Deloitte team members
- FR-7.2: System must support direct messages and channels
- FR-7.3: Unread message counts must be displayed per thread

## Non-Functional Requirements

### NFR-1: Security
- NFR-1.1: All passwords must be BCrypt hashed (strength 10+)
- NFR-1.2: JWT tokens must use HMAC-SHA256 signing
- NFR-1.3: API keys must be stored in environment variables, never in code
- NFR-1.4: CORS must be configured to allow only known origins
- NFR-1.5: CSRF protection must be disabled for stateless REST APIs
- NFR-1.6: File uploads must validate type and size on both client and server

### NFR-2: Performance
- NFR-2.1: Backend services must start within 10 seconds
- NFR-2.2: Task API responses must complete within 500ms
- NFR-2.3: File uploads up to 10MB must complete within 30 seconds
- NFR-2.4: AI responses must complete within 10 seconds

### NFR-3: Scalability
- NFR-3.1: System must follow microservices architecture for independent scaling
- NFR-3.2: Object storage must use S3-compatible MinIO for horizontal scaling
- NFR-3.3: Database connections must use HikariCP connection pooling

### NFR-4: Maintainability
- NFR-4.1: All services must expose health check endpoints
- NFR-4.2: Configuration must use Spring profiles (local/prod)
- NFR-4.3: All secrets must be configurable via environment variables
- NFR-4.4: API documentation must be auto-generated via SpringDoc/Swagger

### NFR-5: Deployability
- NFR-5.1: Task service must be containerizable via Dockerfile
- NFR-5.2: Full stack must be orchestratable via docker-compose
- NFR-5.3: CI pipeline must build and test on every push to main

## Technical Constraints
- TC-1: Java 21 (LTS) for all Spring Boot services
- TC-2: Node.js 20 for frontend build
- TC-3: PostgreSQL 16 as primary database
- TC-4: MinIO as S3-compatible object store
- TC-5: Groq API with Llama-3.1-8b-instant model for AI features
- TC-6: React 18 with Vite for frontend build tooling

## File Validation Rules
| Rule | Value |
|-------|-------|
| Allowed extensions | .pdf, .doc, .docx, .txt, .png, .jpg, .jpeg |
| Maximum file size | 10 MB |
| Minimum file size | 1 byte |
| Validation layers | Frontend (instant) + Backend (secure) |

## API Response Standards
- All responses use JSON
- Success responses: HTTP 200 with data
- Validation errors: HTTP 400 with error message
- Auth errors: HTTP 401/403
- Not found: HTTP 404
- Server errors: HTTP 500 with sanitized message

