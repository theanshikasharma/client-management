import { useEffect, useMemo, useState } from "react";
import { RefreshCw, AlertCircle, Search } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ClientInteractionProps {
  user: { name: string; email: string; company: string };
}

const API = "";

export function ClientInteraction({ user }: ClientInteractionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      // Backend should provide tasks endpoint; we sort client-side to match the requested grid order.
      const r = await fetch(`${API}/tasks`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as Task[];
      const sorted = [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      setTasks(sorted);
    } catch (e: any) {
      setError(e?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => {
      return (
        String(t.id).includes(q) ||
        (t.title ?? "").toLowerCase().includes(q) ||
        (t.priority ?? "").toLowerCase().includes(q) ||
        (t.status ?? "").toLowerCase().includes(q)
      );
    });
  }, [tasks, query]);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#0A0B0D" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(134,188,37,0.1)" }}>
        <div>
          <h1 className="font-semibold text-sm" style={{ color: "#F0F2F0" }}>
            Client Interaction — Tasks Grid
          </h1>
          <p className="text-xs" style={{ color: "#4A5568" }}>
            Digital Transformation — Phase 2 · {user.company}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-[#1A1E24] disabled:opacity-40"
            style={{ border: "1px solid rgba(134,188,37,0.2)", color: "#86BC25" }}
          >
            <RefreshCw size={14} style={{ color: "#86BC25" }} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(134,188,37,0.08)" }}>
        <div className="relative max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A5568" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks (id/title/priority/status)..."
            className="w-full rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1"
            style={{ background: "#1A1E24", border: "1px solid rgba(134,188,37,0.1)", color: "#F0F2F0" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {error && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={14} style={{ color: "#EF4444" }} />
            <span className="text-xs" style={{ color: "#C8D4B8" }}>{error}</span>
          </div>
        )}

        <div className="rounded-xl" style={{ background: "#111318", border: "1px solid rgba(134,188,37,0.1)" }}>
          <table className="w-full text-left" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "#0D1117" }}>
                <th className="px-4 py-3 text-[11px] font-semibold" style={{ color: "#6B7A5E" }}>ID</th>
                <th className="px-4 py-3 text-[11px] font-semibold" style={{ color: "#6B7A5E" }}>Title</th>
                <th className="px-4 py-3 text-[11px] font-semibold" style={{ color: "#6B7A5E" }}>Priority</th>
                <th className="px-4 py-3 text-[11px] font-semibold" style={{ color: "#6B7A5E" }}>Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold" style={{ color: "#6B7A5E" }}>Deadline</th>
                <th className="px-4 py-3 text-[11px] font-semibold" style={{ color: "#6B7A5E" }}>Created</th>
                <th className="px-4 py-3 text-[11px] font-semibold" style={{ color: "#6B7A5E" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6" style={{ color: "#4A5568" }}>
                    Loading tasks...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6" style={{ color: "#4A5568" }}>
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const priorityColor = t.priority === "HIGH" ? "#EF4444" : t.priority === "LOW" ? "#86BC25" : "#E8A44A";
                  const statusColor = t.status === "DONE" ? "#86BC25" : t.status === "IN_PROGRESS" ? "#E8A44A" : "#4A5568";
                  return (
                    <tr key={t.id} style={{ background: "#0D1117" }}>
                      <td className="px-4 py-3 text-xs" style={{ color: "#C8D4B8" }}>{t.id}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#F0F2F0" }}>
                        {t.title}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            background: `${priorityColor}20`,
                            color: priorityColor,
                            border: `1px solid ${priorityColor}40`,
                          }}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: statusColor }}>{t.status}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#4A5568" }}>{t.deadline ?? "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#4A5568" }}>{t.createdAt ? String(t.createdAt).split("T")[0] : "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#4A5568" }}>{t.updatedAt ? String(t.updatedAt).split("T")[0] : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

