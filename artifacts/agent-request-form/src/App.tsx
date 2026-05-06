import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgentRequestForm from "@/pages/AgentRequestForm";

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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AgentRequestForm />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
