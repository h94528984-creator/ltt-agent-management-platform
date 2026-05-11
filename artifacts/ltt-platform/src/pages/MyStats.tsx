import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Ticket, CheckCircle2, Clock, Activity, Award, BarChart3 } from "lucide-react";

interface Stats {
  tickets: { assigned: number; open: number; resolved: number; closed: number; created: number };
  auditEntries: number;
  activityLast30Days: { d: string; c: number }[];
}

export default function MyStats() {
  const user = getUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get<Stats>(`/my-stats/${user.id}`).then(setStats).finally(() => setLoading(false));
  }, [user]);

  const completionRate = stats && stats.tickets.assigned > 0
    ? Math.round(((stats.tickets.resolved + stats.tickets.closed) / stats.tickets.assigned) * 100)
    : 0;

  const max = Math.max(1, ...(stats?.activityLast30Days.map((a) => a.c) ?? [1]));

  return (
    <div className="p-6 space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إحصائياتي الشخصية</h1>
        <p className="text-muted-foreground text-sm mt-1">نشاطك وإنجازاتك في النظام</p>
      </div>

      {loading && <div className="text-center text-muted-foreground py-8">جارٍ التحميل...</div>}

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
              <Ticket size={22} className="text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.tickets.assigned}</p>
                <p className="text-xs text-muted-foreground">تذاكر مُسندة لك</p>
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
              <Clock size={22} className="text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.tickets.open}</p>
                <p className="text-xs text-muted-foreground">مفتوحة الآن</p>
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 size={22} className="text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{stats.tickets.resolved + stats.tickets.closed}</p>
                <p className="text-xs text-muted-foreground">منجزة</p>
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
              <Activity size={22} className="text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.auditEntries}</p>
                <p className="text-xs text-muted-foreground">عمليات مسجّلة</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award size={20} className="text-orange-500" />
                <h3 className="font-bold">معدل الإنجاز</h3>
              </div>
              <div className="text-center py-4">
                <p className="text-5xl font-extrabold text-primary">{completionRate}%</p>
                <p className="text-sm text-muted-foreground mt-2">من التذاكر المُسندة لك أكملتها</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mt-4">
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-amber-700">{stats.tickets.open}</p>
                  <p className="text-xs text-amber-600">مفتوحة</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-700">{stats.tickets.resolved}</p>
                  <p className="text-xs text-blue-600">محلولة</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-700">{stats.tickets.closed}</p>
                  <p className="text-xs text-green-600">مغلقة</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={20} className="text-emerald-500" />
                <h3 className="font-bold">نشاطك آخر 30 يوماً</h3>
              </div>
              {stats.activityLast30Days.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">لا يوجد نشاط مسجل</p>
              ) : (
                <div className="flex items-end gap-1 h-40" dir="ltr">
                  {stats.activityLast30Days.map((a) => (
                    <div key={a.d} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${a.d}: ${a.c}`}>
                      <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${(a.c / max) * 100}%`, minHeight: 2 }} />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center mt-2">إجمالي العمليات: {stats.auditEntries}</p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="font-bold mb-3">تذاكر أنشأتها</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.tickets.created}</p>
            <p className="text-xs text-muted-foreground mt-1">إجمالي التذاكر التي أنشأتها للنظام</p>
          </div>
        </>
      )}
    </div>
  );
}
