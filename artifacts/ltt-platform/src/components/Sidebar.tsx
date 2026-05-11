import { Link, useRoute } from "wouter";
import { LayoutDashboard, ClipboardList, Users, BarChart3, Map, Ticket, LogOut, UserCheck, FileText, Building2, MessageCircle } from "lucide-react";
import { clearAuth, getUser } from "@/lib/auth";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/inspections", icon: ClipboardList, label: "تقارير التفتيش", adminOnly: true },
  { href: "/agents", icon: Users, label: "إدارة الوكلاء" },
  { href: "/entities", icon: Building2, label: "كيانات الشركة" },
  { href: "/documents", icon: FileText, label: "التراخيص والمستندات" },
  { href: "/analytics", icon: BarChart3, label: "التحليلات" },
  { href: "/tickets", icon: Ticket, label: "التذاكر" },
  { href: "/map", icon: Map, label: "الخريطة التفاعلية" },
  { href: "/users", icon: UserCheck, label: "المستخدمون" },
  { href: "/assistant", icon: MessageCircle, label: "المساعد الذكي" },
];

interface SidebarProps {
  onLogout: () => void;
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) {
  const [active] = useRoute(href === "/" ? "/" : `${href}*`);
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
        active
          ? "bg-orange-500 text-white shadow-sm"
          : "text-blue-100 hover:bg-white/10"
      }`}>
        <Icon size={18} />
        <span>{label}</span>
      </div>
    </Link>
  );
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const user = getUser();
  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col shrink-0">
      <div className="p-5 border-b border-sidebar-border">
        <img src="/ltt-tagline.png" alt="LTT" className="h-12 object-contain" />
        <p className="text-blue-200 text-xs mt-2">نظام إدارة المبيعات بالتجزئة</p>
        <p className="text-blue-300 text-xs">المنطقة الغربية</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="mb-3 px-2">
            <p className="text-blue-100 text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-blue-300 text-xs truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
