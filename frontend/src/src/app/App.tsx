import { useEffect, useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";

interface User {
  name: string;
  email: string;
  company: string;
}

type BackendHealth = "unknown" | "online" | "offline";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealth>(
    "unknown",
  );

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const r = await fetch("/tasks/health");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as { status?: string };
        if (!cancelled && data?.status === "ok") setBackendHealth("online");
        else if (!cancelled) setBackendHealth("offline");
      } catch {
        if (!cancelled) setBackendHealth("offline");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-svh">
        <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-md border bg-background/80 px-3 py-2 text-xs backdrop-blur">
          <span className="font-medium">Backend</span>
          <span
            className={
              backendHealth === "online"
                ? "h-2.5 w-2.5 rounded-full bg-green-500"
                : backendHealth === "offline"
                  ? "h-2.5 w-2.5 rounded-full bg-red-500"
                  : "h-2.5 w-2.5 rounded-full bg-slate-400"
            }
          />
        </div>
        <AuthPage onAuthenticated={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-md border bg-background/80 px-3 py-2 text-xs backdrop-blur">
        <span className="font-medium">Backend</span>
        <span
          className={
            backendHealth === "online"
              ? "h-2.5 w-2.5 rounded-full bg-green-500"
              : backendHealth === "offline"
                ? "h-2.5 w-2.5 rounded-full bg-red-500"
                : "h-2.5 w-2.5 rounded-full bg-slate-400"
          }
        />
      </div>
      <Dashboard user={user} onLogout={() => setUser(null)} />
    </div>
  );
}

