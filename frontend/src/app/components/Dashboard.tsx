import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, MessageSquare, Users, ClipboardList, FolderOpen,
  Bell, Settings, LogOut, ChevronRight, TrendingUp,
  FileText, Calendar, AlertCircle, CheckCircle2, Clock,
  Activity, BarChart3, Shield, Zap
} from "lucide-react";
import { ChatBot } from "./ChatBot";
import { DocumentsPage } from "./DocumentsPage";
import { ClientInteraction } from "./ClientInteraction";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

type View = "overview" | "chatbot" | "messages" | "documents" | "onboarding";

interface DashboardProps {
  user: { name: string; email: string; company: string };
  onLogout: () => void;
}

const DeloitteWordmark = () => (
  <div className="flex items-center gap-2">
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#86BC25" />
      <text x="16" y="22" textAnchor="middle" fill="#0A0B0D" fontSize="18" fontWeight="800" fontFamily="serif">d.</text>
    </svg>
    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '18px', color: '#F0F2F0' }}>Deloitte</span>
  </div>
);

const milestones = [
  { label: "Project kickoff", date: "Jan 15", done: true },
  { label: "Architecture design sign-off", date: "Feb 28", done: true },
  { label: "Core platform build", date: "Apr 30", done: true },
  { label: "API integration layer", date: "Jun 7", done: true },
  { label: "UAT preparation", date: "Jul 18", done: false },
  { label: "Performance testing", date: "Aug 22", done: false },
  { label: "Production go-live", date: "Sep 20", done: false },
];

