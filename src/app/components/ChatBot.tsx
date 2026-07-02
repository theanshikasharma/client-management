import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown, Paperclip, Mic, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
}

interface ChatBotProps {
  user: { name: string; email: string; company: string; token: string };
}

const SYSTEM_CONTEXT = `You are the Deloitte Client Management System AI Assistant powered by Groq/Llama-3.1.

PROJECT OVERVIEW:
This is a full-stack AI-powered Client Management System built for Deloitte engagements.

ARCHITECTURE:
- Frontend: React + Vite + TypeScript + Tailwind CSS
- API Gateway: Spring Cloud Gateway (port 8080) - routes all requests
- User Service: Spring Boot (port 8081) - JWT authentication, user registration/login
- Task Service: Spring Boot (port 8082) - Task CRUD, AI chat, OTP verification
- Chatbot Service: Spring Boot (port 8084) - MCP orchestration
- Database: PostgreSQL - users table + tasks table
- AI: Groq API with Llama-3.1-8b-instant model

AVAILABLE APIs:
- POST /auth/register - Register new user
- POST /auth/login - Login, returns JWT token
- POST /otp/generate - Generate OTP (prints to backend console)
- POST /otp/verify - Verify OTP code
- GET /tasks - Get all tasks
- POST /tasks - Create task
- GET /tasks/{id} - Get task by ID
- PUT /tasks/{id} - Update task
- DELETE /tasks/{id} - Delete task
- GET /tasks/paged - Get tasks with pagination and sorting
- POST /ai/chat - AI chat endpoint (you)
- GET /admin/users - Get all users (admin)

TASK FIELDS: id, title, description, status (PENDING/IN_PROGRESS/DONE), priority (LOW/MEDIUM/HIGH), deadline, createdBy, createdAt, updatedAt

OTP FLOW:
1. User registers/logs in → JWT token returned
2. POST /otp/generate called with email → OTP printed in backend console
3. User enters OTP on frontend
4. POST /otp/verify validates OTP
5. On success → user enters portal

MCP ORCHESTRATION (Chatbot Service):
1. Intent Detection: CREATE_TASK, LIST_TASKS, TASK_STATUS, GENERAL
2. Entity Extraction: title, priority, deadline from natural language
3. Decision Engine: routes to correct microservice
4. OpenFeign: calls task-service from chatbot-service

CURRENT STATUS:
✅ Frontend Portal (Auth, Dashboard, AI Assistant, Team Messages, Admin Console)
✅ JWT Authentication end-to-end
✅ Task CRUD with PostgreSQL
✅ OTP verification (console-based, no SMTP)
✅ Real AI responses via Groq/Llama-3.1
✅ MCP orchestration layer
✅ API Gateway routing
✅ Admin console with real user/task data
⏳ Docker containerization (pending)
⏳ Unit tests (pending)
⏳ SMTP email for OTP (pending)

Answer questions about this project clearly and concisely. For task operations, confirm what was done.`;

function parseIntent(message: string): { type: string; data?: Record<string, string> } {
  const lower = message.toLowerCase();
  if (lower.includes("create") || lower.includes("add") || lower.includes("new task")) {
    const isHigh = lower.includes("high") || lower.includes("urgent");
    const isLow = lower.includes("low");
    const priority = isHigh ? "HIGH" : isLow ? "LOW" : "MEDIUM";
    const titleMatch =
      message.match(/task[—\-–:]\s*(.+)/i) ||
      message.match(/(?:create|add)\s+(?:a\s+)?(?:high|medium|low)?\s*(?:priority\s+)?task\s*[—\-–:]?\s*(.+)/i);
    const title = titleMatch
      ? titleMatch[1].replace(/tomorrow|today|next week/gi, "").trim()
      : message.slice(0, 60);
    const deadline = lower.includes("tomorrow")
      ? new Date(Date.now() + 86400000).toISOString().split("T")[0]
      : lower.includes("next week")
        ? new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
        : "";
    return { type: "CREATE_TASK", data: { title, priority, deadline } };
  }
  if (
    lower.includes("list") ||
    lower.includes("show") ||
    lower.includes("all tasks") ||
    lower.includes("my tasks")
  )
    return { type: "LIST_TASKS" };
  if (lower.includes("status") || lower.includes("progress") || lower.includes("pending"))
    return { type: "TASK_STATUS" };
  return { type: "AI_QUERY" };
}

