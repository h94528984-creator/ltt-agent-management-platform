import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgentRequestForm from "@/pages/AgentRequestForm";
import Login from "@/pages/Login";
import { isAuthenticated, clearAuth, getUser } from "@/lib/auth";
import { LogOut } from "lucide-react";
import InboxPanel from "@/components/InboxPanel";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" style={{ padding: 32, fontFamily: "sans-serif", background: "#fff1f0", minHeight: "100vh" }}>
          <h2 style={{ color: "#c00", marginBottom: 16 }}>خطأ في التطبيق</h2>
          <pre style={{ background: "#fff", border: "1px solid #fcc", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13 }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthenticatedApp() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const user = authed ? getUser() : null;

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div dir="rtl">
      <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center justify-between sticky top-0 z-40 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/company-logo.png" alt="LTT" className="h-8 w-8 object-contain shrink-0" />
          <div className="text-xs text-gray-700 min-w-0 hidden sm:block">
            {user && <><span className="font-semibold truncate">{user.fullName}</span></>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <a
            href="/share/map"
            target="_blank"
            rel="noopener noreferrer"
            title="فتح خريطة الوكلاء والمراكز"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[hsl(28,85%,48%)] to-[hsl(28,85%,55%)] rounded-lg hover:opacity-90"
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">الخريطة</span>
          </a>
          <a
            href="/"
            title="الانتقال إلى لوحة التحكم الإدارية"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[hsl(210,75%,28%)] to-[hsl(210,75%,38%)] rounded-lg hover:opacity-90"
          >
            <span>📊</span>
            <span className="hidden sm:inline">لوحة التحكم</span>
          </a>
          <InboxPanel />
          <button
            onClick={() => { clearAuth(); setAuthed(false); }}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
      <AgentRequestForm />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthenticatedApp />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
