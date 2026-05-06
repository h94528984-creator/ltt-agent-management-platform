import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import type { AgentRequest, AgentDocStatus } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { exportCsv } from "@/lib/exportCsv";
import { Search, ChevronDown, MapPin, Phone, Mail, Star, Plus, Pencil, Trash2, Download, Eye, FileText, AlertTriangle } from "lucide-react";
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
  channelType: string | null;
  classification: string | null;
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
const AGENT_CLASS_INFO: Record<string, { label: string; guarantee: string; maxBranches: string; color: string }> = {
  A: { label: "Class A", guarantee: "25,000 د.ل.", maxBranches: "25 فرعاً", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  B: { label: "Class B", guarantee: "20,000 د.ل.", maxBranches: "15 فرعاً", color: "bg-sky-100 text-sky-700 border-sky-200" },
  C: { label: "Class C", guarantee: "15,000 د.ل.", maxBranches: "7 فروع", color: "bg-amber-100 text-amber-700 border-amber-200" },
  D: { label: "Class D", guarantee: "10,000 د.ل.", maxBranches: "3 فروع", color: "bg-orange-100 text-orange-700 border-orange-200" },
  E: { label: "Class E", guarantee: "5,000 د.ل.", maxBranches: "1 فرع فقط", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [scores, setScores] = useState<Map<number, AgentScore>>(new Map());
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [docStatuses, setDocStatuses] = useState<Map<number, AgentDocStatus>>(new Map());
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
    ]).then(([agts, scrs, reqs, docSts]) => {
      setAgents(agts ?? []);
      const map = new Map<number, AgentScore>();
      (scrs ?? []).forEach((s) => map.set(s.agentId, s));
      setScores(map);
      setRequests(reqs ?? []);
      const docMap = new Map<number, AgentDocStatus>();
      (docSts ?? []).forEach((d) => docMap.set(d.agentId, d));
      setDocStatuses(docMap);
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
  const visibleAgents = filtered.slice(0, 190);

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
        {loading ? <div className="col-span-3 py-16 text-center text-muted-foreground">جاري التحميل...</div> : visibleAgents.length === 0 ? <div className="col-span-3 py-16 text-center text-muted-foreground">لا توجد نتائج</div> : visibleAgents.map((agent) => {
          const score = scores.get(agent.id);
          const inspCount = inspectionsForAgent(agent).length;
          const classKey = agent.classification && AGENT_CLASS_INFO[agent.classification] ? agent.classification : null;
          const classInfo = classKey ? AGENT_CLASS_INFO[classKey] : null;
          const docSt = docStatuses.get(agent.id);
          return <div key={agent.id} className="bg-white border border-border rounded-xl p-5 shadow-sm cursor-pointer hover:border-primary/30 hover:shadow-md transition-all relative group" onClick={() => setSelected(agent)}>
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); setEditing(agent); }} className="p-1.5 bg-white border border-border rounded hover:bg-muted" title="تعديل"><Pencil size={12} /></button>
              {getUser()?.role === "admin" && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(agent); }} className="p-1.5 bg-white border border-border rounded hover:bg-red-50 hover:border-red-200" title="حذف"><Trash2 size={12} className="text-red-600" /></button>
              )}
            </div>
            <div className="flex items-start justify-between mb-3 pr-12">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-2">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{TYPE_LABELS[agent.type] ?? "وكيل"}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {score && <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CLASS_COLORS[score.classification] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{CLASS_LABELS[score.classification] ?? score.classification}</span>}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${agent.status === "active" ? "bg-green-100 text-green-700" : agent.status === "suspended" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                  {agent.status === "active" ? "نشط" : agent.status === "suspended" ? "موقوف" : "غير نشط"}
                </span>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              {agent.city && <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={13} /><span>{agent.city}</span></div>}
              {agent.phone && <div className="flex items-center gap-1.5 text-muted-foreground"><Phone size={13} /><span className="ltr" dir="ltr">{agent.phone}</span></div>}
              {agent.email && <div className="flex items-center gap-1.5 text-muted-foreground truncate"><Mail size={13} /><span className="ltr text-xs truncate" dir="ltr">{agent.email}</span></div>}
            </div>
            {docSt && docSt.total > 0 && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {docSt.hasExpired && (
                  <Link href="/documents" onClick={e => e.stopPropagation()}>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">
                      <AlertTriangle size={10} /> وثيقة منتهية
                    </span>
                  </Link>
                )}
                {!docSt.hasExpired && docSt.hasExpiringSoon && (
                  <Link href="/documents" onClick={e => e.stopPropagation()}>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                      <AlertTriangle size={10} /> تنتهي قريباً
                    </span>
                  </Link>
                )}
                {!docSt.hasExpired && !docSt.hasExpiringSoon && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FileText size={10} /> {docSt.total} وثيقة سارية
                  </span>
                )}
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {classInfo ? (
                  <>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${classInfo.color}`}>{classInfo.label}</span>
                    <span>{classInfo.guarantee}</span>
                    <span>{classInfo.maxBranches}</span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-gray-50 text-gray-500 border-gray-200">التصنيف غير محدد</span>
                )}
              </div>
              {score ? <><div className="flex items-center gap-1 text-xs text-muted-foreground"><Star size={12} /><span>التقييم</span></div><span className={`font-bold ${score.totalScore >= 85 ? "text-amber-500" : score.totalScore >= 70 ? "text-blue-500" : score.totalScore >= 50 ? "text-orange-500" : "text-red-500"}`}>{score.totalScore}/100</span></> : <span className="text-xs text-muted-foreground">لم يُقيَّم بعد</span>}
              <div className="flex items-center gap-2">
                {inspCount > 0 && <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium"><Eye size={11} />{inspCount}</span>}
              </div>
            </div>
          </div>;
        })}
      </div>
      {editing && (
        <EditAgentModal
          agent={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function EditAgentModal({ agent, onClose, onSaved }: { agent: Agent | null; onClose: () => void; onSaved: () => void }) {
  const isNew = agent === null;
  const [form, setForm] = useState({
    name: agent?.name ?? "",
    city: agent?.city ?? "",
    address: agent?.address ?? "",
    phone: agent?.phone ?? "",
    email: agent?.email ?? "",
    classification: agent?.classification ?? "",
    channelType: agent?.channelType ?? "agent_main",
    status: agent?.status ?? "active",
    latitude: agent?.latitude != null ? String(agent.latitude) : "",
    longitude: agent?.longitude != null ? String(agent.longitude) : "",
    notes: agent?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim() || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        classification: form.classification || null,
        channelType: form.channelType || null,
        status: form.status,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        notes: form.notes.trim() || null,
      };
      if (isNew) {
        await api.post("/agents", { ...payload, location: form.city.trim() || form.address.trim() || "—", type: "dealer" });
      } else {
        await api.patch(`/agents/${agent!.id}`, payload);
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message || "فشل الحفظ");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSave}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-bold">{isNew ? "وكيل جديد" : `تعديل: ${agent!.name}`}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم الوكيل *" className="md:col-span-2">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </Field>
          <Field label="المدينة">
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </Field>
          <Field label="الهاتف">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" dir="ltr" />
          </Field>
          <Field label="العنوان" className="md:col-span-2">
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </Field>
          <Field label="البريد الإلكتروني">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" dir="ltr" />
          </Field>
          <Field label="الحالة">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
              {STATUS_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
          <Field label="التصنيف (Class)">
            <select value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">— غير محدد —</option>
              {Object.entries(AGENT_CLASS_INFO).map(([k, v]) => <option key={k} value={k}>{v.label} ({v.guarantee})</option>)}
            </select>
          </Field>
          <Field label="نوع القناة">
            <select value={form.channelType} onChange={(e) => setForm({ ...form, channelType: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="agent_main">وكيل رئيسي</option>
              <option value="agent_sub">وكيل فرعي</option>
              <option value="service_center">مركز خدمات</option>
              <option value="fixed_pos">نقطة بيع ثابتة</option>
              <option value="mobile_van">سيارة بيع متنقلة</option>
              <option value="peddler">بائع متجول</option>
            </select>
          </Field>
          <Field label="خط العرض (Latitude)">
            <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" dir="ltr" inputMode="decimal" />
          </Field>
          <Field label="خط الطول (Longitude)">
            <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" dir="ltr" inputMode="decimal" />
          </Field>
          <Field label="ملاحظات" className="md:col-span-2">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" rows={3} />
          </Field>
          {error && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">إلغاء</button>
          <button type="submit" disabled={saving || !form.name.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}
