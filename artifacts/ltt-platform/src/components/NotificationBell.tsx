import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Bell, X, AlertTriangle, AlertCircle, Info, CheckCheck, Sparkles } from "lucide-react";
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

interface SmartAlert {
  id: string;
  severity: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  count: number;
  link?: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [tab, setTab] = useState<"alerts" | "notifications">("alerts");

  async function load() {
    try {
      const [n, a] = await Promise.all([
        api.get<Notification[]>("/notifications"),
        api.get<SmartAlert[]>("/smart-alerts"),
      ]);
      setNotifications(n);
      setAlerts(a);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const highAlerts = alerts.filter((a) => a.severity === "high").length;
  const totalBadge = unreadCount + highAlerts;

  async function markAllRead() {
    try {
      await api.patch("/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  }

  async function markRead(id: number) {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-white/10 rounded-lg text-blue-100"
        title="الإشعارات والتنبيهات"
      >
        <Bell size={20} />
        {totalBadge > 0 && (
          <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {totalBadge > 99 ? "99+" : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col" dir="rtl">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-500" />
                <h3 className="font-bold text-sm">الإشعارات</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={14} />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setTab("alerts")}
                className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 ${tab === "alerts" ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500"}`}
              >
                <Sparkles size={12} />
                تنبيهات ذكية ({alerts.length})
              </button>
              <button
                onClick={() => setTab("notifications")}
                className={`flex-1 py-2 text-xs font-semibold ${tab === "notifications" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              >
                إشعارات ({unreadCount})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {tab === "alerts" ? (
                alerts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    <CheckCheck size={32} className="mx-auto mb-2 text-green-400" />
                    لا توجد تنبيهات. كل شيء على ما يرام!
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {alerts.map((a) => (
                      <Link key={a.id} href={a.link ?? "/"}>
                        <div onClick={() => setOpen(false)}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-start gap-2">
                          {a.severity === "high" ? (
                            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                          ) : a.severity === "medium" ? (
                            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{a.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">لا توجد إشعارات</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice().reverse().slice(0, 50).map((n) => (
                      <div key={n.id} onClick={() => markRead(n.id)}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${!n.isRead ? "bg-blue-50/50" : ""}`}>
                        <div className="flex items-start gap-2">
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("ar-LY")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {tab === "notifications" && unreadCount > 0 && (
              <div className="p-2 border-t border-gray-200">
                <button onClick={markAllRead}
                  className="w-full text-xs text-blue-600 hover:bg-blue-50 py-2 rounded font-medium">
                  تحديد الكل كمقروء
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
