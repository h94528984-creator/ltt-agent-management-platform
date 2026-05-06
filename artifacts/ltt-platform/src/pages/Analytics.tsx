import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import type { AgentRankingItem, RiskDistributionItem } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from "recharts";
import {
  MapPin, Layers, Package, ShieldAlert, FileCheck, Award,
  AlertTriangle, CheckCircle2, Clock, XCircle, TrendingUp,
} from "lucide-react";

const PALETTE = ["#1e3a8a", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#14b8a6", "#ec4899", "#84cc16"];

const CLASS_LABELS: Record<string, string> = {
  gold: "ذهبي", silver: "فضي", watchlist: "مراقبة", high_risk: "خطر عالي",
  A: "تصنيف A", B: "تصنيف B", C: "تصنيف C", D: "تصنيف D", E: "تصنيف E",
};
const CLASS_FILL: Record<string, string> = {
  gold: "#f59e0b", silver: "#94a3b8", watchlist: "#fb923c", high_risk: "#ef4444",
  A: "#16a34a", B: "#3b82f6", C: "#f59e0b", D: "#fb923c", E: "#ef4444",
};
const CHANNEL_LABELS: Record<string, string> = {
  agent_main: "وكيل رئيسي", sub_agent: "وكيل فرعي",
  service_center: "مركز خدمة", fixed_pos: "نقطة بيع ثابتة",
  mobile_van: "سيارة بيع متنقلة", inspection: "تفتيش",
};

interface AgentRow {
  id: number; name: string; city: string | null; region: string | null;
  channelType: string | null; classification: string | null; status: string;
  services: string[] | null; latitude: number | null; longitude: number | null;
}
interface InspectionRow {
  id: number; city: string; finalScore: number | null;
  readinessScore: number | null; salesScore: number | null; complianceScore: number | null;
  documentsComplete: boolean | null; brandIdentityCompliant: boolean | null;
  hasSignboard: boolean | null; hasDevices: boolean | null;
  status: string; activityType: string | null;
}
interface DocSummary { total: number; valid: number; expiringSoon: number; expired: number; suspended: number; }
interface DocRow { id: number; agentId: number; docType: string; expiryDate: string | null; status: string; }
interface AgentDocStatus { agentId: number; agentName: string; status: string; expiredCount: number; expiringSoonCount: number; }

export default function Analytics() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [ranking, setRanking] = useState<AgentRankingItem[]>([]);
  const [risk, setRisk] = useState<RiskDistributionItem[]>([]);
  const [docSummary, setDocSummary] = useState<DocSummary | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [agentDocStatuses, setAgentDocStatuses] = useState<AgentDocStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AgentRow[]>("/agents").catch(() => []),
      api.get<InspectionRow[]>("/agent-requests?limit=500").catch(() => []),
      api.get<AgentRankingItem[]>("/dashboard/agent-ranking").catch(() => []),
      api.get<RiskDistributionItem[]>("/dashboard/risk-distribution").catch(() => []),
      api.get<DocSummary>("/documents/summary").catch(() => null),
      api.get<DocRow[]>("/documents").catch(() => []),
      api.get<AgentDocStatus[]>("/documents/agent-status").catch(() => []),
    ]).then(([a, ins, r, rk, ds, d, ads]) => {
      setAgents(a); setInspections(ins); setRanking(r); setRisk(rk);
      setDocSummary(ds); setDocs(d); setAgentDocStatuses(ads);
    }).finally(() => setLoading(false));
  }, []);

  // ===== Geographic =====
  const cityData = useMemo(() => {
    const m = new Map<string, number>();
    agents.forEach(a => { if (a.city) m.set(a.city, (m.get(a.city) ?? 0) + 1); });
    return Array.from(m.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count).slice(0, 12);
  }, [agents]);

  const regionData = useMemo(() => {
    const m = new Map<string, number>();
    agents.forEach(a => { const r = a.region ?? "غير محدد"; m.set(r, (m.get(r) ?? 0) + 1); });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [agents]);

  const geoCoverage = useMemo(() => {
    const withCoords = agents.filter(a => a.latitude != null && a.longitude != null).length;
    const total = agents.length || 1;
    return { withCoords, missing: total - withCoords, pct: Math.round((withCoords / total) * 100) };
  }, [agents]);

  // ===== Services / Channels =====
  const servicesData = useMemo(() => {
    const m = new Map<string, number>();
    agents.forEach(a => (a.services ?? []).forEach(s => m.set(s, (m.get(s) ?? 0) + 1)));
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [agents]);

  const channelData = useMemo(() => {
    const m = new Map<string, number>();
    agents.forEach(a => { const c = a.channelType ?? "غير محدد"; m.set(c, (m.get(c) ?? 0) + 1); });
    return Array.from(m.entries()).map(([key, value]) => ({ name: CHANNEL_LABELS[key] ?? key, value }));
  }, [agents]);

  const classificationData = useMemo(() => {
    const m = new Map<string, number>();
    agents.forEach(a => { const c = a.classification ?? "غير مصنف"; m.set(c, (m.get(c) ?? 0) + 1); });
    return Array.from(m.entries()).map(([key, value]) => ({
      name: CLASS_LABELS[key] ?? key,
      key,
      value,
    })).sort((a, b) => a.key.localeCompare(b.key));
  }, [agents]);

  // ===== Compliance & Violations =====
  const complianceStats = useMemo(() => {
    const total = inspections.length || 1;
    const docOk = inspections.filter(i => i.documentsComplete === true).length;
    const brandOk = inspections.filter(i => i.brandIdentityCompliant === true).length;
    const signOk = inspections.filter(i => i.hasSignboard === true).length;
    const devicesOk = inspections.filter(i => i.hasDevices === true).length;
    return [
      { name: "اكتمال المستندات", pct: Math.round((docOk / total) * 100), violations: inspections.length - docOk },
      { name: "الهوية المؤسسية", pct: Math.round((brandOk / total) * 100), violations: inspections.length - brandOk },
      { name: "اللافتة الخارجية", pct: Math.round((signOk / total) * 100), violations: inspections.length - signOk },
      { name: "أجهزة المبيعات", pct: Math.round((devicesOk / total) * 100), violations: inspections.length - devicesOk },
    ];
  }, [inspections]);

  const totalViolations = useMemo(() => complianceStats.reduce((s, c) => s + c.violations, 0), [complianceStats]);

  const riskData = useMemo(() => risk.map(r => ({
    name: CLASS_LABELS[r.classification] ?? r.classification,
    value: r.count,
    color: CLASS_FILL[r.classification] ?? "#94a3b8",
  })), [risk]);

  // Avg scores radar
  const radarData = useMemo(() => {
    const avg = (k: keyof InspectionRow) => {
      const vals = inspections.map(i => i[k]).filter((v): v is number => typeof v === "number");
      return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
    };
    return [
      { subject: "الجاهزية", value: avg("readinessScore") },
      { subject: "المبيعات", value: avg("salesScore") },
      { subject: "الامتثال", value: avg("complianceScore") },
      { subject: "الإجمالي", value: avg("finalScore") },
    ];
  }, [inspections]);

  // ===== Licenses =====
  const docStatusPie = useMemo(() => {
    if (!docSummary) return [];
    return [
      { name: "سارية", value: docSummary.valid, color: "#16a34a" },
      { name: "قاربت على الانتهاء", value: docSummary.expiringSoon, color: "#f59e0b" },
      { name: "منتهية", value: docSummary.expired, color: "#ef4444" },
      { name: "موقوفة", value: docSummary.suspended, color: "#94a3b8" },
    ].filter(d => d.value > 0);
  }, [docSummary]);

  const expiryTimeline = useMemo(() => {
    const now = Date.now();
    const buckets = [
      { label: "≤ 7 أيام",  max: 7,  count: 0 },
      { label: "8–30 يوم",  max: 30, count: 0 },
      { label: "31–60 يوم", max: 60, count: 0 },
      { label: "61–90 يوم", max: 90, count: 0 },
    ];
    docs.forEach(d => {
      if (!d.expiryDate || d.status === "expired") return;
      const days = Math.ceil((new Date(d.expiryDate).getTime() - now) / 86400000);
      if (days < 0) return;
      for (const b of buckets) { if (days <= b.max) { b.count++; break; } }
    });
    return buckets;
  }, [docs]);

  const docTypeBreakdown = useMemo(() => {
    const m = new Map<string, { valid: number; expiring_soon: number; expired: number }>();
    docs.forEach(d => {
      const cur = m.get(d.docType) ?? { valid: 0, expiring_soon: 0, expired: 0 };
      if (d.status === "valid") cur.valid++;
      else if (d.status === "expiring_soon") cur.expiring_soon++;
      else if (d.status === "expired") cur.expired++;
      m.set(d.docType, cur);
    });
    return Array.from(m.entries()).map(([type, v]) => ({ type, ...v }));
  }, [docs]);

  const topAtRisk = useMemo(() => {
    return [...agentDocStatuses]
      .filter(a => a.expiredCount > 0 || a.expiringSoonCount > 0)
      .sort((a, b) => (b.expiredCount * 10 + b.expiringSoonCount) - (a.expiredCount * 10 + a.expiringSoonCount))
      .slice(0, 10);
  }, [agentDocStatuses]);

  // ===== Top KPIs =====
  const kpis = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === "active").length;
    return {
      totalAgents, activeAgents,
      avgCompliance: radarData[2]?.value ?? 0,
      avgFinal: radarData[3]?.value ?? 0,
      docsValid: docSummary?.valid ?? 0,
      docsExpired: docSummary?.expired ?? 0,
      docsExpiring: docSummary?.expiringSoon ?? 0,
      violations: totalViolations,
    };
  }, [agents, radarData, docSummary, totalViolations]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">التحليلات الذكية</h1>
        <p className="text-muted-foreground text-sm mt-1">رؤى تحليلية شاملة عن الموقع، الخدمات، الالتزام، والتراخيص</p>
      </div>

      {/* ===== KPI cards ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard icon={<MapPin size={16} />} label="إجمالي الوكلاء" value={kpis.totalAgents} color="text-blue-600" />
        <KpiCard icon={<CheckCircle2 size={16} />} label="نشط" value={kpis.activeAgents} color="text-green-600" />
        <KpiCard icon={<Award size={16} />} label="متوسط التقييم" value={`${kpis.avgFinal}%`} color="text-amber-600" />
        <KpiCard icon={<ShieldAlert size={16} />} label="متوسط الامتثال" value={`${kpis.avgCompliance}%`} color="text-purple-600" />
        <KpiCard icon={<FileCheck size={16} />} label="تراخيص سارية" value={kpis.docsValid} color="text-green-600" />
        <KpiCard icon={<Clock size={16} />} label="قارب انتهاؤها" value={kpis.docsExpiring} color="text-amber-600" />
        <KpiCard icon={<XCircle size={16} />} label="منتهية" value={kpis.docsExpired} color="text-red-600" />
        <KpiCard icon={<AlertTriangle size={16} />} label="إجمالي المخالفات" value={kpis.violations} color="text-orange-600" />
      </div>

      {/* ===== SECTION 1: Location & Place ===== */}
      <Section icon={<MapPin size={18} />} title="الموقع والتغطية الجغرافية" subtitle="توزع الوكلاء حسب المدن والمناطق ودقة الإحداثيات">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="الوكلاء حسب المدينة (أعلى 12)" colSpan={2}>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={cityData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e3a8a" radius={[0, 4, 4, 0]} name="عدد الوكلاء" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </ChartCard>

          <div className="space-y-5">
            <ChartCard title="حسب المنطقة">
              {regionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={regionData} cx="50%" cy="50%" outerRadius={55} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                      {regionData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Empty h={140} />}
            </ChartCard>
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">دقة الإحداثيات الجغرافية</p>
              <p className="text-3xl font-bold text-blue-700">{geoCoverage.pct}%</p>
              <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2" style={{ width: `${geoCoverage.pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {geoCoverage.withCoords} من {geoCoverage.withCoords + geoCoverage.missing} وكيل لديه إحداثيات
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== SECTION 2: Services & Coverage ===== */}
      <Section icon={<Package size={18} />} title="الخدمات والوفرة" subtitle="توزيع الخدمات المقدمة وأنواع القنوات">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="توزيع الخدمات المقدمة">
            {servicesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={servicesData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="عدد الوكلاء" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </ChartCard>

          <ChartCard title="توزيع القنوات">
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="name"
                       label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {channelData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </ChartCard>
        </div>
      </Section>

      {/* ===== SECTION 3: Compliance & Violations ===== */}
      <Section icon={<ShieldAlert size={18} />} title="الالتزام والمخالفات" subtitle="نسب الامتثال للمعايير ومستويات المخاطر">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="نسب الالتزام بالمعايير" colSpan={2}>
            {complianceStats.length > 0 ? (
              <div className="space-y-4">
                {complianceStats.map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                      <span className="text-sm">
                        <span className={`font-bold ${c.pct >= 80 ? "text-green-600" : c.pct >= 60 ? "text-amber-600" : "text-red-600"}`}>{c.pct}%</span>
                        {c.violations > 0 && <span className="text-xs text-red-500 mr-2">({c.violations} مخالفة)</span>}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.pct >= 80 ? "bg-green-500" : c.pct >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <Empty />}
          </ChartCard>

          <ChartCard title="توزيع مستويات المخاطر">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name"
                       label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {riskData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty h={260} />}
          </ChartCard>

          <ChartCard title="متوسط مؤشرات الأداء" colSpan={2}>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="المتوسط" dataKey="value" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="توزيع التصنيفات (A–E)">
            {classificationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={classificationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="عدد الوكلاء">
                    {classificationData.map((d, i) => <Cell key={i} fill={CLASS_FILL[d.key] ?? PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty h={280} />}
          </ChartCard>
        </div>
      </Section>

      {/* ===== SECTION 4: License Validity ===== */}
      <Section icon={<FileCheck size={18} />} title="صلاحية التراخيص والمستندات" subtitle="حالة المستندات، تواريخ الانتهاء، والوكلاء الأكثر عرضة للخطر">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="حالة جميع المستندات">
            {docStatusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={docStatusPie} cx="50%" cy="50%" outerRadius={95} dataKey="value" nameKey="name"
                       label={({ name, value }) => `${name}: ${value}`}>
                    {docStatusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty h={260} />}
          </ChartCard>

          <ChartCard title="مستندات ستنتهي قريباً" colSpan={2}>
            {expiryTimeline.some(b => b.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={expiryTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#f59e0b" fill="#fde68a" name="عدد المستندات" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Empty h={260} text="لا توجد مستندات قاربت على الانتهاء" />}
          </ChartCard>

          <ChartCard title="حالة المستندات حسب النوع" colSpan={3}>
            {docTypeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={docTypeBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valid" stackId="a" fill="#16a34a" name="سارية" />
                  <Bar dataKey="expiring_soon" stackId="a" fill="#f59e0b" name="قاربت على الانتهاء" />
                  <Bar dataKey="expired" stackId="a" fill="#ef4444" name="منتهية" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty h={300} text="لا توجد مستندات مسجلة بعد" />}
          </ChartCard>
        </div>

        {topAtRisk.length > 0 && (
          <div className="mt-5 bg-white rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              الوكلاء الأكثر عرضة لخطر التراخيص (أعلى 10)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">#</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">الوكيل</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">منتهية</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">قاربت على الانتهاء</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topAtRisk.map((a, i) => (
                    <tr key={a.agentId} className="hover:bg-muted/30">
                      <td className="py-2.5 text-muted-foreground font-mono">{i + 1}</td>
                      <td className="py-2.5 font-medium">{a.agentName}</td>
                      <td className="py-2.5">
                        {a.expiredCount > 0 ? <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{a.expiredCount}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-2.5">
                        {a.expiringSoonCount > 0 ? <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{a.expiringSoonCount}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "expired" ? "bg-red-100 text-red-700" : a.status === "expiring_soon" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          {a.status === "expired" ? "منتهية" : a.status === "expiring_soon" ? "قاربت على الانتهاء" : "سارية"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* ===== SECTION 5: Top performers ===== */}
      <Section icon={<TrendingUp size={18} />} title="أفضل الوكلاء أداءً" subtitle="ترتيب الوكلاء حسب التقييم النهائي">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          {ranking.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">#</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">الوكيل</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">التصنيف</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground">التقييم</th>
                    <th className="pb-2 text-right font-semibold text-muted-foreground w-40">الشريط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ranking.slice(0, 15).map((a, i) => (
                    <tr key={a.agentId} className="hover:bg-muted/30">
                      <td className="py-2.5 text-muted-foreground font-mono">{i + 1}</td>
                      <td className="py-2.5 font-medium">{a.agentName}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: (CLASS_FILL[a.classification] ?? "#94a3b8") + "20", color: CLASS_FILL[a.classification] ?? "#475569" }}>
                          {CLASS_LABELS[a.classification] ?? a.classification}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-primary">{a.score}/100</td>
                      <td className="py-2.5">
                        <div className="bg-muted rounded-full h-2">
                          <div className={`h-2 rounded-full ${a.score >= 80 ? "bg-green-500" : a.score >= 60 ? "bg-blue-500" : a.score >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${a.score}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty />}
        </div>
      </Section>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-sm">
      <div className={`flex items-center gap-1.5 ${color} mb-1`}>{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">{icon}</div>
        <div>
          <h2 className="font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ChartCard({ title, colSpan = 1, children }: { title: string; colSpan?: 1 | 2 | 3; children: React.ReactNode }) {
  const cls = colSpan === 3 ? "lg:col-span-3" : colSpan === 2 ? "lg:col-span-2" : "";
  return (
    <div className={`bg-white rounded-xl border border-border p-5 shadow-sm ${cls}`}>
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Layers size={14} className="text-gray-400" />{title}</h3>
      {children}
    </div>
  );
}

function Empty({ h = 280, text = "لا توجد بيانات كافية" }: { h?: number; text?: string }) {
  return <div style={{ height: h }} className="flex items-center justify-center text-muted-foreground text-sm">{text}</div>;
}
