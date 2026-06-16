import { useEffect, useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { AdminPage } from "./components/AdminPage";

interface User {
  name: string;
  email: string;
  company: string;
  token: string;
  role?: string;
}

type BackendHealth = "unknown" | "online" | "offline";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("deloitte_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [backendHealth, setBackendHealth] = useState<BackendHealth>("unknown");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const r = await fetch("/tasks/health");
        if (!r.ok) throw new Error();
        const data = await r.json();
        setBackendHealth(data?.status === "ok" ? "online" : "offline");
      } catch {
        setBackendHealth("offline");
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthenticated = (userData: User) => {
    localStorage.setItem("deloitte_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("deloitte_user");
    setUser(null);
    setIsAdmin(false);
  };

  const healthDot = (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-md border bg-background/80 px-3 py-2 text-xs backdrop-blur">
      <span className="font-medium">Backend</span>
      <span className={
        backendHealth === "online" ? "h-2.5 w-2.5 rounded-full bg-green-500" :
        backendHealth === "offline" ? "h-2.5 w-2.5 rounded-full bg-red-500" :
        "h-2.5 w-2.5 rounded-full bg-slate-400"
      } />
      {user && (
        <button onClick={() => setIsAdmin(!isAdmin)}
          className="ml-2 px-2 py-0.5 rounded text-xs font-medium transition-colors"
          style={{ background: isAdmin ? '#86BC25' : 'rgba(134,188,37,0.1)', color: isAdmin ? '#0A0B0D' : '#86BC25', border: '1px solid rgba(134,188,37,0.3)' }}>
          {isAdmin ? 'Client' : 'Admin'}
        </button>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-svh">
        {healthDot}
        <AuthPage onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-svh">
        {healthDot}
        <AdminPage user={user} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      {healthDot}
      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
}
