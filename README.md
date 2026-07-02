# Deloitte Client Management System

An AI-powered, full-stack enterprise Client Management System built with Spring Boot microservices, React, PostgreSQL, MinIO object storage, and Groq/Llama-3.1 AI.

![Auth](docs/auth.png)

## 🏗️ Architecture

```
Browser (React/Vite :5173)
         ↓
API Gateway (Spring Cloud :8080)
         ↓
┌────────────────────────────────────┐
│  User Service  │  Task Service     │
│    :8081       │    :8082          │
│  JWT + Auth    │  CRUD + AI + OTP  │
│                │  MinIO + Tika     │
└────────┬───────┴────────┬──────────┘
         ↓                ↓
    PostgreSQL        MinIO (Docker)
    users table       deloitte-files
    tasks table            ↓
                     Groq/Llama-3.1
```

## 📁 Repository Structure

```
client-management/
├── frontend/                          # React + Vite + TypeScript UI
│   ├── src/app/components/
│   │   ├── AuthPage.tsx               # Login, Register, OTP verification
│   │   ├── Dashboard.tsx              # Main portal: overview, charts, KPIs
│   │   ├── ChatBot.tsx                # AI assistant with MCP orchestration
│   │   ├── ClientInteraction.tsx      # Searchable tasks grid
│   │   ├── DocumentsPage.tsx          # MinIO file upload + AI analysis
│   │   └── AdminPage.tsx              # Admin console: users, tasks, system
│   └── vite.config.ts                 # Vite proxy config (dev routing)
│
├── backend/                           # Task Service (main Spring Boot app)
│   └── src/main/java/backend/task/manager/
│       ├── controller/
│       │   ├── TaskController.java     # GET/POST/PUT/DELETE /tasks
│       │   ├── AiChatController.java   # POST /ai/chat → Groq API
│       │   ├── OtpController.java      # POST /otp/generate, /otp/verify
│       │   ├── FileController.java     # POST /files/upload, analyze, delete
│       │   └── AdminController.java    # GET /admin/stats
│       ├── service/
│       │   ├── impl/TaskServiceImpl.java          # Task CRUD logic
│       │   ├── impl/HuggingFaceChatServiceImpl.java # Groq AI integration
│       │   └── FileService.java                   # MinIO + Tika logic
│       └── config/
│           ├── MinioConfig.java        # MinIO client bean
│           └── RestClientConfig.java   # RestTemplate + ObjectMapper beans
│       └── entity/Task.java            # Task JPA entity
│
├── microservices/
│   ├── user-service/                  # Authentication microservice (:8081)
│   │   └── src/main/java/backend/user/service/
│   │       ├── controller/
│   │       │   ├── AuthController.java      # POST /auth/register, /auth/login
│   │       │   └── AdminUserController.java # GET /admin/users
│   │       ├── config/
│   │       │   ├── JwtUtil.java        # JWT generate, validate, extract claims
│   │       │   └── SecurityConfig.java # Spring Security + CORS config
│   │       └── entity/User.java        # User JPA entity (id, name, email, role)
│   │       └── repository/UserRepository.java
│   │
│   └── chatbot-service/               # MCP orchestration microservice (:8084)
│       └── src/main/java/backend/chatbot/service/
│           ├── controller/ChatbotController.java  # POST /chat/process
│           ├── service/McpOrchestrationService.java # Intent + Entity + Decision
│           └── config/TaskServiceClient.java      # OpenFeign client
│
│   └── api-gateway/                   # Spring Cloud Gateway (:8080)
│       └── src/main/resources/application.yml     # Route definitions
│
├── docker-compose.yml                 # Full stack: PostgreSQL + MinIO + app
├── Dockerfile                         # Multi-stage build for task-service
└── .github/workflows/ci.yml          # GitHub Actions CI pipeline
```

## 🚀 Features

### ✅ Authentication & OTP
- JWT-based register/login via user-service
- OTP generated and printed to backend console (no SMTP needed)
- BCrypt password hashing
- Token stored in localStorage

### ✅ Task Management
- Full CRUD with PostgreSQL persistence
- Priority: HIGH / MEDIUM / LOW
- Status: PENDING / IN_PROGRESS / DONE
- Pagination, sorting, filtering
- Real-time dashboard KPIs

