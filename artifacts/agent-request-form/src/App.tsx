import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgentRequestForm from "@/pages/AgentRequestForm";
import Login from "@/pages/Login";
import { isAuthenticated, clearAuth, getUser } from "@/lib/auth";
import { LogOut } from "lucide-react";

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
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
        <div className="text-sm text-gray-700">
          {user && <><span className="font-semibold">{user.fullName}</span> <span className="text-gray-400 mx-1">·</span> <span className="text-xs text-gray-500">{user.email}</span></>}
        </div>
        <button
          onClick={() => { clearAuth(); setAuthed(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut size={14} />
          <span>تسجيل الخروج</span>
        </button>
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
