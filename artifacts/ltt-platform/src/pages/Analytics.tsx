import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AgentRankingItem, RiskDistributionItem, SalesComparisonItem } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const CLASS_COLORS: Record<string, string> = {
  gold: "#f59e0b",
  silver: "#6b7280",
  watchlist: "#f97316",
  high_risk: "#ef4444",
};
const CLASS_LABELS: Record<string, string> = {
  gold: "ذهبي",
  silver: "فضي",
  watchlist: "مراقبة",
  high_risk: "خطر عالي",
};

interface AgentRequest {
  id: number;
  city: string;
  finalScore: number | null;
  readinessScore: number | null;
  salesScore: number | null;
  complianceScore: number | null;
  status: string;
  activityType: string | null;
  createdAt: string;
}

export default function Analytics() {
  const [ranking, setRanking] = useState<AgentRankingItem[]>([]);
  const [risk, setRisk] = useState<RiskDistributionItem[]>([]);
  const [sales, setSales] = useState<SalesComparisonItem[]>([]);
  const [inspections, setInspections] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AgentRankingItem[]>("/dashboard/agent-ranking"),
      api.get<RiskDistributionItem[]>("/dashboard/risk-distribution"),
      api.get<SalesComparisonItem[]>("/dashboard/sales-comparison"),
      api.get<AgentRequest[]>("/agent-requests?limit=200"),
    ]).then(([r, d, s, insp]) => {
      setRanking(r);
      setRisk(d);
      setSales(s);
      setInspections(insp ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const riskData = risk.map((r) => ({
    name: CLASS_LABELS[r.classification] ?? r.classification,
    value: r.count,
    color: CLASS_COLORS[r.classification] ?? "#8884d8",
  }));

  const cityMap = new Map<string, { total: number; count: number }>();
  inspections.forEach((insp) => {
    if (!insp.city || insp.finalScore == null) return;
    const cur = cityMap.get(insp.city) ?? { total: 0, count: 0 };
    cityMap.set(insp.city, { total: cur.total + insp.finalScore, count: cur.count + 1 });
  });
  const cityData = Array.from(cityMap.entries())
    .map(([city, { total, count }]) => ({ city, avgScore: Math.round(total / count), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const typeMap = new Map<string, number>();
  inspections.forEach((insp) => {
    const t = insp.activityType ?? "غير محدد";
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
  });
  const typeData = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));

  const avgScores = {
    readiness: Math.round(inspections.filter((i) => i.readinessScore != null).reduce((s, i) => s + (i.readinessScore ?? 0), 0) / Math.max(1, inspections.filter((i) => i.readinessScore != null).length)),
    sales: Math.round(inspections.filter((i) => i.salesScore != null).reduce((s, i) => s + (i.salesScore ?? 0), 0) / Math.max(1, inspections.filter((i) => i.salesScore != null).length)),
    compliance: Math.round(inspections.filter((i) => i.complianceScore != null).reduce((s, i) => s + (i.complianceScore ?? 0), 0) / Math.max(1, inspections.filter((i) => i.complianceScore != null).length)),
    final: Math.round(inspections.filter((i) => i.finalScore != null).reduce((s, i) => s + (i.finalScore ?? 0), 0) / Math.max(1, inspections.filter((i) => i.finalScore != null).length)),
  };
  const radarData = [
    { subject: "الجاهزية", value: avgScores.readiness },
    { subject: "المبيعات", value: avgScores.sales },
    { subject: "الامتثال", value: avgScores.compliance },
    { subject: "الإجمالي", value: avgScores.final },
  ];

  const complianceMap = inspections.reduce((acc, i) => {
    const flag = i.status;
    acc[flag] = (acc[flag] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">التحليلات والإحصاءات</h1>
        <p className="text-muted-foreground text-sm mt-1">تحليل شامل لأداء الوكلاء والجولات التفتيشية</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي التفتيشات", value: inspections.length },
          { label: "متوسط التقييم النهائي", value: `${avgScores.final}%` },
          { label: "متوسط الجاهزية", value: `${avgScores.readiness}%` },
          { label: "متوسط الامتثال", value: `${avgScores.compliance}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">توزيع التفتيشات حسب المدينة</h3>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [v, n === "count" ? "عدد التفتيشات" : "متوسط التقييم"]} />
                <Bar dataKey="count" fill="hsl(220,55%,18%)" radius={[0, 4, 4, 0]} name="عدد التفتيشات" />
                <Bar dataKey="avgScore" fill="#f59e0b" radius={[0, 4, 4, 0]} name="متوسط التقييم" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">توزيع مستويات المخاطر</h3>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">متوسط مؤشرات التقييم</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="المتوسط" dataKey="value" stroke="hsl(220,55%,18%)" fill="hsl(220,55%,18%)" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">توزيع أنواع النشاط</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={["hsl(220,55%,18%)", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#f97316"][i % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {sales.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">مقارنة المبيعات الميدانية والمُبلَّغة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sales.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agentName" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend formatter={(value) => value === "fieldSales" ? "مبيعات ميدانية" : "مبيعات مُبلَّغة"} />
              <Bar dataKey="fieldSales" fill="hsl(220,55%,18%)" name="fieldSales" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reportedSales" fill="#f59e0b" name="reportedSales" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">ترتيب الوكلاء حسب التقييم (أعلى 15)</h3>
        {ranking.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="pb-2 text-right font-semibold text-muted-foreground">#</th>
                  <th className="pb-2 text-right font-semibold text-muted-foreground">الوكيل</th>
                  <th className="pb-2 text-right font-semibold text-muted-foreground">التصنيف</th>
                  <th className="pb-2 text-right font-semibold text-muted-foreground">التقييم</th>
                  <th className="pb-2 text-right font-semibold text-muted-foreground">الشريط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ranking.slice(0, 15).map((a, i) => (
                  <tr key={a.agentId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 text-muted-foreground font-mono">{i + 1}</td>
                    <td className="py-2.5 font-medium text-foreground">{a.agentName}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${CLASS_COLORS[a.classification] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {CLASS_LABELS[a.classification] ?? a.classification}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-primary">{a.score}/100</td>
                    <td className="py-2.5 w-32">
                      <div className="bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full ${CLASS_COLORS[a.classification]?.includes("amber") ? "bg-amber-400" : a.score >= 70 ? "bg-blue-500" : a.score >= 50 ? "bg-orange-400" : "bg-red-500"}`} style={{ width: `${a.score}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyChart />
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات كافية</div>;
}

const CLASS_TABLE_COLORS: Record<string, string> = {
  gold: "bg-amber-100 text-amber-700 border-amber-200",
  silver: "bg-slate-100 text-slate-600 border-slate-200",
  watchlist: "bg-orange-100 text-orange-700 border-orange-200",
  high_risk: "bg-red-100 text-red-700 border-red-200",
};