const onboardingSteps = [
  { id: 1, title: "Account verification", desc: "Email and identity confirmed", status: "done" },
  { id: 2, title: "Company profile", desc: "Meridian Capital Group — Financial Services", status: "done" },
  { id: 3, title: "Engagement scope alignment", desc: "Digital Transformation Phase 2 activated", status: "done" },
  { id: 4, title: "Team introductions", desc: "Meet your dedicated Deloitte squad", status: "done" },
  { id: 5, title: "Workspace access", desc: "Connect to shared documents and tools", status: "active" },
  { id: 6, title: "Kickoff call scheduling", desc: "Book your first sprint planning session", status: "pending" },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#1A1E24', border: '1px solid rgba(134,188,37,0.2)', color: '#C8D4B8' }}>
        <p style={{ color: '#86BC25', fontWeight: 600 }}>{label}</p>
        <p>{payload[0].value}{typeof payload[0].value === 'number' && payload[0].value <= 100 ? '%' : ' tasks'}</p>
      </div>
    );
  }
  return null;
};

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<View>("overview");
  const [notifOpen, setNotifOpen] = useState(false);

  type TaskLike = {
    id: number;
    title?: string;
    status?: string;
    priority?: string;
    deadline?: string | null;
    createdAt?: string | null;
  };

  const [tasks, setTasks] = useState<TaskLike[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    if (activeView !== "overview") return;

    let cancelled = false;
    async function load() {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const r = await fetch("/tasks");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as TaskLike[];
        if (!cancelled) setTasks(data);
      } catch (e: any) {
        if (!cancelled) setTasksError(e?.message || "Failed to load tasks");
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeView]);

  const kpi = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => (t.status || "").toUpperCase() === "DONE").length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

    const openTasks = total - done;
    const resolvedItems = done;

    const today = new Date();
    const upcomingDeadlines = tasks
      .map((t) => (t.deadline ? new Date(t.deadline) : null))
      .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()) && d.getTime() >= today.getTime());
    const nextMilestoneDate = upcomingDeadlines.length ? new Date(Math.min(...upcomingDeadlines.map((d) => d.getTime()))) : null;

    const daysToMilestone = nextMilestoneDate
      ? Math.max(0, Math.ceil((nextMilestoneDate.getTime() - today.getTime()) / 86400000))
      : null;

    const milestoneLabel = nextMilestoneDate
      ? nextMilestoneDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "—";

    return {
      completionPct,
      openTasks,
      resolvedItems,
      daysToMilestone,
      milestoneLabel,
    };
  }, [tasks]);

  // Real chart data derived from the same fetched tasks — no static/heuristic arrays
  const charts = useMemo(() => {
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayIndexMap: Record<number, string> = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
    const weeklyCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    tasks.forEach((t) => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const dayName = dayIndexMap[d.getDay()];
      weeklyCounts[dayName] += 1;
    });

    const weeklyActivity = dayOrder.map((day) => ({ day, tasks: weeklyCounts[day] }));

    // Rolling 6-month window ending the current month, cumulative completion %
    const now = new Date();
    const months: { label: string; year: number; monthIndex: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString(undefined, { month: "short" }), year: d.getFullYear(), monthIndex: d.getMonth() });
    }

    const monthlyProgress = months.map(({ label, year, monthIndex }) => {
      const cutoff = new Date(year, monthIndex + 1, 0, 23, 59, 59);
      const tasksByThen = tasks.filter((t) => {
        if (!t.createdAt) return false;
        const d = new Date(t.createdAt);
        return !Number.isNaN(d.getTime()) && d.getTime() <= cutoff.getTime();
      });
      const doneByThen = tasksByThen.filter((t) => (t.status || "").toUpperCase() === "DONE").length;
      const pct = tasksByThen.length > 0 ? Math.round((doneByThen / tasksByThen.length) * 100) : 0;
      return { month: label, completion: pct };
    });

    const monthRangeLabel = months.length
      ? `${months[0].label} – ${months[months.length - 1].label} ${months[months.length - 1].year}`
      : "";

    return { weeklyActivity, monthlyProgress, monthRangeLabel };
  }, [tasks]);

  const navItems = [
    { id: "overview" as View, icon: LayoutDashboard, label: "Overview" },
    { id: "chatbot" as View, icon: MessageSquare, label: "AI Assistant", badge: null },
    { id: "messages" as View, icon: Users, label: "Task Collaboration", badge: 3 },
    { id: "documents" as View, icon: FolderOpen, label: "Documents" },
    { id: "onboarding" as View, icon: ClipboardList, label: "Onboarding" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0B0D' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#0D1117', borderRight: '1px solid rgba(134,188,37,0.08)' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(134,188,37,0.08)' }}>
          <DeloitteWordmark />
          <div className="mt-2 text-xs px-1" style={{ color: '#4A5568' }}>Client Portal</div>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: 'rgba(134,188,37,0.04)', border: '1px solid rgba(134,188,37,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#86BC25', color: '#0A0B0D' }}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: '#F0F2F0' }}>{user.name}</div>
              <div className="text-xs truncate" style={{ color: '#4A5568' }}>{user.company}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative"
              style={activeView === item.id
                ? { background: 'rgba(134,188,37,0.1)', color: '#86BC25' }
                : { color: '#6B7A5E' }}>
              <item.icon size={16} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: '#86BC25', color: '#0A0B0D' }}>
                  {item.badge}
                </span>
              )}
              {activeView === item.id && <ChevronRight size={12} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-1 border-t pt-4" style={{ borderColor: 'rgba(134,188,37,0.08)' }}>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all" style={{ color: '#6B7A5E' }}>
            <Settings size={16} /> Settings
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:text-red-400" style={{ color: '#6B7A5E' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(134,188,37,0.08)', background: '#0A0B0D' }}>
          <div>
            <h1 className="font-semibold text-sm" style={{ color: '#F0F2F0' }}>
              {activeView === "overview" && "Engagement Overview"}
              {activeView === "chatbot" && "AI Assistant"}
              {activeView === "messages" && "Task Collaboration"}
              {activeView === "onboarding" && "Client Onboarding"}
            </h1>
            <p className="text-xs" style={{ color: '#4A5568' }}>
              Digital Transformation — Phase 2 · {user.company}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Engagement health */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(134,188,37,0.08)', border: '1px solid rgba(134,188,37,0.15)', color: '#86BC25' }}>
              <Activity size={12} />
              <span>All systems operational</span>
            </div>
            {/* Notifications */}
            <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} title="Toggle notifications"
                className="relative p-2 rounded-lg transition-colors hover:bg-[#1A1E24]">
                <Bell size={16} style={{ color: '#6B7A5E' }} />

                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#86BC25' }} />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl z-50 overflow-hidden"
                  style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.15)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(134,188,37,0.1)' }}>
                    <span className="text-sm font-semibold" style={{ color: '#F0F2F0' }}>Notifications</span>
                  </div>
                  {[
                    { icon: FileText, text: "Architecture doc uploaded by Priya", time: "10 min ago" },
                    { icon: Calendar, text: "Sprint 8 planning: Jun 10, 10 AM IST", time: "2 hours ago" },
                    { icon: AlertCircle, text: "Action required: Sign project charter", time: "Yesterday" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#1A1E24] cursor-pointer transition-colors">
                      <n.icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#86BC25' }} />
                      <div>
                        <p className="text-xs" style={{ color: '#C8D4B8' }}>{n.text}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeView === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto px-6 py-6">
                {/* KPI row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Completion",
                      value: tasksLoading ? "—" : `${kpi.completionPct}%`,
                      sub: tasksLoading ? "Loading…" : "Done / Total tasks",
                      icon: TrendingUp,
                      positive: true,
                    },
                    {
                      label: "Open tasks",
                      value: tasksLoading ? "—" : `${kpi.openTasks}`,
                      sub: tasksLoading ? "Loading…" : "Remaining (not DONE)",
                      icon: AlertCircle,
                      positive: false,
                    },
                    {
                      label: "Days to milestone",
                      value: tasksLoading ? "—" : (kpi.daysToMilestone === null ? "—" : `${kpi.daysToMilestone}`),
                      sub: tasksLoading ? "Loading…" : (kpi.milestoneLabel || "—"),
                      icon: Clock,
                      positive: true,
                    },
                    {
                      label: "Resolved items",
                      value: tasksLoading ? "—" : `${kpi.resolvedItems}`,
                      sub: tasksLoading ? "Loading…" : "Tasks marked DONE",
                      icon: CheckCircle2,
                      positive: true,
                    },
                  ].map((card) => (
                    <div key={card.label} className="rounded-xl p-4" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs" style={{ color: '#6B7A5E' }}>{card.label}</span>
                        <card.icon size={14} style={{ color: card.positive ? '#86BC25' : '#E8A44A' }} />
                      </div>
                      <div className="text-2xl font-bold" style={{ color: '#F0F2F0' }}>{card.value}</div>
                      <div className="text-xs mt-1" style={{ color: '#4A5568' }}>{card.sub}</div>
                    </div>
                  ))}
                </div>

                {tasksError && (
                  <div className="mb-6 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="text-xs" style={{ color: '#C8D4B8' }}>
                      Couldn’t load KPI data: <span style={{ color: '#EF4444', fontWeight: 600 }}>{tasksError}</span>
                    </div>
                  </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  {/* Progress chart */}
                  <div className="lg:col-span-2 rounded-xl p-5" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: '#F0F2F0' }}>Project Progress</h3>
                        <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>Cumulative completion over time</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(134,188,37,0.1)', color: '#86BC25' }}>{charts.monthRangeLabel}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={charts.monthlyProgress}>
                        <defs>
                          <linearGradient id="prog" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#86BC25" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#86BC25" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => v + '%'} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="completion" stroke="#86BC25" strokeWidth={2} fill="url(#prog)" dot={{ fill: '#86BC25', r: 3, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Weekly activity */}
                  <div className="rounded-xl p-5" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: '#F0F2F0' }}>Weekly Activity</h3>
                    <p className="text-xs mb-4" style={{ color: '#4A5568' }}>Tasks created per day (real data)</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={charts.weeklyActivity} barSize={14}>
                        <XAxis dataKey="day" tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="tasks" fill="#86BC25" opacity={0.8} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Milestones */}
                <div className="rounded-xl p-5" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: '#F0F2F0' }}>Engagement Milestones</h3>
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: 'rgba(134,188,37,0.15)' }} />
                    <div className="space-y-3 pl-8">
                      {milestones.map((m, i) => (
                        <div key={i} className="relative flex items-center justify-between">
                          <div className="absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center"
                            style={m.done
                              ? { background: 'rgba(134,188,37,0.15)', border: '1.5px solid #86BC25' }
                              : { background: '#1A1E24', border: '1.5px solid rgba(134,188,37,0.2)' }}>
                            {m.done
                              ? <CheckCircle2 size={12} style={{ color: '#86BC25' }} />
                              : <Clock size={11} style={{ color: '#4A5568' }} />}
                          </div>
                          <div>
                            <span className="text-sm" style={{ color: m.done ? '#C8D4B8' : '#6B7A5E' }}>{m.label}</span>
                          </div>
                          <span className="text-xs" style={{ color: m.done ? '#86BC25' : '#4A5568' }}>{m.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "chatbot" && (
              <motion.div key="chatbot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="h-full flex flex-col" style={{ background: '#111318' }}>
                <ChatBot user={user} />
              </motion.div>
            )}

            {activeView === "documents" && (
              <motion.div key="documents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="h-full overflow-hidden">
                <DocumentsPage user={user} />
              </motion.div>
            )}

            {activeView === "documents" && (
              <motion.div key="documents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="h-full overflow-hidden">
                <DocumentsPage user={user} />
              </motion.div>
            )}

            {activeView === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="h-full overflow-hidden">
                <ClientInteraction user={user} />
              </motion.div>
            )}

            {activeView === "onboarding" && (
              <motion.div key="onboarding" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto px-6 py-6">
                {/* Onboarding header */}
                <div className="rounded-xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, #0D1A05, #111318)', border: '1px solid rgba(134,188,37,0.15)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} style={{ color: '#86BC25' }} />
                        <span className="text-xs font-medium" style={{ color: '#86BC25' }}>Onboarding in progress</span>
                      </div>
                      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 700, color: '#F0F2F0' }}>
                        Welcome to your engagement, {user.name.split(' ')[0]}
                      </h2>
                      <p className="mt-1.5 text-sm" style={{ color: '#6B7A5E' }}>
                        Complete the steps below to fully activate your Deloitte engagement workspace.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-6">
                      <div className="text-3xl font-bold" style={{ color: '#86BC25' }}>4/6</div>
                      <div className="text-xs" style={{ color: '#4A5568' }}>Steps completed</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(134,188,37,0.1)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '67%' }} transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full" style={{ background: '#86BC25' }} />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3 mb-6">
                  {onboardingSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 rounded-xl transition-all"
                      style={{
                        background: step.status === 'active' ? 'rgba(134,188,37,0.06)' : '#111318',
                        border: step.status === 'active' ? '1px solid rgba(134,188,37,0.25)' : '1px solid rgba(134,188,37,0.08)'
                      }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={step.status === 'done'
                          ? { background: 'rgba(134,188,37,0.12)', border: '1.5px solid #86BC25' }
                          : step.status === 'active'
                            ? { background: 'rgba(134,188,37,0.08)', border: '1.5px solid rgba(134,188,37,0.4)' }
                            : { background: '#1A1E24', border: '1.5px solid rgba(134,188,37,0.1)' }}>
                        {step.status === 'done' && <CheckCircle2 size={16} style={{ color: '#86BC25' }} />}
                        {step.status === 'active' && <span className="text-xs font-bold" style={{ color: '#86BC25' }}>{step.id}</span>}
                        {step.status === 'pending' && <span className="text-xs font-medium" style={{ color: '#4A5568' }}>{step.id}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: step.status === 'pending' ? '#4A5568' : '#F0F2F0' }}>{step.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#4A5568' }}>{step.desc}</div>
                      </div>
                      {step.status === 'active' && (
                        <button className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                          style={{ background: '#86BC25', color: '#0A0B0D' }}>
                          Continue
                        </button>
                      )}
                      {step.status === 'pending' && (
                        <button className="px-4 py-1.5 rounded-lg text-xs font-medium"
                          style={{ border: '1px solid rgba(134,188,37,0.2)', color: '#6B7A5E' }}>
                          Pending
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Team section */}
                <div className="rounded-xl p-5" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={15} style={{ color: '#86BC25' }} />
                    <h3 className="text-sm font-semibold" style={{ color: '#F0F2F0' }}>Your Deloitte Team</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "Priya Sharma", role: "Engagement Lead", sub: "Director, Technology Strategy", avatar: "PS", available: true },
                      { name: "James Kowalski", role: "Technical Lead", sub: "Sr. Manager, Cloud Engineering", avatar: "JK", available: false },
                      { name: "Ananya Iyer", role: "Strategy Advisor", sub: "Principal, Business Transformation", avatar: "AI", available: true },
                    ].map((member) => (
                      <div key={member.name} className="p-4 rounded-xl" style={{ background: '#0D1117', border: '1px solid rgba(134,188,37,0.08)' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                              style={{ background: 'linear-gradient(135deg, #1A2E0A, #2D4A1A)', color: '#86BC25', border: '1px solid rgba(134,188,37,0.2)' }}>
                              {member.avatar}
                            </div>
                            {member.available && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#0D1117]" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: '#F0F2F0' }}>{member.name}</div>
                            <div className="text-xs" style={{ color: '#86BC25' }}>{member.role}</div>
                          </div>
                        </div>
                        <p className="text-xs mb-3" style={{ color: '#4A5568' }}>{member.sub}</p>
                        <button className="w-full py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(134,188,37,0.15)]"
                          style={{ border: '1px solid rgba(134,188,37,0.2)', color: '#86BC25' }}>
                          Send message
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
