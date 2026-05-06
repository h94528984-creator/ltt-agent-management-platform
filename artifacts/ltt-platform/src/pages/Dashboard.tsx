import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardStats, AgentRankingItem, RiskDistributionItem, AgentRequest } from "@/lib/api";
import { Link } from "wouter";
import { Users, ClipboardCheck, AlertTriangle, TrendingUp, Star, Award, Eye, ShieldAlert, FileText, Clock, Inbox, MapPin } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#f97316", "#ef4444"];
const CLASS_LABELS: Record<string, string> = {
  gold: "ذهبي",
  silver: "فضي",
  watchlist: "قائمة المراقبة",
  high_risk: "خطر عالي",
};
const CLASS_COLORS: Record<string, string> = {
  gold: "#f59e0b",
  silver: "#6b7280",
  watchlist: "#f97316",
  high_risk: "#ef4444",
};

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </div>
  );
}

interface MyTicket {
  id: number; title: string; description: string | null;
  status: string; priority: string; category: string;
  assignedToId: number | null; locationName: string | null;
  latitude: number | null; longitude: number | null; createdAt: string;
}

const TICKET_PRIORITY_CLR: Record<string, string> = {
  urgent: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700", low: "bg-blue-100 text-blue-700",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ranking, setRanking] = useState<AgentRankingItem[]>([]);
  const [risk, setRisk] = useState<RiskDistributionItem[]>([]);
  const [inspections, setInspections] = useState<AgentRequest[]>([]);
  const [myTickets, setMyTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const userRaw = typeof window !== "undefined" ? localStorage.getItem("ltt_user") : null;
  const currentUserId = userRaw ? (JSON.parse(userRaw).id as number) : null;

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>("/dashboard/stats"),
      api.get<AgentRankingItem[]>("/dashboard/agent-ranking"),
      api.get<RiskDistributionItem[]>("/dashboard/risk-distribution"),
      api.get<AgentRequest[]>("/agent-requests?limit=10"),
      api.get<MyTicket[]>("/tickets").catch(() => [] as MyTicket[]),
    ]).then(([s, r, d, insp, tix]) => {
      setStats(s);
      setRanking(r);
      setRisk(d);
      setInspections(insp ?? []);
      const mine = currentUserId
        ? tix.filter((t) => t.assignedToId === currentUserId && t.status !== "closed" && t.status !== "resolved")
        : [];
      mine.sort((a, b) => {
        const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
      });
      setMyTickets(mine);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const riskData = risk.map((r) => ({
    name: CLASS_LABELS[r.classification] ?? r.classification,
    value: r.count,
    color: CLASS_COLORS[r.classification] ?? "#8884d8",
  }));

  const topAgents = ranking.slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground text-sm mt-1">نظرة عامة على أداء المبيعات بالتجزئة — المنطقة الغربية</p>
      </div>

      {stats?.documents && (stats.documents.expired > 0 || stats.documents.expiringSoon > 0) && (
        <Link href="/documents">
          <div className={`rounded-xl p-4 border-2 cursor-pointer hover:shadow-md transition-all ${stats.documents.expired > 0 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.documents.expired > 0 ? "bg-red-500" : "bg-amber-500"}`}>
                  <AlertTriangle className="text-white" size={20} />
                </div>
                <div>
                  <h3 className={`font-semibold ${stats.documents.expired > 0 ? "text-red-900" : "text-amber-900"}`}>تنبيه التراخيص والمستندات</h3>
                  <p className={`text-sm ${stats.documents.expired > 0 ? "text-red-700" : "text-amber-700"}`}>
                    {stats.documents.expired > 0 && <>يوجد <b>{stats.documents.expired}</b> مستند منتهٍ</>}
                    {stats.documents.expired > 0 && stats.documents.expiringSoon > 0 && " — "}
                    {stats.documents.expiringSoon > 0 && <>و <b>{stats.documents.expiringSoon}</b> سيُنتهي خلال 30 يوم</>}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${stats.documents.expired > 0 ? "text-red-700" : "text-amber-700"}`}>
                مراجعة الآن ←
              </span>
            </div>
          </div>
        </Link>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="إجمالي الوكلاء" value={stats.totalAgents} color="bg-primary" />
          <KpiCard icon={ClipboardCheck} label="التفتيشات" value={stats.totalInspections} color="bg-blue-500" />
          <KpiCard icon={AlertTriangle} label="تذاكر معلقة" value={stats.openTickets ?? stats.pendingTickets ?? 0} color="bg-orange-500" />
          <KpiCard icon={TrendingUp} label="متوسط التقييم" value={`${stats.avgAgentScore ?? stats.avgScore ?? 0}%`} color="bg-green-500" />
          <KpiCard icon={FileText} label="مستندات سارية" value={stats.documents?.valid ?? 0} color="bg-emerald-500" />
          <KpiCard icon={Clock} label="قارب على الانتهاء" value={stats.documents?.expiringSoon ?? 0} color="bg-amber-500" />
          <KpiCard icon={ShieldAlert} label="مستندات منتهية" value={stats.documents?.expired ?? 0} color="bg-red-500" />
          <KpiCard icon={Award} label="وكلاء ذهبيون" value={stats.goldAgents} color="bg-amber-400" />
        </div>
      )}

      {myTickets.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-primary/30 shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-primary/5 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Inbox size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">تذاكر تعنيك</h3>
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{myTickets.length}</span>
            </div>
            <Link href="/tickets"><span className="text-primary text-sm hover:underline cursor-pointer">عرض الكل ←</span></Link>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {myTickets.slice(0, 6).map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${TICKET_PRIORITY_CLR[t.priority] ?? "bg-gray-100"}`}>
                      {t.priority === "urgent" ? "عاجل" : t.priority === "high" ? "عالية" : t.priority === "medium" ? "متوسطة" : "منخفضة"}
                    </span>
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.description}</p>}
                </div>
                {t.latitude != null && t.longitude != null && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${t.latitude},${t.longitude}`} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium shrink-0">
                    <MapPin size={11} />
                    {t.locationName ?? "الخرائط"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">توزيع مستويات المخاطر</h3>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">أعلى 10 وكلاء تقييماً</h3>
          {topAgents.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topAgents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="agentName" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, "التقييم"]} />
                <Bar dataKey="score" fill="hsl(220,55%,18%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">آخر تقارير التفتيش الميداني</h3>
          <a href="/inspections" className="text-primary text-sm hover:underline">عرض الكل</a>
        </div>
        {inspections.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">لا توجد تقارير بعد</div>
        ) : (
          <div className="divide-y divide-border">
            {inspections.slice(0, 8).map((insp) => (
              <div key={insp.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{insp.agentName}</p>
                  <p className="text-xs text-muted-foreground">{insp.city} — {insp.representativeName}</p>
                </div>
                <div className="flex items-center gap-3">
                  {insp.finalScore != null && (
                    <span className={`text-sm font-bold ${insp.finalScore >= 85 ? "text-amber-500" : insp.finalScore >= 70 ? "text-blue-500" : insp.finalScore >= 50 ? "text-orange-500" : "text-red-500"}`}>
                      {insp.finalScore}/100
                    </span>
                  )}
                  <StatusBadge status={insp.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "قيد المراجعة", cls: "bg-yellow-100 text-yellow-700" },
    approved: { label: "مقبول", cls: "bg-green-100 text-green-700" },
    rejected: { label: "مرفوض", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}
