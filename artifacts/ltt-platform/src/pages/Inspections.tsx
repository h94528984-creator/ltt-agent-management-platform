import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { AgentRequest } from "@/lib/api";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "جميع الحالات" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ComponentType<{ size?: number }> }> = {
    pending: { label: "قيد المراجعة", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
    approved: { label: "مقبول", cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    rejected: { label: "مرفوض", cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-muted-foreground text-xs">—</span>;
  const cls = score >= 85 ? "text-amber-600 font-bold" : score >= 70 ? "text-blue-600 font-bold" : score >= 50 ? "text-orange-600 font-semibold" : "text-red-600 font-semibold";
  return <span className={`text-sm ${cls}`}>{score}<span className="text-xs font-normal text-muted-foreground">/100</span></span>;
}

function DetailModal({ record, onClose, onStatusChange }: { record: AgentRequest; onClose: () => void; onStatusChange: (id: number, status: string) => void }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    try {
      await api.patch(`/agent-request/${record.id}/status`, { status }); 
      onStatusChange(record.id, status);
    } catch { } finally {
      setUpdatingStatus(false);
    }
  }

  const photos = [
    ...(record.sitePhotoUrls ?? []).map(u => ({ url: u, label: "صورة الموقع" })),
    ...(record.interiorPhotoUrls ?? []).map(u => ({ url: u, label: "صورة داخلية" })),
    ...(record.equipmentPhotoUrls ?? []).map(u => ({ url: u, label: "صورة معدات" })),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-bold text-foreground">{record.agentName}</h2>
            <p className="text-xs text-muted-foreground">#{record.requestId}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl font-light leading-none">✕</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="المفتش" value={record.representativeName} />
            <Field label="المدينة" value={record.city} />
            <Field label="الهاتف" value={record.mobile} />
            <Field label="نوع النشاط" value={record.activityType} />
            <Field label="العنوان" value={record.fullAddress} colSpan />
            <Field label="ملاحظات" value={record.notes} colSpan />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "الجاهزية", value: record.readinessScore },
              { label: "المبيعات", value: record.salesScore },
              { label: "الامتثال", value: record.complianceScore },
              { label: "الإجمالي", value: record.finalScore },
            ].map((s) => (
              <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-primary">{s.value ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <BoolField label="لافتة تجارية" value={record.hasSignboard} />
            <BoolField label="أجهزة متوفرة" value={record.hasDevices} />
            <BoolField label="وثائق مكتملة" value={record.documentsComplete} />
            <BoolField label="هوية بصرية" value={record.brandIdentityCompliant} />
          </div>

          {photos.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">الصور ({photos.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <a key={i} href={`/api${p.url}`} target="_blank" rel="noreferrer">
                    <img src={`/api${p.url}`} alt={p.label} className="w-full h-24 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">تغيير الحالة:</p>
            <button
              disabled={updatingStatus || record.status === "approved"}
              onClick={() => updateStatus("approved")}
              className="px-4 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              قبول
            </button>
            <button
              disabled={updatingStatus || record.status === "rejected"}
              onClick={() => updateStatus("rejected")}
              className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              رفض
            </button>
            <button
              disabled={updatingStatus || record.status === "pending"}
              onClick={() => updateStatus("pending")}
              className="px-4 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
            >
              إعادة للمراجعة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, colSpan }: { label: string; value: string | null | undefined; colSpan?: boolean }) {
  if (!value) return null;
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

function BoolField({ label, value }: { label: string; value: boolean | null | undefined }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {value ? "✓" : "✗"}
      </span>
      <span className="text-foreground">{label}</span>
    </div>
  );
}

export default function Inspections() {
  const [records, setRecords] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<AgentRequest | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;

  const load = useCallback(() => {
    setLoading(true);
    api.get<AgentRequest[]>(`/agent-requests?limit=200`)
      .then((r) => setRecords(r ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleStatusChange(id: number, status: string) {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  }

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.agentName.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.representativeName.toLowerCase().includes(q) || r.requestId.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const summary = { total: records.length, pending: records.filter((r) => r.status === "pending").length, approved: records.filter((r) => r.status === "approved").length, rejected: records.filter((r) => r.status === "rejected").length };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">تقارير التفتيش الميداني</h1>
        <p className="text-muted-foreground text-sm mt-1">استعراض وإدارة جميع تقارير الجولات التفتيشية</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "إجمالي التقارير", value: summary.total, cls: "border-primary/20 bg-primary/5" },
          { label: "قيد المراجعة", value: summary.pending, cls: "border-yellow-200 bg-yellow-50" },
          { label: "مقبول", value: summary.approved, cls: "border-green-200 bg-green-50" },
          { label: "مرفوض", value: summary.rejected, cls: "border-red-200 bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.cls}`}>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="ابحث باسم الوكيل أو المدينة أو المفتش..."
            className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="appearance-none border border-border rounded-lg pr-4 pl-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الوكيل</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المدينة</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المفتش</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التقييم</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التاريخ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  جاري التحميل...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">لا توجد نتائج</td>
              </tr>
            ) : paged.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.requestId.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.agentName}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.city}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.representativeName}</td>
                <td className="px-4 py-3"><ScoreBadge score={r.finalScore} /></td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleDateString("ar-LY")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(r)} className="text-primary hover:text-primary/70 transition-colors">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">عرض {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} من {filtered.length}</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 hover:bg-muted transition-colors">السابق</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 hover:bg-muted transition-colors">التالي</button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <DetailModal record={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
