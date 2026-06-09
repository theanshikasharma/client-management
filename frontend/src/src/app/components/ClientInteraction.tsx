import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Paperclip, Search, Phone, Video, MoreVertical, Circle, CheckCheck, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  sender: "client" | "employee";
  name: string;
  content: string;
  timestamp: string;
  read: boolean;
  avatar: string;
}

interface Thread {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const THREADS: Thread[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Engagement Lead · Director",
    avatar: "PS",
    lastMessage: "The revised architecture doc has been uploaded. Please review by EOD.",
    time: "10:42 AM",
    unread: 2,
    online: true,
    messages: [
      { id: "1", sender: "employee", name: "Priya Sharma", content: "Good morning! I've reviewed the data migration plan you sent yesterday. The approach looks solid — we just need to align on the rollback strategy before we finalize.", timestamp: "9:15 AM", read: true, avatar: "PS" },
      { id: "2", sender: "client", name: "You", content: "Thanks Priya. We're comfortable with a 4-hour rollback window. Can we schedule a call this week to walk through the edge cases?", timestamp: "9:32 AM", read: true, avatar: "YO" },
      { id: "3", sender: "employee", name: "Priya Sharma", content: "Absolutely. Thursday 3 PM IST works for me. I'll send a calendar invite with the conference bridge details.", timestamp: "9:48 AM", read: true, avatar: "PS" },
      { id: "4", sender: "employee", name: "Priya Sharma", content: "The revised architecture doc has been uploaded to the shared workspace. Please review by EOD and flag any concerns.", timestamp: "10:42 AM", read: false, avatar: "PS" },
    ]
  },
  {
    id: "2",
    name: "James Kowalski",
    role: "Technical Lead · Senior Manager",
    avatar: "JK",
    lastMessage: "API spec v2 is ready for your team's review. 47 endpoints documented.",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      { id: "1", sender: "employee", name: "James Kowalski", content: "Hey — I've finalized the API spec v2. We've documented all 47 endpoints with request/response schemas, error codes, and rate limiting details. Your dev team should have everything they need.", timestamp: "Yesterday 4:20 PM", read: true, avatar: "JK" },
      { id: "2", sender: "client", name: "You", content: "Great work James. We'll have our team review it by Monday. One question — does it cover the webhook integration for real-time event streaming?", timestamp: "Yesterday 4:35 PM", read: true, avatar: "YO" },
      { id: "3", sender: "employee", name: "James Kowalski", content: "Yes, section 8 covers webhooks extensively. I also added a Postman collection you can import directly. Link is in the doc header.", timestamp: "Yesterday 4:41 PM", read: true, avatar: "JK" },
    ]
  },
  {
    id: "3",
    name: "Ananya Iyer",
    role: "Strategy Advisor · Principal",
    avatar: "AI",
    lastMessage: "Stakeholder alignment deck is ready. Executive summary updated.",
    time: "Jun 6",
    unread: 1,
    online: true,
    messages: [
      { id: "1", sender: "employee", name: "Ananya Iyer", content: "The stakeholder alignment deck is ready for your review. I've updated the executive summary to reflect the revised ROI projections — we're now showing a 340% 3-year ROI based on the latest benchmarks.", timestamp: "Jun 6, 2:15 PM", read: false, avatar: "AI" },
    ]
  },
  {
    id: "4",
    name: "Deloitte Project Team",
    role: "Group · 5 members",
    avatar: "DT",
    lastMessage: "Sprint 7 retrospective notes shared. Next sprint planning: Jun 10.",
    time: "Jun 5",
    unread: 0,
    online: true,
    messages: [
      { id: "1", sender: "employee", name: "James Kowalski", content: "Sprint 7 retrospective notes have been shared in the workspace. Key wins: API gateway deployed, auth module completed. Blockers cleared: database schema finalized.", timestamp: "Jun 5, 11:30 AM", read: true, avatar: "JK" },
      { id: "2", sender: "employee", name: "Priya Sharma", content: "Next sprint planning session is scheduled for June 10, 10 AM IST. Sprint 8 focus: UAT preparation and performance testing. Please ensure your QA team is available.", timestamp: "Jun 5, 12:00 PM", read: true, avatar: "PS" },
    ]
  }
];

interface ClientInteractionProps {
  user: { name: string; email: string; company: string };
}

