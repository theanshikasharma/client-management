import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown, Paperclip, Mic, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const HF_TOKEN = "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";
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.1";

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
  createdAt?: string;
}

interface ChatBotProps {
  user: { name: string; email: string; company: string; token: string };
}

function parseIntent(message: string): { type: string; data?: Record<string, string> } {
  const lower = message.toLowerCase();
  if (lower.includes("create") || lower.includes("add") || lower.includes("new task")) {
    const isHigh = lower.includes("high") || lower.includes("urgent");
    const isLow = lower.includes("low");
    const priority = isHigh ? "HIGH" : isLow ? "LOW" : "MEDIUM";
    const titleMatch = message.match(/task[—\-–:]\s*(.+)/i) ||
      message.match(/(?:create|add)\s+(?:a\s+)?(?:high|medium|low)?\s*(?:priority\s+)?task\s*[—\-–:]?\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].replace(/tomorrow|today|next week/gi, "").trim() : message.slice(0, 60);
    const deadline = lower.includes("tomorrow")
      ? new Date(Date.now() + 86400000).toISOString().split("T")[0]
      : lower.includes("next week") ? new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] : "";
    return { type: "CREATE_TASK", data: { title, priority, deadline } };
  }
  if (lower.includes("list") || lower.includes("show") || lower.includes("all tasks") || lower.includes("my tasks")) return { type: "LIST_TASKS" };
  if (lower.includes("status") || lower.includes("progress") || lower.includes("pending")) return { type: "TASK_STATUS" };
  return { type: "AI_QUERY" };
}

async function callHuggingFace(prompt: string): Promise<string> {
  try {
    const r = await fetch(`/ai/chat`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 150, temperature: 0.7, return_full_text: false } }),
    });
    if (!r.ok) throw new Error("HF failed");
    const data = await r.json();
    if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text.trim();
    if (data.generated_text) return data.generated_text.trim();
    return "I processed your request.";
  } catch {
    return "AI response unavailable. Task operations still work!";
  }
}

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={j} style={{ color: '#86BC25', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      return part;
    });
    if (line === '') return <div key={i} className="h-2" />;
    return <p key={i} className="leading-relaxed">{rendered}</p>;
  });
}

function TaskCard({ task }: { task: Task }) {
  const priorityColor = task.priority === "HIGH" ? "#EF4444" : task.priority === "LOW" ? "#86BC25" : "#E8A44A";
  const statusIcon = task.status === "DONE" ? <CheckCircle2 size={12} style={{ color: '#86BC25' }} /> :
    task.status === "IN_PROGRESS" ? <Clock size={12} style={{ color: '#E8A44A' }} /> :
    <AlertCircle size={12} style={{ color: '#4A5568' }} />;
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg mt-1" style={{ background: '#0D1117', border: '1px solid rgba(134,188,37,0.1)' }}>
      <div className="flex items-center gap-2">{statusIcon}<span className="text-xs" style={{ color: '#C8D4B8' }}>{task.title}</span></div>
      <span className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
        style={{ background: `${priorityColor}20`, color: priorityColor, border: `1px solid ${priorityColor}40` }}>{task.priority}</span>
    </div>
  );
}

