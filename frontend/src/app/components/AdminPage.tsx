import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, CheckCircle2, Clock, AlertCircle, TrendingUp, Shield, RefreshCw, LogOut, Settings, LayoutDashboard } from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
  createdBy?: string;
  createdAt?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AdminPageProps {
  user: { name: string; email: string; company: string; token: string };
  onLogout: () => void;
}

export function AdminPage({ user, onLogout }: AdminPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "users">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const r = await fetch("/tasks");
      if (r.ok) setTasks(await r.json());
    } catch {}
    setLoading(false);
  }

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "DONE").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    pending: tasks.filter(t => t.status === "PENDING").length,
    high: tasks.filter(t => t.priority === "HIGH").length,
    completion: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "DONE").length / tasks.length) * 100) : 0,
  };

  const mockUsers: User[] = [
    { id: 1, name: "Anshika Sharma", email: "anshika2026@test.com", role: "USER", createdAt: "2026-06-09" },
    { id: 2, name: "Anshika", email: "anshika@deloitte.com", role: "USER", createdAt: "2026-06-09" },
    { id: 3, name: "Test User", email: "test2@deloitte.com", role: "USER", createdAt: "2026-06-09" },
    { id: 4, name: "Test User3", email: "test3@deloitte.com", role: "USER", createdAt: "2026-06-09" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0B0D' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#0D1117', borderRight: '1px solid rgba(134,188,37,0.08)' }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(134,188,37,0.08)' }}>
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#86BC25" /><text x="16" y="22" textAnchor="middle" fill="#0A0B0D" fontSize="18" fontWeight="800" fontFamily="serif">d.</text></svg>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '16px', color: '#F0F2F0' }}>Deloitte</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Shield size={10} style={{ color: '#86BC25' }} />
            <span className="text-xs" style={{ color: '#86BC25' }}>Admin Console</span>
          </div>
        </div>

        <div className="mx-3 mt-4 p-3 rounded-xl" style={{ background: 'rgba(134,188,37,0.04)', border: '1px solid rgba(134,188,37,0.08)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#86BC25', color: '#0A0B0D' }}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: '#F0F2F0' }}>{user.name}</div>
              <div className="text-xs" style={{ color: '#86BC25' }}>Administrator</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { id: "overview", icon: LayoutDashboard, label: "Overview" },
            { id: "tasks", icon: CheckCircle2, label: "All Tasks" },
            { id: "users", icon: Users, label: "Users" },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as typeof activeTab)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={activeTab === item.id ? { background: 'rgba(134,188,37,0.1)', color: '#86BC25' } : { color: '#6B7A5E' }}>
              <item.icon size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 space-y-1 border-t pt-4" style={{ borderColor: 'rgba(134,188,37,0.08)' }}>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: '#6B7A5E' }}>
            <Settings size={15} /> Settings
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:text-red-400" style={{ color: '#6B7A5E' }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(134,188,37,0.08)', background: '#0A0B0D' }}>
          <div>
            <h1 className="font-semibold text-sm" style={{ color: '#F0F2F0' }}>
              {activeTab === "overview" && "System Overview"}
              {activeTab === "tasks" && "Task Management"}
              {activeTab === "users" && "User Management"}
            </h1>
            <p className="text-xs" style={{ color: '#4A5568' }}>Admin Console · {user.company}</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-[#1A1E24]"
            style={{ border: '1px solid rgba(134,188,37,0.2)', color: '#86BC25' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#86BC25] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Total Tasks", value: stats.total, icon: LayoutDashboard, color: '#86BC25' },
                      { label: "Completion Rate", value: `${stats.completion}%`, icon: TrendingUp, color: '#86BC25' },
                      { label: "High Priority", value: stats.high, icon: AlertCircle, color: '#EF4444' },
                      { label: "In Progress", value: stats.inProgress, icon: Clock, color: '#E8A44A' },
                      { label: "Completed", value: stats.done, icon: CheckCircle2, color: '#86BC25' },
                      { label: "Total Users", value: mockUsers.length, icon: Users, color: '#86BC25' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl p-4" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs" style={{ color: '#6B7A5E' }}>{stat.label}</span>
                          <stat.icon size={14} style={{ color: stat.color }} />
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#F0F2F0' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-5" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: '#F0F2F0' }}>Recent Activity</h3>
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0D1117' }}>
                          <div className="flex items-center gap-3">
                            {task.status === "DONE" ? <CheckCircle2 size={14} style={{ color: '#86BC25' }} /> :
                              task.status === "IN_PROGRESS" ? <Clock size={14} style={{ color: '#E8A44A' }} /> :
                              <AlertCircle size={14} style={{ color: '#4A5568' }} />}
                            <div>
                              <div className="text-xs font-medium" style={{ color: '#F0F2F0' }}>{task.title}</div>
                              <div className="text-xs" style={{ color: '#4A5568' }}>by {task.createdBy || 'system'}</div>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: task.priority === "HIGH" ? "rgba(239,68,68,0.1)" : task.priority === "LOW" ? "rgba(134,188,37,0.1)" : "rgba(232,164,74,0.1)",
                              color: task.priority === "HIGH" ? "#EF4444" : task.priority === "LOW" ? "#86BC25" : "#E8A44A",
                            }}>{task.priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "tasks" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-xl overflow-hidden" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                    <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead>
                        <tr style={{ background: '#0D1117' }}>
                          {["ID", "Title", "Priority", "Status", "Deadline", "Created By"].map(h => (
                            <th key={h} className="px-4 py-3 text-[11px] font-semibold" style={{ color: '#6B7A5E' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map(task => {
                          const pc = task.priority === "HIGH" ? "#EF4444" : task.priority === "LOW" ? "#86BC25" : "#E8A44A";
                          const sc = task.status === "DONE" ? "#86BC25" : task.status === "IN_PROGRESS" ? "#E8A44A" : "#4A5568";
                          return (
                            <tr key={task.id} className="border-t" style={{ borderColor: 'rgba(134,188,37,0.05)' }}>
                              <td className="px-4 py-3 text-xs" style={{ color: '#6B7A5E' }}>{task.id}</td>
                              <td className="px-4 py-3 text-xs font-medium" style={{ color: '#F0F2F0' }}>{task.title}</td>
                              <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${pc}20`, color: pc, border: `1px solid ${pc}40` }}>{task.priority}</span></td>
                              <td className="px-4 py-3 text-xs" style={{ color: sc }}>{task.status}</td>
                              <td className="px-4 py-3 text-xs" style={{ color: '#4A5568' }}>{task.deadline || '—'}</td>
                              <td className="px-4 py-3 text-xs" style={{ color: '#4A5568' }}>{task.createdBy || 'system'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === "users" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-xl overflow-hidden" style={{ background: '#111318', border: '1px solid rgba(134,188,37,0.1)' }}>
                    <table className="w-full text-left">
                      <thead>
                        <tr style={{ background: '#0D1117' }}>
                          {["ID", "Name", "Email", "Role", "Joined"].map(h => (
                            <th key={h} className="px-4 py-3 text-[11px] font-semibold" style={{ color: '#6B7A5E' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mockUsers.map(u => (
                          <tr key={u.id} className="border-t" style={{ borderColor: 'rgba(134,188,37,0.05)' }}>
                            <td className="px-4 py-3 text-xs" style={{ color: '#6B7A5E' }}>{u.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: '#86BC25', color: '#0A0B0D' }}>
                                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-xs font-medium" style={{ color: '#F0F2F0' }}>{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#6B7A5E' }}>{u.email}</td>
                            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(134,188,37,0.1)', color: '#86BC25', border: '1px solid rgba(134,188,37,0.3)' }}>{u.role}</span></td>
                            <td className="px-4 py-3 text-xs" style={{ color: '#4A5568' }}>{u.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
