import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Inbox as InboxIcon, Search, CheckCheck, Bell, Ticket as TicketIcon, FileText, User, AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "wouter";

interface Notification {
  id: number;
  userId: number | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  entityType: string | null;
  entityId: number | null;
  createdAt: string;
}

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; link?: (id: number | null) => string }> = {
  ticket_assigned:        { label: "تذكرة موجَّهة",     icon: TicketIcon,     color: "text-blue-600 bg-blue-50",      link: () => "/tickets" },
  ticket_status_changed:  { label: "تغيير حالة تذكرة",  icon: TicketIcon,     color: "text-indigo-600 bg-indigo-50",  link: () => "/tickets" },
  agent_request_status:   { label: "تحديث طلب",          icon: User,           color: "text-emerald-600 bg-emerald-50",link: () => "/inspections" },
  document_expiring:      { label: "ترخيص قارب الانتهاء",icon: AlertTriangle,  color: "text-amber-600 bg-amber-50",    link: () => "/documents" },
  document_expired:       { label: "ترخيص منتهي",        icon: AlertTriangle,  color: "text-red-600 bg-red-50",        link: () => "/documents" },
  default:                { label: "إشعار",               icon: Bell,           color: "text-slate-600 bg-slate-100" },
};

export default function Inbox() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get<Notification[]>("/notifications");
      setItems(r ?? []);
    } catch { setItems([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((n) => {
        if (filter === "unread" && n.isRead) return false;
        if (filter !== "all" && filter !== "unread" && n.type !== filter) return false;
        if (!q) return true;
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      });
  }, [items, search, filter]);

  const counts = useMemo(() => {
    const total = items.length;
    const unread = items.filter((n) => !n.isRead).length;
    const byType: Record<string, number> = {};
    items.forEach((n) => { byType[n.type] = (byType[n.type] ?? 0) + 1; });
    return { total, unread, byType };
  }, [items]);

  async function markRead(id: number) {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {/* ignore */}
  }
  async function markAllRead() {
    try {
      await api.patch("/notifications/read-all", {});
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {/* ignore */}
  }

  const types = Object.keys(counts.byType);

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <InboxIcon size={24} /> صندوق البريد
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            كل الإشعارات والتنبيهات والتذاكر الموجَّهة إليك في مكان واحد
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted">
            <RefreshCw size={14} /> تحديث
          </button>
          {counts.unread > 0 && (
            <button onClick={markAllRead} className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
              <CheckCheck size={14} /> تحديد الكل كمقروء
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="الإجمالي" value={counts.total} icon={InboxIcon} color="bg-slate-100 text-slate-700" />
        <Tile label="غير مقروء" value={counts.unread} icon={Bell} color="bg-blue-50 text-blue-700" />
        <Tile label="تذاكر" value={(counts.byType.ticket_assigned ?? 0) + (counts.byType.ticket_status_changed ?? 0)} icon={TicketIcon} color="bg-indigo-50 text-indigo-700" />
        <Tile label="مستندات" value={(counts.byType.document_expiring ?? 0) + (counts.byType.document_expired ?? 0)} icon={FileText} color="bg-amber-50 text-amber-700" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الإشعارات..."
            className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>الكل ({counts.total})</FilterPill>
        <FilterPill active={filter === "unread"} onClick={() => setFilter("unread")}>غير مقروء ({counts.unread})</FilterPill>
        {types.map((t) => (
          <FilterPill key={t} active={filter === t} onClick={() => setFilter(t)}>
            {TYPE_META[t]?.label ?? t} ({counts.byType[t]})
          </FilterPill>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <CheckCheck size={36} className="mx-auto mb-2 text-emerald-400" />
            لا توجد رسائل تطابق التصفية
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.default!;
              const Icon = meta.icon;
              const link = meta.link?.(n.entityId);
              const Body = (
                <div className={`flex items-start gap-3 p-4 hover:bg-muted/30 transition cursor-pointer ${!n.isRead ? "bg-blue-50/30" : ""}`}
                     onClick={() => !n.isRead && markRead(n.id)}>
                  <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      <p className={`text-sm ${!n.isRead ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                        {n.title}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {new Date(n.createdAt).toLocaleString("ar-LY")} · {meta.label}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={n.id}>
                  {link ? <Link href={link}>{Body}</Link> : Body}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Tile({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ size?: number }>; color: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}><Icon size={16} /></div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-full border transition ${active ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}
