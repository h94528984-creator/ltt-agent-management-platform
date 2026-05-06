import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Search, ChevronDown, MapPin, Phone, Mail, Star } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  type: string;
  status: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  contractStart: string | null;
  contractEnd: string | null;
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
  dealer: "تاجر",
  center: "مركز",
  sub_agent: "وكيل فرعي",
  mobile_seller: "بائع متجول",
};
const CLASS_COLORS: Record<string, string> = {
  gold: "bg-amber-100 text-amber-700 border-amber-200",
  silver: "bg-slate-100 text-slate-600 border-slate-200",
  watchlist: "bg-orange-100 text-orange-700 border-orange-200",
  high_risk: "bg-red-100 text-red-700 border-red-200",
};
const CLASS_LABELS: Record<string, string> = {
  gold: "ذهبي",
  silver: "فضي",
  watchlist: "مراقبة",
  high_risk: "خطر عالي",
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [scores, setScores] = useState<Map<number, AgentScore>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState<Agent | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<Agent[]>("/agents"),
      api.get<AgentScore[]>("/scores"),
    ]).then(([agts, scrs]) => {
      setAgents(agts);
      const map = new Map<number, AgentScore>();
      scrs.forEach((s) => map.set(s.agentId, s));
      setScores(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || (a.city ?? "").toLowerCase().includes(q);
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchType = !typeFilter || a.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const scoreFor = (id: number) => scores.get(id);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة الوكلاء</h1>
        <p className="text-muted-foreground text-sm mt-1">قائمة الوكلاء والتجار المسجلين في المنطقة الغربية</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي الوكلاء", value: agents.length },
          { label: "نشط", value: agents.filter((a) => a.status === "active").length },
          { label: "غير نشط", value: agents.filter((a) => a.status === "inactive").length },
          { label: "معلق", value: agents.filter((a) => a.status === "suspended").length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الوكيل أو المدينة..."
            className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {[
          { value: statusFilter, onChange: setStatusFilter, options: [{ v: "", l: "جميع الحالات" }, { v: "active", l: "نشط" }, { v: "inactive", l: "غير نشط" }, { v: "suspended", l: "معلق" }] },
          { value: typeFilter, onChange: setTypeFilter, options: [{ v: "", l: "جميع الأنواع" }, { v: "dealer", l: "تاجر" }, { v: "center", l: "مركز" }, { v: "sub_agent", l: "وكيل فرعي" }, { v: "mobile_seller", l: "بائع متجول" }] },
        ].map((sel, i) => (
          <div key={i} className="relative">
            <select
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="appearance-none border border-border rounded-lg pr-4 pl-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              {sel.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-muted-foreground">لا توجد نتائج</div>
        ) : filtered.map((agent) => {
          const score = scoreFor(agent.id);
          return (
            <div
              key={agent.id}
              className="bg-white border border-border rounded-xl p-5 shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
              onClick={() => setSelected(agent)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{TYPE_LABELS[agent.type] ?? agent.type}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {score && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CLASS_COLORS[score.classification] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {CLASS_LABELS[score.classification] ?? score.classification}
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${agent.status === "active" ? "bg-green-100 text-green-700" : agent.status === "suspended" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                    {agent.status === "active" ? "نشط" : agent.status === "suspended" ? "موقوف" : "غير نشط"}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                {agent.city && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={13} />
                    <span>{agent.city}</span>
                  </div>
                )}
                {agent.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone size={13} />
                    <span className="ltr" dir="ltr">{agent.phone}</span>
                  </div>
                )}
              </div>
              {score && (
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star size={12} />
                      <span>التقييم الإجمالي</span>
                    </div>
                    <span className={`font-bold ${score.totalScore >= 85 ? "text-amber-500" : score.totalScore >= 70 ? "text-blue-500" : score.totalScore >= 50 ? "text-orange-500" : "text-red-500"}`}>
                      {score.totalScore}/100
                    </span>
                  </div>
                  <div className="mt-2 bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${score.totalScore >= 85 ? "bg-amber-500" : score.totalScore >= 70 ? "bg-blue-500" : score.totalScore >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                      style={{ width: `${score.totalScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <AgentDetailModal agent={selected} score={scoreFor(selected.id)} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function AgentDetailModal({ agent, score, onClose }: { agent: Agent; score: AgentScore | undefined; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground">{agent.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl font-light">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "النوع", value: TYPE_LABELS[agent.type] ?? agent.type },
              { label: "المدينة", value: agent.city },
              { label: "الهاتف", value: agent.phone },
              { label: "البريد", value: agent.email },
              { label: "العنوان", value: agent.address },
              { label: "بداية العقد", value: agent.contractStart ? new Date(agent.contractStart).toLocaleDateString("ar-LY") : null },
              { label: "نهاية العقد", value: agent.contractEnd ? new Date(agent.contractEnd).toLocaleDateString("ar-LY") : null },
            ].map((f) => f.value ? (
              <div key={f.label}>
                <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                <p className="text-foreground">{f.value}</p>
              </div>
            ) : null)}
          </div>
          {agent.notes && (
            <div className="bg-muted rounded-lg p-3 text-sm text-foreground">{agent.notes}</div>
          )}
          {score && (
            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">تفاصيل التقييم</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "الامتثال (30%)", value: score.complianceScore },
                  { label: "دقة المبيعات (25%)", value: score.salesAccuracyScore },
                  { label: "أداء المبيعات (25%)", value: score.salesPerformanceScore },
                  { label: "النشاط (20%)", value: score.activityScore },
                ].map((s) => (
                  <div key={s.label} className="bg-muted rounded-lg p-3">
                    <p className="text-lg font-bold text-primary">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-3xl font-bold text-foreground">{score.totalScore}</span>
                <span className="text-muted-foreground">/100</span>
                <p className="text-xs text-muted-foreground mt-1">
                  التصنيف: <span className="font-medium">{CLASS_LABELS[score.classification] ?? score.classification}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
