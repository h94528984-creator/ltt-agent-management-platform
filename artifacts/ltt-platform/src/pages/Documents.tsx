import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import {
  DOC_TYPE_LABELS, DOC_TYPE_OPTIONS, STATUS_LABELS, STATUS_COLORS,
  CHANNEL_LABELS, daysUntilExpiry, formatDate,
} from "@/lib/documentStatus";
import { FileText, Search, Plus, Download, Pencil, Trash2, Upload, AlertTriangle, ChevronDown, X, History as HistoryIcon } from "lucide-react";

interface Document {
  id: number;
  agentId: number;
  agentName: string | null;
  agentCity: string | null;
  agentChannelType: string | null;
  docType: string;
  docNumber: string | null;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AgentLite { id: number; name: string; city: string | null; channelType?: string | null }

interface HistoryEntry {
  id: number;
  action: string;
  changedByName: string | null;
  notes: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  created: "إنشاء", renewed: "تجديد", updated: "تعديل",
  suspended: "إيقاف", restored: "إعادة تفعيل", file_replaced: "استبدال الملف",
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [agents, setAgents] = useState<AgentLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editing, setEditing] = useState<Document | "new" | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get<Document[]>("/documents"),
      api.get<AgentLite[]>("/agents"),
      api.post("/documents/refresh-status", {}).catch(() => null),
    ]).then(([docs, ags]) => {
      setDocuments(docs ?? []);
      setAgents(ags ?? []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => documents.filter((d) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q
      || (d.agentName ?? "").toLowerCase().includes(q)
      || (d.agentCity ?? "").toLowerCase().includes(q)
      || (d.docNumber ?? "").toLowerCase().includes(q)
      || (d.issuer ?? "").toLowerCase().includes(q);
    const matchStatus = !statusFilter || d.status === statusFilter;
    const matchType = !typeFilter || d.docType === typeFilter;
    return matchSearch && matchStatus && matchType;
  }), [documents, search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: documents.length,
    valid: documents.filter(d => d.status === "valid").length,
    expiringSoon: documents.filter(d => d.status === "expiring_soon").length,
    expired: documents.filter(d => d.status === "expired").length,
    suspended: documents.filter(d => d.status === "suspended").length,
  }), [documents]);

  const exportToCsv = useCallback(() => {
    exportCsv(
      filtered.map(d => ({
        agent: d.agentName ?? "",
        city: d.agentCity ?? "",
        channel: d.agentChannelType ? (CHANNEL_LABELS[d.agentChannelType] ?? d.agentChannelType) : "",
        docType: DOC_TYPE_LABELS[d.docType] ?? d.docType,
        docNumber: d.docNumber ?? "",
        issuer: d.issuer ?? "",
        issueDate: formatDate(d.issueDate),
        expiryDate: formatDate(d.expiryDate),
        daysLeft: d.expiryDate ? (daysUntilExpiry(d.expiryDate) ?? "") : "",
        status: STATUS_LABELS[d.status] ?? d.status,
      })),
      [
        { key: "agent", label: "الجهة" },
        { key: "city", label: "المدينة" },
        { key: "channel", label: "نوع القناة" },
        { key: "docType", label: "نوع المستند" },
        { key: "docNumber", label: "رقم المستند" },
        { key: "issuer", label: "جهة الإصدار" },
        { key: "issueDate", label: "تاريخ الإصدار" },
        { key: "expiryDate", label: "تاريخ الانتهاء" },
        { key: "daysLeft", label: "أيام متبقية" },
        { key: "status", label: "الحالة" },
      ],
      `documents-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }, [filtered]);

  async function handleDelete(d: Document) {
    if (!confirm(`حذف المستند "${DOC_TYPE_LABELS[d.docType]}" للجهة "${d.agentName}"؟`)) return;
    await api.delete(`/documents/${d.id}`);
    load();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة التراخيص والمستندات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            متابعة الصلاحيات والوثائق القانونية لجميع الوكلاء ونقاط البيع
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCsv} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">
            <Download size={15} /> تصدير CSV
          </button>
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
            <Plus size={15} /> مستند جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatTile label="إجمالي المستندات" value={stats.total} icon={FileText} color="bg-slate-100 text-slate-700" />
        <StatTile label="ساري" value={stats.valid} icon={FileText} color="bg-emerald-50 text-emerald-700" />
        <StatTile label="قارب على الانتهاء" value={stats.expiringSoon} icon={AlertTriangle} color="bg-amber-50 text-amber-700" />
        <StatTile label="منتهي" value={stats.expired} icon={AlertTriangle} color="bg-red-50 text-red-700" />
        <StatTile label="موقوف" value={stats.suspended} icon={FileText} color="bg-slate-100 text-slate-700" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم الجهة، المدينة، رقم المستند..." className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <FilterSelect value={typeFilter} onChange={setTypeFilter} options={[{ v: "", l: "جميع الأنواع" }, ...DOC_TYPE_OPTIONS]} />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[
          { v: "", l: "جميع الحالات" },
          { v: "valid", l: "ساري" },
          { v: "expiring_soon", l: "قارب على الانتهاء" },
          { v: "expired", l: "منتهي" },
          { v: "suspended", l: "موقوف" },
        ]} />
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr className="text-right text-muted-foreground">
                <th className="px-4 py-3 font-medium">الجهة</th>
                <th className="px-4 py-3 font-medium">نوع المستند</th>
                <th className="px-4 py-3 font-medium">رقم</th>
                <th className="px-4 py-3 font-medium">جهة الإصدار</th>
                <th className="px-4 py-3 font-medium">تاريخ الانتهاء</th>
                <th className="px-4 py-3 font-medium">أيام متبقية</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">الملف</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">لا توجد مستندات</td></tr>
              ) : filtered.map(d => {
                const days = daysUntilExpiry(d.expiryDate);
                const c = STATUS_COLORS[d.status] ?? STATUS_COLORS.valid!;
                return (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{d.agentName ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{d.agentCity ?? ""}{d.agentChannelType ? ` • ${CHANNEL_LABELS[d.agentChannelType] ?? d.agentChannelType}` : ""}</div>
                    </td>
                    <td className="px-4 py-3">{DOC_TYPE_LABELS[d.docType] ?? d.docType}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.docNumber ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.issuer ?? "—"}</td>
                    <td className="px-4 py-3">{formatDate(d.expiryDate)}</td>
                    <td className="px-4 py-3">
                      {days === null ? <span className="text-muted-foreground">—</span> :
                        days < 0 ? <span className="text-red-600 font-medium">منتهٍ منذ {Math.abs(days)} يوم</span> :
                        days <= 30 ? <span className="text-amber-600 font-medium">{days} يوم</span> :
                        <span className="text-muted-foreground">{days} يوم</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${c.bg} ${c.text} ${c.ring}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {STATUS_LABELS[d.status] ?? d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.fileUrl ? (
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">عرض</a>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEditing(d)} className="p-1.5 hover:bg-muted rounded" title="تعديل"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(d)} className="p-1.5 hover:bg-red-50 rounded" title="حذف"><Trash2 size={13} className="text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <DocumentEditor
          doc={editing === "new" ? null : editing}
          agents={agents}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function StatTile({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ size?: number }>; color: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}><Icon size={16} /></div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none border border-border rounded-lg pr-4 pl-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white min-w-[170px]">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function DocumentEditor({ doc, agents, onClose, onSaved }: {
  doc: Document | null; agents: AgentLite[]; onClose: () => void; onSaved: () => void;
}) {
  const isNew = !doc;
  const [agentId, setAgentId] = useState<number | "">(doc?.agentId ?? "");
  const [docType, setDocType] = useState(doc?.docType ?? "license");
  const [docNumber, setDocNumber] = useState(doc?.docNumber ?? "");
  const [issuer, setIssuer] = useState(doc?.issuer ?? "");
  const [issueDate, setIssueDate] = useState(doc?.issueDate ? doc.issueDate.slice(0, 10) : "");
  const [expiryDate, setExpiryDate] = useState(doc?.expiryDate ? doc.expiryDate.slice(0, 10) : "");
  const [status, setStatus] = useState(doc?.status ?? "valid");
  const [notes, setNotes] = useState(doc?.notes ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [agentSearch, setAgentSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (doc) {
      api.get<{ history: HistoryEntry[] }>(`/documents/${doc.id}`).then((r) => setHistory(r.history ?? [])).catch(() => {});
    }
  }, [doc]);

  const filteredAgents = useMemo(() => {
    const q = agentSearch.toLowerCase().trim();
    if (!q) return agents.slice(0, 100);
    return agents.filter(a =>
      a.name.toLowerCase().includes(q) || (a.city ?? "").toLowerCase().includes(q),
    ).slice(0, 100);
  }, [agents, agentSearch]);

  async function handleSave() {
    if (!agentId) { setErr("اختر الجهة"); return; }
    setSaving(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("agentId", String(agentId));
      fd.append("docType", docType);
      fd.append("status", status);
      if (docNumber) fd.append("docNumber", docNumber);
      if (issuer) fd.append("issuer", issuer);
      if (issueDate) fd.append("issueDate", issueDate);
      if (expiryDate) fd.append("expiryDate", expiryDate);
      if (notes) fd.append("notes", notes);
      if (file) fd.append("file", file);
      const token = localStorage.getItem("ltt_token");
      const url = isNew ? "/api/documents" : `/api/documents/${doc!.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? "فشل الحفظ");
      }
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold">{isNew ? "إضافة مستند جديد" : "تعديل مستند"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {!isNew && doc && (
            <div className="text-sm bg-muted/40 rounded-lg p-3">
              <span className="text-muted-foreground">الجهة:</span>{" "}
              <span className="font-medium">{doc.agentName}</span>
              {doc.agentCity && <span className="text-muted-foreground"> • {doc.agentCity}</span>}
            </div>
          )}

          {isNew && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">الجهة (وكيل / نقطة بيع)</label>
              <input
                value={agentSearch}
                onChange={e => setAgentSearch(e.target.value)}
                placeholder="ابحث بالاسم أو المدينة..."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <select value={agentId} onChange={e => setAgentId(parseInt(e.target.value))} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— اختر الجهة —</option>
                {filteredAgents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} {a.city ? `— ${a.city}` : ""}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="نوع المستند">
              <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {DOC_TYPE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </Field>
            <Field label="الحالة">
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="valid">ساري</option>
                <option value="suspended">موقوف</option>
              </select>
            </Field>
            <Field label="رقم المستند"><input value={docNumber} onChange={e => setDocNumber(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></Field>
            <Field label="جهة الإصدار"><input value={issuer} onChange={e => setIssuer(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></Field>
            <Field label="تاريخ الإصدار"><input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></Field>
            <Field label="تاريخ الانتهاء"><input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></Field>
          </div>

          <Field label="ملاحظات">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>

          <Field label={file ? `الملف: ${file.name}` : (doc?.fileName ? `الملف الحالي: ${doc.fileName}` : "رفع نسخة من المستند (PDF / صورة)")}>
            <label className="border-2 border-dashed border-border rounded-lg p-4 text-center text-sm text-muted-foreground hover:border-primary hover:bg-primary/5 cursor-pointer block">
              <Upload size={18} className="inline-block ml-2" />
              {file ? "تغيير الملف" : "اسحب الملف هنا أو انقر للاختيار"}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
            {doc?.fileUrl && !file && (
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline mt-1 inline-block">عرض الملف الحالي</a>
            )}
          </Field>

          {history.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><HistoryIcon size={14} /> سجل التعديلات</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {history.map(h => (
                  <div key={h.id} className="text-xs flex items-center gap-2 text-muted-foreground">
                    <span className="px-1.5 py-0.5 bg-muted rounded text-foreground">{ACTION_LABELS[h.action] ?? h.action}</span>
                    <span>{formatDate(h.createdAt)}</span>
                    {h.changedByName && <span>— {h.changedByName}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{err}</div>}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">إلغاء</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