async function callAI(message: string): Promise<string> {
  try {
    const r = await fetch("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `${SYSTEM_CONTEXT}\n\nUser question: ${message}` }),
    });
    if (!r.ok) throw new Error("AI failed");
    const data = await r.json();
    return data.reply || "Request processed.";
  } catch {
    return "AI response temporarily unavailable. Task operations still work!";
  }
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return (
          <strong key={j} style={{ color: "#86BC25", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      return part;
    });
    if (line === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="leading-relaxed">
        {rendered}
      </p>
    );
  });
}

function TaskCard({ task }: { task: Task }) {
  const pc = task.priority === "HIGH" ? "#EF4444" : task.priority === "LOW" ? "#86BC25" : "#E8A44A";
  const si =
    task.status === "DONE" ? (
      <CheckCircle2 size={12} style={{ color: "#86BC25" }} />
    ) : task.status === "IN_PROGRESS" ? (
      <Clock size={12} style={{ color: "#E8A44A" }} />
    ) : (
      <AlertCircle size={12} style={{ color: "#4A5568" }} />
    );
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-lg mt-1"
      style={{ background: "#0D1117", border: "1px solid rgba(134,188,37,0.1)" }}
    >
      <div className="flex items-center gap-2">
        {si}
        <span className="text-xs" style={{ color: "#C8D4B8" }}>
          {task.title}
        </span>
      </div>
      <span
        className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
        style={{ background: `${pc}20`, color: pc, border: `1px solid ${pc}40` }}
      >
        {task.priority}
      </span>
    </div>
  );
}

