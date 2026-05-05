import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import {
  Loader2,
  LayoutDashboard,
  Users,
  CheckSquare,
  FileText,
  Ticket as TicketIcon,
  Package,
  Target,
  Settings,
  LogOut,
  Wifi,
  ClipboardList,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  head_of_unit: "رئيس الوحدة",
  indirect_sales: "مبيعات غير مباشرة",
  agent_affairs: "شؤون الوكلاء",
  inspection_team: "فريق التفتيش",
  technical_support: "الدعم الفني",
  airport_team: "فريق المطار",
  centers_support: "دعم المراكز",
  admin: "مدير النظام",
  viewer: "مستعرض",
};

const navItems = [
  { href: "/", label: "لوحة القيادة", icon: LayoutDashboard },
  { href: "/agents", label: "إدارة الوكلاء", icon: Users },
  { href: "/agent-requests", label: "طلبات التسجيل", icon: ClipboardList },
  { href: "/inspections", label: "تقارير التفتيش", icon: CheckSquare },
  { href: "/sales-logs", label: "سجلات المبيعات", icon: FileText },
  { href: "/tickets", label: "نظام التذاكر", icon: TicketIcon },
  { href: "/inventory", label: "إدارة المخزون", icon: Package },
  { href: "/scores", label: "تقييم الوكلاء", icon: Target },
  { href: "/users", label: "المستخدمين", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, setToken } = useAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Wifi className="w-7 h-7 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location !== "/login") {
      setLocation("/login");
      return null;
    }
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setToken(null);
        queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/login");
      },
    });
  };

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ backgroundColor: "hsl(var(--sidebar))" }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">منصة المبيعات</div>
              <div className="text-[11px] leading-tight" style={{ color: "hsl(var(--sidebar-foreground))", opacity: 0.65 }}>LTT Western Region</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? "text-white shadow-sm"
                    : "hover:text-white"
                }`}
                style={{
                  backgroundColor: isActive ? "hsl(var(--sidebar-primary))" : "transparent",
                  color: isActive ? "white" : "hsl(var(--sidebar-foreground))",
                }}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: "18px", height: "18px" }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--sidebar-accent))" }}>
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {user?.fullName ? initials(user.fullName) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.fullName}</div>
              <div className="text-[11px] truncate" style={{ color: "hsl(var(--sidebar-foreground))", opacity: 0.7 }}>
                {roleLabels[user?.role ?? ""] ?? user?.role}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 flex-shrink-0 hover:bg-white/10"
              style={{ color: "hsl(var(--sidebar-foreground))" }}
              title="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