### ✅ AI ChatBot (MCP Orchestration)
- Intent Detection: CREATE_TASK, LIST_TASKS, TASK_STATUS, GENERAL
- Entity Extraction: title, priority, deadline from natural language
- Decision Engine routes to correct microservice
- Groq/Llama-3.1 for general AI responses
- OpenFeign communication between services

### ✅ Document Intelligence (MinIO + AI)
- Upload PDF, DOCX, TXT, images to MinIO object store
- Apache Tika extracts text from any document format
- Groq/Llama-3.1 generates summary, action items, priorities
- Download and delete files
- Frontend + backend file validation (type, size)

### ✅ Admin Console
- Real users from PostgreSQL via JWT-authenticated endpoint
- Real task data with full metadata
- Microservices status panel
- Task distribution charts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Auth Service | Spring Boot 3.4.1, Spring Security, JJWT 0.11.5 |
| Task Service | Spring Boot 4.0.6, Spring Web MVC |
| Chatbot Service | Spring Boot, OpenFeign |
| API Gateway | Spring Cloud Gateway |
| ORM | Spring Data JPA, Hibernate 7 |
| Database | PostgreSQL 16 |
| Object Storage | MinIO (Docker, S3-compatible) |
| Document Parsing | Apache Tika 2.9.1 |
| AI Model | Groq API, Llama-3.1-8b-instant |
| Containerization | Docker, docker-compose |
| CI/CD | GitHub Actions |

## ⚙️ Running Locally

### Prerequisites
- Java 21, Node.js 20, PostgreSQL 16, Docker

### 1. Start PostgreSQL
```bash
brew services start postgresql@16
```

### 2. Start MinIO
```bash
docker start minio
# Or first time:
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  -v ~/minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
docker exec minio mc alias set local http://localhost:9000 minioadmin minioadmin123
docker exec minio mc mb local/deloitte-files
```

### 3. Start Task Service (port 8082)
```bash
cd backend  # or ~/Downloads/task-manager\ 2
export GROQ_API_KEY=your_groq_key_here
./gradlew bootRun
```

### 4. Start User Service (port 8081)
```bash
cd microservices/user-service  # or ~/Downloads/user-service
./gradlew bootRun
```

### 5. Start Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

### 6. Open in browser
```
http://localhost:5173
```

## 🔑 Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | Task Service | Groq API key for Llama-3.1 |
| `SPRING_DATASOURCE_URL` | All | PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | All | DB username |
| `SPRING_DATASOURCE_PASSWORD` | All | DB password |
| `MINIO_ENDPOINT` | Task Service | MinIO server URL |
| `MINIO_ACCESS_KEY` | Task Service | MinIO access key |
| `MINIO_SECRET_KEY` | Task Service | MinIO secret key |
| `MINIO_BUCKET` | Task Service | MinIO bucket name |

## 📡 API Reference

### Auth (user-service :8081)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/health` | Service health check |
| GET | `/admin/users` | List all users |

### Tasks (task-service :8082)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create task |
| GET | `/tasks/{id}` | Get task by ID |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| GET | `/tasks/paged` | Paginated tasks |
| GET | `/tasks/health` | Health check |

### AI & OTP (task-service :8082)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Chat with Groq/Llama AI |
| POST | `/otp/generate` | Generate OTP (console log) |
| POST | `/otp/verify` | Verify OTP |

### Files (task-service :8082)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/files/upload` | Upload to MinIO |
| GET | `/files/list` | List files in bucket |
| GET | `/files/download/{name}` | Download file |
| DELETE | `/files/delete/{name}` | Delete file |
| POST | `/files/analyze/{name}` | AI analysis via Tika + Groq |

## 🧪 Demo Credentials
```
Email: anshika2026@test.com
Password: password123
```

## 📊 Project Status

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| OTP Verification | ✅ |
| Task CRUD + Pagination | ✅ |
| AI ChatBot + MCP | ✅ |
| Document Upload (MinIO) | ✅ |
| AI Document Analysis | ✅ |
| Admin Console | ✅ |
| Dashboard Real Data | ✅ |
| Docker + CI/CD | ✅ |
| SMTP Email OTP | ⏳ |
| Role-Based Access Control | ⏳ |
| Unit Tests | ⏳ |

## 👩‍💻 Author
**Anshika Sharma** — Deloitte Intern
GitHub: [@theanshikasharma](https://github.com/theanshikasharma)

