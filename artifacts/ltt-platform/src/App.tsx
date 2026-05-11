import { useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Link } from "wouter";
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
import Entities from "@/pages/Entities";
import MapView from "@/pages/MapView";
import PublicMap from "@/pages/PublicMap";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import Inbox from "@/pages/Inbox";
import MyAccount from "@/pages/MyAccount";
import MyStats from "@/pages/MyStats";
import AuditLog from "@/pages/AuditLog";
import Gallery from "@/pages/Gallery";
import NotificationBell from "@/components/NotificationBell";
import { isAuthenticated, clearAuth, getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Ticket as TicketIcon, X, Menu } from "lucide-react";

interface TicketType {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assignedToId: number | null;
}

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

function AssignedTicketsPopup({ tickets, onClose }: { tickets: TicketType[]; onClose: () => void }) {
  const priorityClass: Record<string, string> = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><TicketIcon size={20} className="text-orange-600" /></div>
            <div>
              <h3 className="font-bold text-gray-900">لديك تذاكر تخصك</h3>
              <p className="text-xs text-gray-500 mt-0.5">{tickets.length} تذكرة مفتوحة بانتظارك</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tickets.map(t => (
            <div key={t.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{t.title}</p>
                  {t.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityClass[t.priority] ?? "bg-gray-100 text-gray-700"}`}>
                  {t.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Link href="/tickets" className="flex-1">
            <button onClick={onClose} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm">
              عرض جميع تذاكري
            </button>
          </Link>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [, navigate] = useLocation();
  const [assignedTickets, setAssignedTickets] = useState<TicketType[]>([]);
  const [showTicketsPopup, setShowTicketsPopup] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const user = authed ? getUser() : null;
  const isAdmin = user?.role === "admin";

  async function checkAssignedTickets() {
    const u = getUser();
    if (!u) return;
    try {
      const all = await api.get<TicketType[]>(`/tickets?assignedTo=${u.id}`);
      const open = all.filter(t => t.status !== "closed" && t.status !== "resolved");
      if (open.length > 0) {
        setAssignedTickets(open);
        setShowTicketsPopup(true);
      }
    } catch { /* ignore */ }
  }

  function handleLogin() {
    setAuthed(true);
    navigate("/");
    checkAssignedTickets();
  }

  function handleLogout() {
    clearAuth();
    setAuthed(false);
    setShowTicketsPopup(false);
    setAssignedTickets([]);
    navigate("/");
  }

  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (path === `${base}/share/map` || path === `${base}/share/map/`) {
    return <PublicMap />;
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      <Sidebar onLogout={handleLogout} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="bg-[hsl(220,55%,12%)] text-white px-3 sm:px-6 py-2 flex items-center justify-between gap-3 sticky top-0 z-30">
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden flex items-center gap-2 text-white" aria-label="القائمة">
            <Menu size={22} />
            <img src="/company-logo.png" alt="LTT" className="h-7 w-7 object-contain" />
            <span className="text-sm font-bold">LTT</span>
          </button>
          <div className="hidden lg:block" />
          <NotificationBell />
        </div>
        <Switch>
          <Route path="/" component={Dashboard} />
          {isAdmin && <Route path="/inspections" component={Inspections} />}
          <Route path="/agents" component={Agents} />
          <Route path="/documents" component={Documents} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/reports" component={Reports} />
          <Route path="/tickets" component={Tickets} />
          <Route path="/entities" component={Entities} />
          <Route path="/map" component={MapView} />
          <Route path="/users" component={Users} />
          <Route path="/account" component={MyAccount} />
          <Route path="/my-stats" component={MyStats} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/inbox" component={Inbox} />
          {isAdmin && <Route path="/audit" component={AuditLog} />}
          <Route component={NotFound} />
        </Switch>
      </main>
      {showTicketsPopup && assignedTickets.length > 0 && (
        <AssignedTicketsPopup tickets={assignedTickets} onClose={() => setShowTicketsPopup(false)} />
      )}
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
