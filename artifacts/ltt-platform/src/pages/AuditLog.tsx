import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { History, Filter, RefreshCw, User as UserIcon, FileText } from "lucide-react";

interface AuditEntry {
  id: number;
  userId: number | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  login: "bg-purple-100 text-purple-700",
  approve: "bg-emerald-100 text-emerald-700",
  reject: "bg-orange-100 text-orange-700",
};

const ACTION_LABELS: Record<string, string> = {
  create: "إنشاء",
  update: "تعديل",
  delete: "حذف",
  login: "تسجيل دخول",
  approve: "اعتماد",
  reject: "رفض",
};

const ENTITY_LABELS: Record<string, string> = {
  user: "مستخدم",
  agent: "وكيل",
  ticket: "تذكرة",
  document: "مستند",
  agent_request: "طلب",
  inventory: "مخزون",
  inspection: "تفتيش",
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    const q = entityFilter ? `?entityType=${entityFilter}` : "";
    api.get<AuditEntry[]>(`/audit-log${q}`).then(setEntries).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [entityFilter]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actionFilter && e.action !== actionFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!e.summary.toLowerCase().includes(s) && !(e.userName ?? "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [entries, actionFilter, search]);

  const entityTypes = Array.from(new Set(entries.map((e) => e.entityType)));
  const actions = Array.from(new Set(entries.map((e) => e.action)));

  return (
    <div className="p-3 sm:p-6 space-y-5" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History size={24} className="text-purple-500" />
            سجل النشاط
          </h1>
          <p className="text-muted-foreground text-sm mt-1">جميع العمليات التي تمت في النظام</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-white border border-border rounded-lg px-4 py-2 text-sm hover:bg-gray-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Filter size={12} /> نوع الكيان</label>
          <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">الكل</option>
            {entityTypes.map((t) => <option key={t} value={t}>{ENTITY_LABELS[t] ?? t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Filter size={12} /> العملية</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">الكل</option>
            {actions.map((a) => <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">بحث</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث في الملخص أو اسم المستخدم..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-muted-foreground">
            <tr>
              <th className="text-right p-3">الوقت</th>
              <th className="text-right p-3">المستخدم</th>
              <th className="text-right p-3">العملية</th>
              <th className="text-right p-3">الكيان</th>
              <th className="text-right p-3">الملخص</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جارٍ التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد سجلات</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString("ar-LY")}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <UserIcon size={12} className="text-gray-400" />
                    <span className="text-xs">{e.userName ?? "نظام"}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[e.action] ?? "bg-gray-100 text-gray-700"}`}>
                    {ACTION_LABELS[e.action] ?? e.action}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-gray-400" />
                    <span className="text-xs">{ENTITY_LABELS[e.entityType] ?? e.entityType}{e.entityId ? ` #${e.entityId}` : ""}</span>
                  </div>
                </td>
                <td className="p-3 text-xs">{e.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-center">إجمالي: {filtered.length} سجل</p>
    </div>
  );
}
