import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Inspections from "@/pages/Inspections";
import Agents from "@/pages/Agents";
import Documents from "@/pages/Documents";
import Analytics from "@/pages/Analytics";
import Tickets from "@/pages/Tickets";
import Inventory from "@/pages/Inventory";
import Users from "@/pages/Users";
import { isAuthenticated, clearAuth } from "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-muted mb-2">404</p>
        <p className="text-muted-foreground">الصفحة غير موجودة</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [, navigate] = useLocation();

  function handleLogin() {
    setAuthed(true);
    navigate("/");
  }

  function handleLogout() {
    clearAuth();
    setAuthed(false);
    navigate("/");
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/inspections" component={Inspections} />
          <Route path="/agents" component={Agents} />
          <Route path="/documents" component={Documents} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/tickets" component={Tickets} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/users" component={Users} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppLayout />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