export function ClientInteraction({ user }: ClientInteractionProps) {
  const [threads, setThreads] = useState<Thread[]>(THREADS);
  const [activeThread, setActiveThread] = useState<Thread>(THREADS[0]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const filtered = threads.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.role.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "client",
      name: "You",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      avatar: "YO",
    };
    const updatedThread = { ...activeThread, messages: [...activeThread.messages, newMsg], lastMessage: input, time: "Just now" };
    setActiveThread(updatedThread);
    setThreads(prev => prev.map(t => t.id === activeThread.id ? updatedThread : t));
    setInput("");
    // Simulate response
    setTimeout(() => {
      const resp: Message = {
        id: Date.now().toString() + "_r",
        sender: "employee",
        name: activeThread.name,
        content: "Thanks for reaching out. I'll review this and get back to you shortly. If it's urgent, please flag it as high priority.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        avatar: activeThread.avatar,
      };
      const t2 = { ...updatedThread, messages: [...updatedThread.messages, resp], lastMessage: resp.content };
      setActiveThread(t2);
      setThreads(prev => prev.map(t => t.id === activeThread.id ? t2 : t));
    }, 2000);
  };

  const selectThread = (thread: Thread) => {
    const cleared = { ...thread, unread: 0 };
    setActiveThread(cleared);
    setThreads(prev => prev.map(t => t.id === thread.id ? cleared : t));
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#0A0B0D' }}>
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ background: '#0D1117', borderColor: 'rgba(134,188,37,0.1)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(134,188,37,0.08)' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: '#F0F2F0' }}>Messages</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4A5568' }} />
            <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg py-2 text-xs focus:outline-none focus:ring-1"
              style={{ background: '#1A1E24', border: '1px solid rgba(134,188,37,0.1)', color: '#F0F2F0', paddingLeft: '32px', '--tw-ring-color': 'rgba(134,188,37,0.3)' } as React.CSSProperties} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((thread) => (
            <button key={thread.id} onClick={() => selectThread(thread)}
              className="w-full text-left px-4 py-3 transition-colors hover:bg-[#1A1E24] relative"
              style={activeThread.id === thread.id ? { background: 'rgba(134,188,37,0.07)', borderRight: '2px solid #86BC25' } : {}}>
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #1A2E0A, #2D4A1A)', color: '#86BC25', border: '1px solid rgba(134,188,37,0.2)' }}>
                    {thread.avatar}
                  </div>
                  {thread.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0D1117]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold truncate" style={{ color: '#F0F2F0' }}>{thread.name}</span>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: '#4A5568' }}>{thread.time}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: '#6B7A5E' }}>{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: '#86BC25', color: '#0A0B0D' }}>
                    {thread.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(134,188,37,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #1A2E0A, #2D4A1A)', color: '#86BC25', border: '1px solid rgba(134,188,37,0.2)' }}>
                {activeThread.avatar}
              </div>
              {activeThread.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#111318]" />}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#F0F2F0' }}>{activeThread.name}</div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7A5E' }}>
                {activeThread.online && <Circle size={6} className="fill-emerald-400 text-emerald-400" />}
                {activeThread.role}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg transition-colors hover:bg-[#1A1E24]"><Phone size={15} style={{ color: '#6B7A5E' }} /></button>
            <button className="p-2 rounded-lg transition-colors hover:bg-[#1A1E24]"><Video size={15} style={{ color: '#6B7A5E' }} /></button>
            <button className="p-2 rounded-lg transition-colors hover:bg-[#1A1E24]"><MoreVertical size={15} style={{ color: '#6B7A5E' }} /></button>
          </div>
        </div>

        {/* Engagement context banner */}
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg flex items-center justify-between"
          style={{ background: 'rgba(134,188,37,0.05)', border: '1px solid rgba(134,188,37,0.1)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7A5E' }}>
            <span>Engagement:</span>
            <span style={{ color: '#86BC25', fontWeight: 500 }}>Digital Transformation — Phase 2</span>
            <span>·</span>
            <span style={{ color: '#C8D4B8' }}>{user.company}</span>
          </div>
          <button className="text-xs flex items-center gap-1" style={{ color: '#6B7A5E' }}>
            View details <ChevronDown size={11} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {activeThread.messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.sender === 'client' ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                  style={msg.sender === 'client'
                    ? { background: '#86BC25', color: '#0A0B0D' }
                    : { background: 'linear-gradient(135deg, #1A2E0A, #2D4A1A)', color: '#86BC25', border: '1px solid rgba(134,188,37,0.2)' }}>
                  {msg.avatar}
                </div>
                <div className={`max-w-[72%] flex flex-col gap-1 ${msg.sender === 'client' ? 'items-end' : ''}`}>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={msg.sender === 'client'
                      ? { background: '#86BC25', color: '#0A0B0D', borderRadius: '18px 18px 4px 18px' }
                      : { background: '#1A1E24', color: '#C8D4B8', border: '1px solid rgba(134,188,37,0.1)', borderRadius: '18px 18px 18px 4px' }}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 px-1 text-xs" style={{ color: '#4A5568' }}>
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'client' && <CheckCheck size={11} style={{ color: msg.read ? '#86BC25' : '#4A5568' }} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-3">
          <div className="flex items-center gap-2 rounded-xl p-2 pl-4"
            style={{ background: '#1A1E24', border: '1px solid rgba(134,188,37,0.15)' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={`Message ${activeThread.name}...`}
              className="flex-1 bg-transparent text-sm focus:outline-none"
              style={{ color: '#F0F2F0' }} />
            <button className="p-1.5 rounded-lg hover:bg-[#2D3440]"><Paperclip size={14} style={{ color: '#4A5568' }} /></button>
            <button onClick={sendMessage} disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: '#86BC25' }}>
              <Send size={14} style={{ color: '#0A0B0D' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
