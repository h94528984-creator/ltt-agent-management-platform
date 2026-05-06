import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import type { AgentRequest } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import { Search, ChevronDown, MapPin, Phone, Mail, Star, Plus, Pencil, Trash2, Download, Eye, FileText, AlertTriangle } from "lucide-react";
import type { AgentDocStatus } from "@/lib/api";
import { Link } from "wouter";

interface Agent {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
}

interface AgentScore {
  agentId: number;
  totalScore: number;
  classification: string;
  complianceScore: number;
  salesAccuracyScore: number;
  salesPerformanceScore: number;
  activityScore: number;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  dealer: "وكيل",
};
const TYPE_OPTIONS = [{ v: "dealer", l: "وكيل" }];
const STATUS_OPTIONS = [
  { v: "active", l: "نشط" },
  { v: "inactive", l: "غير نشط" },
  { v: "suspended", l: "موقوف" },
  { v: "pending", l: "قيد المراجعة" },
];
const CLASS_COLORS: Record<string, string> = {
  gold: "bg-amber-100 text-amber-700 border-amber-200",
  silver: "bg-slate-100 text-slate-600 border-slate-200",
  watchlist: "bg-orange-100 text-orange-700 border-orange-200",
  high_risk: "bg-red-100 text-red-700 border-red-200",
};
const CLASS_LABELS: Record<string, string> = {
  gold: "ذهبي", silver: "فضي", watchlist: "مراقبة", high_risk: "خطر عالي",
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [scores, setScores] = useState<Map<number, AgentScore>>(new Map());
  const [docStatus, setDocStatus] = useState<Map<number, AgentDocStatus>>(new Map());
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selected, setSelected] = useState<Agent | null>(null);
  const [editing, setEditing] = useState<Agent | "new" | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<Agent[]>("/agents"),
      api.get<AgentScore[]>("/scores"),
      api.get<AgentRequest[]>("/agent-requests?limit=10000"),
      api.get<AgentDocStatus[]>("/documents/agent-status"),
    ]).then(([agts, scrs, reqs, ds]) => {
      setAgents(agts ?? []);
      const map = new Map<number, AgentScore>();
      (scrs ?? []).forEach((s) => map.set(s.agentId, s));
      setScores(map);
      setRequests(reqs ?? []);
      const dmap = new Map<number, AgentDocStatus>();
      (ds ?? []).forEach((d) => dmap.set(d.agentId, d));
      setDocStatus(dmap);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    agents.forEach((a) => { if (a.city) set.add(a.city); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [agents]);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || (a.city ?? "").toLowerCase().includes(q) || (a.phone ?? "").includes(q);
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchCity = !cityFilter || a.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const inspectionsForAgent = useCallback((agent: Agent): AgentRequest[] => {
    return requests.filter((r) =>
      r.agentId === agent.id ||
      (r.agentId == null && r.agentName.trim().toLowerCase() === agent.name.trim().toLowerCase())
    );
  }, [requests]);

  function exportToCsv() {
    exportCsv(
      filtered.map((a) => {
        const score = scores.get(a.id);
        const insp = inspectionsForAgent(a);
        return {
          id: a.id,
          name: a.name,
          type: "وكيل",
          status: a.status,
          city: a.city ?? "",
          phone: a.phone ?? "",
          email: a.email ?? "",
          score: score?.totalScore ?? "",
          classification: score ? CLASS_LABELS[score.classification] ?? score.classification : "",
          inspectionCount: insp.length,
        };
      }),
      [
        { key: "id", label: "المعرف" },
        { key: "name", label: "الاسم" },
        { key: "type", label: "النوع" },
        { key: "status", label: "الحالة" },
        { key: "city", label: "المدينة" },
        { key: "phone", label: "الهاتف" },
        { key: "email", label: "البريد" },
        { key: "score", label: "التقييم" },
        { key: "classification", label: "التصنيف" },
        { key: "inspectionCount", label: "عدد التفتيشات" },
      ],
      `dealers-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  async function handleDelete(agent: Agent) {
    const linkedCount = inspectionsForAgent(agent).length;
    const warning = linkedCount > 0
      ? `\n\nتنبيه: هذا الوكيل مرتبط بـ ${linkedCount} تقرير تفتيش. سيتم الاحتفاظ بالتقارير لكن سيُلغى ربطها بهذا الوكيل.`
      : "";
    if (!confirm(`هل تريد حذف الوكيل "${agent.name}" نهائياً؟${warning}`)) return;
    try {
      await api.delete(`/agents/${agent.id}`);
      load();
    } catch (err) {
      alert("فشل الحذف: " + (err as Error).message);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الوكلاء</h1>
          <p className="text-muted-foreground text-sm mt-1">قاعدة بيانات الوكلاء الموحدة — {agents.length} وكيل مسجل</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCsv} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
            <Download size={15} />
            تصدير CSV
          </button>
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
            <Plus size={15} />
            وكيل جديد
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي الوكلاء", value: agents.length },
          { label: "نشط", value: agents.filter((a) => a.status === "active").length },
          { label: "موقوف", value: agents.filter((a) => a.status === "suspended").length },
          { label: "تم تفتيشهم", value: new Set(requests.filter(r => r.agentId).map(r => r.agentId)).size },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم الوكيل أو المدينة أو الهاتف..." className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        {[{ value: cityFilter, onChange: setCityFilter, options: [{ v: "", l: "جميع المدن" }, ...cities.map(c => ({ v: c, l: c }))] }, { value: statusFilter, onChange: setStatusFilter, options: [{ v: "", l: "جميع الحالات" }, ...STATUS_OPTIONS] }].map((sel, i) => (
          <div key={i} className="relative">
            <select value={sel.value} onChange={(e) => sel.onChange(e.target.value)} className="appearance-none border border-border rounded-lg pr-4 pl-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white min-w-[140px]">
              {sel.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 py-16 text-center text-muted-foreground">جاري التحميل...</div> : filtered.length === 0 ? <div className="col-span-3 py-16 text-center text-muted-foreground">لا توجد نتائج</div> : filtered.map((agent) => {
          const score = scores.get(agent.id);
          const inspCount = inspectionsForAgent(agent).length;
          const ds = docStatus.get(agent.id);
          return <div key={agent.id} className="bg-white border border-border rounded-xl p-5 shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all relative group" onClick={() => setSelected(agent)}>
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); setEditing(agent); }} className="p-1.5 bg-white border border-border rounded hover:bg-muted" title="تعديل"><Pencil size={12} /></button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(agent); }} className="p-1.5 bg-white border border-border rounded hover:bg-red-50 hover:border-red-200" title="حذف"><Trash2 size={12} className="text-red-600" /></button>
            </div>
            <div className="flex items-start justify-between mb-3 pr-12">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-2">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{TYPE_LABELS[agent.type] ?? "وكيل"}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {score && <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CLASS_COLORS[score.classification] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{CLASS_LABELS[score.classification] ?? score.classification}</span>}
                {ds?.hasExpired ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 inline-flex items-center gap-1"><AlertTriangle size={10} /> ترخيص منتهٍ</span>
                ) : ds?.hasExpiringSoon ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 inline-flex items-center gap-1"><AlertTriangle size={10} /> ترخيص قارب على الانتهاء</span>
                ) : null}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${agent.status === "active" && !ds?.hasExpired ? "bg-green-100 text-green-700" : agent.status === "suspended" || ds?.hasExpired ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                  {ds?.hasExpired ? "موقوف (ترخيص منتهٍ)" : agent.status === "active" ? "نشط" : agent.status === "suspended" ? "موقوف" : "غير نشط"}
                </span>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              {agent.city && <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={13} /><span>{agent.city}</span></div>}
              {agent.phone && <div className="flex items-center gap-1.5 text-muted-foreground"><Phone size={13} /><span className="ltr" dir="ltr">{agent.phone}</span></div>}
              {agent.email && <div className="flex items-center gap-1.5 text-muted-foreground truncate"><Mail size={13} /><span className="ltr text-xs truncate" dir="ltr">{agent.email}</span></div>}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
              {score ? <><div className="flex items-center gap-1 text-xs text-muted-foreground"><Star size={12} /><span>التقييم</span></div><span className={`font-bold ${score.totalScore >= 85 ? "text-amber-500" : score.totalScore >= 70 ? "text-blue-500" : score.totalScore >= 50 ? "text-orange-500" : "text-red-500"}`}>{score.totalScore}/100</span></> : <span className="text-xs text-muted-foreground">لم يُقيَّم بعد</span>}
              <div className="flex items-center gap-2">
                {inspCount > 0 && <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium"><Eye size={11} />{inspCount}</span>}
                <Link href="/documents" onClick={(e) => e.stopPropagation()}>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium hover:text-primary cursor-pointer"><FileText size={11} />{ds?.total ?? 0}</span>
                </Link>
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>
  );
}
