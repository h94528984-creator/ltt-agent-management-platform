import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Search, ChevronDown, AlertCircle, Clock, CheckCircle2, Plus, X } from "lucide-react";

interface Ticket {
  id: number;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  agentId: number | null;
  assignedTo: number | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجل",
};
const STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة",
  in_progress: "قيد التنفيذ",
  resolved: "محلولة",
  closed: "مغلقة",
};
const CATEGORY_LABELS: Record<string, string> = {
  technical: "تقني",
  compliance: "امتثال",
  billing: "فواتير",
  stock: "مخزون",
  other: "أخرى",
};

function CreateTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Ticket) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("medium");
  const [agentId, setAgentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { setError("العنوان والوصف مطلوبان"); return; }
    setSaving(true); setError(null);
    try {
      const userRaw = localStorage.getItem("ltt_user");
      const createdById = userRaw ? (JSON.parse(userRaw).id as number) : 1;
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        category, priority, createdById,
      };
      if (agentId.trim()) body.agentId = parseInt(agentId.trim());
      const created = await api.post<Ticket>("/tickets", body);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-foreground">إنشاء تذكرة عمل جديدة</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">العنوان *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="مثال: مشكلة في جهاز POS" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">الوصف *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">الفئة</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">الأولوية</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
                {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">معرّف الوكيل (اختياري)</label>
            <input value={agentId} onChange={(e) => setAgentId(e.target.value)} type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="رقم الوكيل" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <div className="border-t border-border px-6 py-3 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">إلغاء</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">{saving ? "جاري الحفظ..." : "إنشاء التذكرة"}</button>
        </div>
      </form>
    </div>
  );
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get<Ticket[]>("/tickets")
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q);
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    urgent: tickets.filter((t) => t.priority === "urgent").length,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">نظام التذاكر</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة وتتبع مشكلات الوكلاء والبلاغات</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          إنشاء تذكرة جديدة
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "مفتوحة", value: summary.open, icon: AlertCircle, cls: "text-blue-500" },
          { label: "قيد التنفيذ", value: summary.in_progress, icon: Clock, cls: "text-yellow-500" },
          { label: "محلولة", value: summary.resolved, icon: CheckCircle2, cls: "text-green-500" },
          { label: "عاجل", value: summary.urgent, icon: AlertCircle, cls: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
            <s.icon size={22} className={s.cls} />
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في التذاكر..."
            className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none border border-border rounded-lg pr-4 pl-8 py-2.5 text-sm focus:outline-none bg-white"
          >
            <option value="">جميع الحالات</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">العنوان</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الفئة</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الأولوية</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">لا توجد تذاكر</td></tr>
            ) : filtered.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{t.title}</p>
                  {t.description && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{t.description}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{CATEGORY_LABELS[t.category] ?? t.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[t.priority] ?? "bg-gray-100 text-gray-600"}`}>
                    {PRIORITY_LABELS[t.priority] ?? t.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    t.status === "open" ? "bg-blue-100 text-blue-700" :
                    t.status === "in_progress" ? "bg-yellow-100 text-yellow-700" :
                    t.status === "resolved" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(t.createdAt).toLocaleDateString("ar-LY")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={(t) => setTickets((prev) => [t, ...prev])}
        />
      )}
    </div>
  );
}
