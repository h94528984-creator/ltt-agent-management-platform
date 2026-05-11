import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Bell, X, CheckCheck, Inbox as InboxIcon, Ticket as TicketIcon, FileText, User, AlertTriangle, RefreshCw } from "lucide-react";

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

const TYPE_META: Record<string, { label: string; color: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  ticket_assigned:        { label: "تذكرة موجَّهة",      color: "text-blue-600 bg-blue-50",       Icon: TicketIcon },
  ticket_status_changed:  { label: "تغيير حالة تذكرة",   color: "text-indigo-600 bg-indigo-50",   Icon: TicketIcon },
  agent_request_status:   { label: "تحديث طلب",           color: "text-emerald-600 bg-emerald-50", Icon: User },
  document_expiring:      { label: "ترخيص قارب الانتهاء", color: "text-amber-600 bg-amber-50",     Icon: AlertTriangle },
  document_expired:       { label: "ترخيص منتهي",         color: "text-red-600 bg-red-50",         Icon: AlertTriangle },
  default:                { label: "إشعار",                color: "text-slate-600 bg-slate-100",    Icon: Bell },
};

export default function InboxPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = useCallback(async () => {
    try {
      const r = await api.get<Notification[]>("/notifications");
      setItems(r ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);

  const unread = items.filter((n) => !n.isRead).length;

  const filtered = useMemo(() =>
    items
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((n) => filter === "all" || !n.isRead)
  , [items, filter]);

  async function markRead(id: number) {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setItems((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {/* ignore */}
  }
  async function markAll() {
    try {
      await api.patch("/notifications/read-all", {});
      setItems((p) => p.map((n) => ({ ...n, isRead: true })));
    } catch {/* ignore */}
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        title="صندوق البريد"
        type="button"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setOpen(false)} />
          <div dir="rtl" className="fixed top-0 left-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-l from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <InboxIcon size={20} />
                <h3 className="font-bold">صندوق البريد</h3>
                {unread > 0 && <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">{unread}</span>}
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded" type="button">
                <X size={18} />
              </button>
            </div>

            <div className="flex border-b border-gray-200 bg-gray-50">
              <button onClick={() => setFilter("all")}
                className={`flex-1 py-2.5 text-xs font-semibold ${filter === "all" ? "border-b-2 border-blue-500 text-blue-600 bg-white" : "text-gray-500"}`} type="button">
                الكل ({items.length})
              </button>
              <button onClick={() => setFilter("unread")}
                className={`flex-1 py-2.5 text-xs font-semibold ${filter === "unread" ? "border-b-2 border-blue-500 text-blue-600 bg-white" : "text-gray-500"}`} type="button">
                غير مقروء ({unread})
              </button>
              <button onClick={load} className="px-3 py-2.5 text-gray-500 hover:bg-gray-100" title="تحديث" type="button">
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-sm text-gray-500">
                  <CheckCheck size={36} className="mx-auto mb-2 text-emerald-400" />
                  لا توجد رسائل
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filtered.map((n) => {
                    const meta = TYPE_META[n.type] ?? TYPE_META.default!;
                    const Icon = meta.Icon;
                    return (
                      <li key={n.id} onClick={() => !n.isRead && markRead(n.id)}
                          className={`p-3.5 hover:bg-gray-50 cursor-pointer ${!n.isRead ? "bg-blue-50/40" : ""}`}>
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                              <p className={`text-sm ${!n.isRead ? "font-bold" : "font-medium text-gray-700"}`}>{n.title}</p>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(n.createdAt).toLocaleString("ar-LY")} · {meta.label}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {unread > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <button onClick={markAll}
                  className="w-full text-xs text-blue-600 hover:bg-blue-50 py-2 rounded font-semibold flex items-center justify-center gap-1.5" type="button">
                  <CheckCheck size={14} /> تحديد الكل كمقروء
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