export function ChatBot({ user }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: "0", role: "assistant",
    content: `Hello ${user.name.split(' ')[0]}! 👋 I'm your Deloitte AI assistant powered by **Mistral-7B**. I can create tasks, list tasks, check status, or answer questions. Try: *"Create high priority task — submit audit report tomorrow"*`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function fetchTasks() {
    try {
      const r = await fetch("/tasks");
      if (r.ok) { const data = await r.json(); setTasks(data); return data; }
    } catch {}
    return [];
  }

  async function createTask(title: string, priority: string, deadline?: string) {
    try {
      const r = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, status: "PENDING", deadline: deadline || null, createdBy: user.email }),
      });
      if (r.ok) return await r.json();
    } catch {}
    return null;
  }

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    const loadingMsg: Message = { id: Date.now() + "_load", role: "assistant", content: "", timestamp: new Date(), isLoading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsTyping(true);

    const intent = parseIntent(text);
    let responseContent = "";

    if (intent.type === "CREATE_TASK" && intent.data) {
      const created = await createTask(intent.data.title, intent.data.priority, intent.data.deadline);
      if (created) {
        const aiConfirm = await callHuggingFace(`Confirm task created: "${created.title}" with ${created.priority} priority. One sentence.`);
        responseContent = `✅ ${aiConfirm}\n\n**Title:** ${created.title}\n**Priority:** ${created.priority}\n**Status:** PENDING${created.deadline ? `\n**Deadline:** ${created.deadline}` : ""}`;
      } else {
        responseContent = "❌ Could not create task. Check if backend is running.";
      }
    } else if (intent.type === "LIST_TASKS") {
      const fetched = await fetchTasks();
      if (fetched.length > 0) {
        responseContent = `📋 **Found ${fetched.length} tasks in database:**\n\n` +
          fetched.map((t: Task) => `• **${t.title}** — ${t.priority} · ${t.status}`).join("\n");
        setShowTasks(true);
      } else {
        responseContent = "No tasks found. Try creating one!";
      }
    } else if (intent.type === "TASK_STATUS") {
      const fetched = await fetchTasks();
      const done = fetched.filter((t: Task) => t.status === "DONE").length;
      const pending = fetched.filter((t: Task) => t.status === "PENDING").length;
      const high = fetched.filter((t: Task) => t.priority === "HIGH").length;
      const pct = fetched.length > 0 ? Math.round((done / fetched.length) * 100) : 0;
      responseContent = `📊 **Task Status Report:**\n\n**Total:** ${fetched.length}\n**Completion:** ${pct}%\n**Pending:** ${pending}\n**Done:** ${done}\n**High Priority:** ${high}`;
    } else {
      responseContent = await callHuggingFace(`You are a Deloitte AI assistant for task management. Answer briefly and professionally: ${text}`);
    }

    setMessages(prev => prev.map(m => m.isLoading ? { ...m, content: responseContent, isLoading: false } : m));
    setIsTyping(false);
  };

  const SUGGESTED_PROMPTS = [
    "Show all my tasks",
    "Create high priority task — submit audit report tomorrow",
    "What is the status of my tasks?",
    "What is task management?",
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(134,188,37,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #86BC25, #4A9B6F)' }}>
            <Bot size={18} style={{ color: '#0A0B0D' }} />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#111318]" />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#F0F2F0' }}>Deloitte AI Assistant</div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#86BC25' }}>
              <Sparkles size={10} />
              <span>Mistral-7B · MCP Orchestration · Live DB</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchTasks(); setShowTasks(s => !s); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-[#1A1E24]"
            style={{ border: '1px solid rgba(134,188,37,0.2)', color: '#86BC25' }}>
            <Plus size={12} /> Tasks ({tasks.length})
          </button>
          <button onClick={() => setMessages([{ id: "0", role: "assistant", content: `Conversation cleared. How can I help with your ${user.company} engagement?`, timestamp: new Date() }])}
            className="p-2 rounded-lg hover:bg-[#1A1E24]">
            <RefreshCw size={15} style={{ color: '#6B7A5E' }} />
          </button>
        </div>
      </div>

      {showTasks && tasks.length > 0 && (
        <div className="px-6 py-3 border-b" style={{ borderColor: 'rgba(134,188,37,0.08)', background: '#0D1117' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: '#86BC25' }}>Live tasks from PostgreSQL</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {tasks.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="text-left px-3 py-2.5 rounded-lg text-xs hover:border-[rgba(134,188,37,0.4)] hover:bg-[#1A1E24]"
                style={{ border: '1px solid rgba(134,188,37,0.12)', color: '#C8D4B8', background: 'rgba(134,188,37,0.03)' }}>
                {p}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={msg.role === 'assistant' ? { background: 'linear-gradient(135deg, #86BC25, #4A9B6F)' } : { background: '#86BC25' }}>
                {msg.role === 'user' ? <span className="text-xs font-bold text-[#0A0B0D]">{user.name[0]}</span> : <Bot size={14} style={{ color: '#0A0B0D' }} />}
              </div>
              <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: '#86BC25', color: '#0A0B0D', borderRadius: '16px 16px 4px 16px' }
                    : { background: '#1A1E24', color: '#C8D4B8', border: '1px solid rgba(134,188,37,0.1)', borderRadius: '16px 16px 16px 4px' }}>
                  {msg.isLoading
                    ? <div className="flex items-center gap-1.5 py-1">{[0,1,2].map(i => <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#86BC25]" animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />)}</div>
                    : <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>}
                </div>
                {msg.role === 'assistant' && !msg.isLoading && (
                  <div className="flex items-center gap-1 px-1">
                    <button className="p-1 rounded hover:bg-[#1A1E24]"><Copy size={11} style={{ color: '#4A5568' }} /></button>
                    <button className="p-1 rounded hover:bg-[#1A1E24]"><ThumbsUp size={11} style={{ color: '#4A5568' }} /></button>
                    <button className="p-1 rounded hover:bg-[#1A1E24]"><ThumbsDown size={11} style={{ color: '#4A5568' }} /></button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-6 pb-6 pt-3">
        <div className="flex items-center gap-2 rounded-xl p-2 pl-4" style={{ background: '#1A1E24', border: '1px solid rgba(134,188,37,0.15)' }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask me anything or create a task..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-[#4A5568]"
            style={{ color: '#F0F2F0' }} disabled={isTyping} />
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[#2D3440]"><Paperclip size={14} style={{ color: '#4A5568' }} /></button>
            <button className="p-1.5 rounded-lg hover:bg-[#2D3440]"><Mic size={14} style={{ color: '#4A5568' }} /></button>
            <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-40"
              style={{ background: '#86BC25' }}>
              <Send size={14} style={{ color: '#0A0B0D' }} />
            </button>
          </div>
        </div>
        <p className="text-center mt-2 text-xs" style={{ color: '#2D3440' }}>
          Powered by Mistral-7B · MCP Orchestration · PostgreSQL
        </p>
      </div>
    </div>
  );
}