export function ChatBot({ user }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: `Hello ${user.name.split(" ")[0]}! 👋 I'm your Deloitte AI assistant powered by **Groq/Llama-3.1**.\n\nI can help you:\n• **Create & manage tasks** in PostgreSQL\n• **Answer questions** about this project architecture\n• **Explain** the OTP flow, API design, microservices\n\nTry asking: *"Explain this project architecture"* or *"Create high priority task — submit report"*`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchTasks() {
    try {
      const r = await fetch("/tasks");
      if (r.ok) {
        const data = await r.json();
        setTasks(data);
        return data;
      }
    } catch {}
    return [];
  }

  async function createTask(title: string, priority: string, deadline?: string) {
    try {
      const r = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          priority,
          status: "PENDING",
          deadline: deadline || null,
          createdBy: user.email,
        }),
      });
      if (r.ok) return await r.json();
    } catch {}
    return null;
  }

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    const loadingMsg: Message = {
      id: Date.now() + "_load",
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsTyping(true);

    const intent = parseIntent(text);
    let responseContent = "";

    if (intent.type === "CREATE_TASK" && intent.data) {
      const created = await createTask(intent.data.title, intent.data.priority, intent.data.deadline);
      if (created) {
        const aiConfirm = await callAI(
          `Confirm task created in one sentence: "${created.title}" with ${created.priority} priority.`
        );
        responseContent = `✅ ${aiConfirm}\n\n**Title:** ${created.title}\n**Priority:** ${created.priority}\n**Status:** PENDING${
          created.deadline ? `\n**Deadline:** ${created.deadline}` : ""
        }`;
      } else {
        responseContent = "❌ Could not create task. Check if backend is running on port 8082.";
      }
    } else if (intent.type === "LIST_TASKS") {
      const fetched = await fetchTasks();
      if (fetched.length > 0) {
        responseContent =
          `📋 **Found ${fetched.length} tasks in PostgreSQL:**\n\n` +
          fetched.map((t: Task) => `• **${t.title}** — ${t.priority} · ${t.status}`).join("\n");
        setShowTasks(true);
      } else {
        responseContent = 'No tasks found. Try: *"Create high priority task — submit audit report"*';
      }
    } else if (intent.type === "TASK_STATUS") {
      const fetched = await fetchTasks();
      const done = fetched.filter((t: Task) => t.status === "DONE").length;
      const pending = fetched.filter((t: Task) => t.status === "PENDING").length;
      const high = fetched.filter((t: Task) => t.priority === "HIGH").length;
      const pct = fetched.length > 0 ? Math.round((done / fetched.length) * 100) : 0;
      responseContent = `📊 **Task Status Report (Live from PostgreSQL):**\n\n**Total:** ${fetched.length}\n**Completion:** ${pct}%\n**Pending:** ${pending}\n**Done:** ${done}\n**High Priority:** ${high}`;
    } else {
      responseContent = await callAI(text);
    }

    setMessages((prev) => prev.map((m) => (m.isLoading ? { ...m, content: responseContent, isLoading: false } : m)));
    setIsTyping(false);
  };

  const SUGGESTED_PROMPTS = [
    "Explain this project architecture",
    "Create high priority task — demo presentation",
    "How does OTP verification work?",
    "What APIs are available?",
  ];

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(134,188,37,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{ background: "linear-gradient(135deg, #86BC25, #4A9B6F)" }}
          >
            <Bot size={18} style={{ color: "#0A0B0D" }} />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#111318]"
            />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: "#F0F2F0" }}>
              Deloitte AI Assistant
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#86BC25" }}>
              <Sparkles size={10} />
              <span>Groq/Llama-3.1 · MCP Orchestration · PostgreSQL</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchTasks();
              setShowTasks((s) => !s);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-[#1A1E24]"
            style={{ border: "1px solid rgba(134,188,37,0.2)", color: "#86BC25" }}
          >
            <Plus size={12} /> Tasks ({tasks.length})
          </button>
          <button
            onClick={() =>
              setMessages([
                {
                  id: "0",
                  role: "assistant",
                  content: `Conversation cleared. How can I help with your ${user.company} engagement?`,
                  timestamp: new Date(),
                },
              ])
            }
            className="p-2 rounded-lg hover:bg-[#1A1E24]"
          >
            <RefreshCw size={15} style={{ color: "#6B7A5E" }} />
          </button>
        </div>
      </div>

      {showTasks && tasks.length > 0 && (
        <div className="px-6 py-3 border-b" style={{ borderColor: "rgba(134,188,37,0.08)", background: "#0D1117" }}>
          <div className="text-xs font-semibold mb-2" style={{ color: "#86BC25" }}>
            Live tasks from PostgreSQL
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-left px-3 py-2.5 rounded-lg text-xs hover:border-[rgba(134,188,37,0.4)] hover:bg-[#1A1E24]"
                style={{ border: "1px solid rgba(134,188,37,0.12)", color: "#C8D4B8", background: "rgba(134,188,37,0.03)" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={msg.role === "assistant" ? { background: "linear-gradient(135deg,#86BC25,#4A9B6F)" } : { background: "#86BC25" }}
              >
                {msg.role === "user" ? (
                  <span className="text-xs font-bold text-[#0A0B0D]">{user.name[0]}</span>
                ) : (
                  <Bot size={14} style={{ color: "#0A0B0D" }} />
                )}
              </div>
              <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: "#86BC25", color: "#0A0B0D", borderRadius: "16px 16px 4px 16px" }
                      : {
                          background: "#1A1E24",
                          color: "#C8D4B8",
                          border: "1px solid rgba(134,188,37,0.1)",
                          borderRadius: "16px 16px 16px 4px",
                        }
                  }
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-1.5 py-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#86BC25]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                  )}
                </div>
                {msg.role === "assistant" && !msg.isLoading && (
                  <div className="flex items-center gap-1 px-1">
                    <button className="p-1 rounded hover:bg-[#1A1E24]">
                      <Copy size={11} style={{ color: "#4A5568" }} />
                    </button>
                    <button className="p-1 rounded hover:bg-[#1A1E24]">
                      <ThumbsUp size={11} style={{ color: "#4A5568" }} />
                    </button>
                    <button className="p-1 rounded hover:bg-[#1A1E24]">
                      <ThumbsDown size={11} style={{ color: "#4A5568" }} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-6 pb-6 pt-3">
        <div className="flex items-center gap-2 rounded-xl p-2 pl-4" style={{ background: "#1A1E24", border: "1px solid rgba(134,188,37,0.15)" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about the project or create a task..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-[#4A5568]"
            style={{ color: "#F0F2F0" }}
            disabled={isTyping}
          />
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[#2D3440]">
              <Paperclip size={14} style={{ color: "#4A5568" }} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#2D3440]">
              <Mic size={14} style={{ color: "#4A5568" }} />
            </button>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-40"
              style={{ background: "#86BC25" }}
            >
              <Send size={14} style={{ color: "#0A0B0D" }} />
            </button>
          </div>
        </div>
        <p className="text-center mt-2 text-xs" style={{ color: "#2D3440" }}>
          Powered by Groq/Llama-3.1 · MCP Orchestration · PostgreSQL
        </p>
      </div>
    </div>
  );
}

