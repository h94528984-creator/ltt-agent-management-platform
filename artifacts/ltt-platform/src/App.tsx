import React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { Layout } from "@/components/layout";

import { Login } from "@/pages/login";
import { Dashboard } from "@/pages/dashboard";
import { Agents } from "@/pages/agents";
import { Inspections } from "@/pages/inspections";
import { SalesLogs } from "@/pages/sales-logs";
import { Tickets } from "@/pages/tickets";
import { Inventory } from "@/pages/inventory";
import { Scores } from "@/pages/scores";
import { Users } from "@/pages/users";
import AgentRequestForm from "@/pages/agent-request-form";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const PUBLIC_PATHS = ["/agent-request", "/form"];

function Router() {
  const [location] = useLocation();
  const isPublic = PUBLIC_PATHS.some(p => location === p || location.startsWith(p + "/"));

  if (isPublic) {
    return (
      <Switch>
        <Route path="/agent-request" component={AgentRequestForm} />
        <Route path="/form" component={AgentRequestForm} />
        <Route path="/form/" component={AgentRequestForm} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Dashboard} />
        <Route path="/agents" component={Agents} />
        <Route path="/inspections" component={Inspections} />
        <Route path="/sales-logs" component={SalesLogs} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/scores" component={Scores} />
        <Route path="/users" component={Users} />
        <Route>
          <div className="p-8 flex items-center justify-center text-center min-h-[60vh]">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">الصفحة غير موجودة</h1>
              <p className="text-muted-foreground">تحقق من الرابط وحاول مجدداً</p>
            </div>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
