import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { AgentRequest } from "@/lib/api";
import { Search, Eye, CheckCircle, XCircle, Clock, ChevronDown, Download, Plus, X } from "lucide-react";
import { exportCsv } from "@/lib/exportCsv";

const STATUS_OPTIONS = [
  { value: "", label: "جميع الحالات" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" },
  { value: "cancelled", label: "ملغاة" },
];

const ENTITY_OPTIONS = [
  { value: "", label: "كل الأنواع" },
  { value: "agent", label: "وكيل" },
  { value: "service_center", label: "مركز خدمة" },
  { value: "fixed_pos", label: "نقطة بيع ثابتة" },
  { value: "mobile_van", label: "سيارة بيع متنقلة" },
  { value: "inspection", label: "تفتيش" },
];

const ENTITY_BADGE: Record<string, { label: string; cls: string }> = {
  agent:           { label: "وكيل",          cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  service_center:  { label: "مركز خدمة",     cls: "bg-blue-50 text-blue-700 border-blue-200" },
  fixed_pos:       { label: "نقطة بيع ثابتة", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  mobile_van:      { label: "سيارة بيع",     cls: "bg-purple-50 text-purple-700 border-purple-200" },
  inspection:      { label: "تفتيش",         cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

function EntityBadge({ type }: { type: string | null | undefined }) {
  const e = ENTITY_BADGE[type ?? "agent"] ?? ENTITY_BADGE["agent"]!;
  return <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${e.cls}`}>{e.label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ComponentType<{ size?: number }> }> = {
    pending: { label: "قيد المراجعة", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
    approved: { label: "مقبول", cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    rejected: { label: "مرفوض", cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    cancelled: { label: "ملغاة", cls: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
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
        <div className="p-3 sm:p-6 space-y-5">
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
            <button
              disabled={updatingStatus || record.status === "cancelled"}
              onClick={() => {
                if (confirm("هل أنت متأكد من إلغاء هذه العملية؟")) updateStatus("cancelled");
              }}
              className="px-4 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors mr-auto"
            >
              إلغاء العملية
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

const ENTITY_CREATE_OPTIONS = [
  { value: "agent",          label: "وكيل جديد",            icon: "🧑‍💼" },
  { value: "service_center", label: "مركز خدمة",            icon: "🏢" },
  { value: "fixed_pos",      label: "نقطة بيع ثابتة",       icon: "🏪" },
  { value: "mobile_van",     label: "سيارة بيع متنقلة",     icon: "🚐" },
];

const SERVICE_OPTIONS = ["ADSL", "4G", "FTTH", "Mobile Recharge", "بطاقات شحن", "تفعيل خطوط"];

function CreateOperationModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: AgentRequest) => void }) {
  const [entityType, setEntityType] = useState("agent");
  const [entityName, setEntityName] = useState("");
  const [responsibleEmployee, setResponsibleEmployee] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [hasSignboard, setHasSignboard] = useState(true);
  const [hasDevices, setHasDevices] = useState(true);
  const [internetQuality, setInternetQuality] = useState("good");
  const [staffCount, setStaffCount] = useState("1");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleService(s: string) {
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!entityName.trim() || !responsibleEmployee.trim() || !employeePhone.trim() || !city.trim()) {
      setError("الرجاء ملء الحقول الإلزامية: الاسم، المسؤول، الهاتف، المدينة");
      return;
    }
    setSaving(true); setError(null);
    try {
      const created = await api.post<AgentRequest>("/agent-requests", {
        entityType,
        entityName: entityName.trim(),
        responsibleEmployee: responsibleEmployee.trim(),
        employeePhone: employeePhone.trim(),
        city: city.trim(),
        address: address.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        hasSignboard, hasDevices, internetQuality,
        staffCount: parseInt(staffCount || "1") || 1,
        services, notes: notes.trim() || null,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ عند الحفظ");
    } finally { setSaving(false); }
  }

  const selectedOpt = ENTITY_CREATE_OPTIONS.find((o) => o.value === entityType);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl my-4" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-bold text-foreground">إنشاء عملية جديدة</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="p-3 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">نوع العملية *</label>
            <div className="grid grid-cols-4 gap-2">
              {ENTITY_CREATE_OPTIONS.map((o) => (
                <button key={o.value} type="button" onClick={() => setEntityType(o.value)}
                  className={`border-2 rounded-lg px-3 py-3 text-xs font-medium transition-colors ${entityType === o.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
                  <div className="text-xl mb-1">{o.icon}</div>{o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">اسم {selectedOpt?.label} *</label>
              <input value={entityName} onChange={(e) => setEntityName(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="الاسم..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الموظف المسؤول *</label>
              <input value={responsibleEmployee} onChange={(e) => setResponsibleEmployee(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="اسم الموظف" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">هاتف المسؤول *</label>
              <input value={employeePhone} onChange={(e) => setEmployeePhone(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="091XXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة *</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="طرابلس" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">العنوان</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="العنوان الكامل" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">خط العرض (latitude)</label>
              <input value={latitude} onChange={(e) => setLatitude(e.target.value)} type="number" step="any" className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="32.8872" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">خط الطول (longitude)</label>
              <input value={longitude} onChange={(e) => setLongitude(e.target.value)} type="number" step="any" className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="13.1913" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">عدد الموظفين</label>
              <input value={staffCount} onChange={(e) => setStaffCount(e.target.value)} type="number" min="1" className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">جودة الإنترنت</label>
              <select value={internetQuality} onChange={(e) => setInternetQuality(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="good">جيد</option><option value="medium">متوسط</option><option value="weak">ضعيف</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={hasSignboard} onChange={(e) => setHasSignboard(e.target.checked)} className="rounded" />
              لافتة تجارية موجودة
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={hasDevices} onChange={(e) => setHasDevices(e.target.checked)} className="rounded" />
              أجهزة مكتبية موجودة
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الخدمات المتوفرة</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => toggleService(s)}
                  className={`px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-colors ${services.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="border-t border-border px-6 py-3 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">إلغاء</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "إنشاء العملية"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Inspections() {
  const [records, setRecords] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [selected, setSelected] = useState<AgentRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);
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
    const matchEntity = !entityFilter || (r.entityType ?? "agent") === entityFilter;
    return matchSearch && matchStatus && matchEntity;
  });

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const summary = { total: records.length, pending: records.filter((r) => r.status === "pending").length, approved: records.filter((r) => r.status === "approved").length, rejected: records.filter((r) => r.status === "rejected").length };

  function exportToCsv() {
    exportCsv(
      filtered.map((r) => ({
        requestId: r.requestId,
        agentName: r.agentName,
        city: r.city,
        mobile: r.mobile,
        representative: r.representativeName,
        readiness: r.readinessScore ?? "",
        sales: r.salesScore ?? "",
        compliance: r.complianceScore ?? "",
        finalScore: r.finalScore ?? "",
        status: r.status === "approved" ? "مقبول" : r.status === "rejected" ? "مرفوض" : "قيد المراجعة",
        date: new Date(r.createdAt).toLocaleDateString("ar-LY"),
        notes: r.notes ?? "",
      })),
      [
        { key: "requestId", label: "رقم الطلب" },
        { key: "agentName", label: "اسم الوكيل" },
        { key: "city", label: "المدينة" },
        { key: "mobile", label: "الجوال" },
        { key: "representative", label: "المفتش" },
        { key: "readiness", label: "الجاهزية" },
        { key: "sales", label: "المبيعات" },
        { key: "compliance", label: "الامتثال" },
        { key: "finalScore", label: "النتيجة النهائية" },
        { key: "status", label: "الحالة" },
        { key: "date", label: "التاريخ" },
        { key: "notes", label: "ملاحظات" },
      ],
      `inspections-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تقارير التفتيش الميداني</h1>
          <p className="text-muted-foreground text-sm mt-1">استعراض وإدارة جميع تقارير الجولات التفتيشية</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
            إنشاء عملية جديدة
          </button>
          <button
            onClick={exportToCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <Download size={15} />
            تصدير CSV
          </button>
        </div>
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
        <div className="relative">
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
            className="appearance-none border border-border rounded-lg pr-4 pl-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            {ENTITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">النوع</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الاسم</th>
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
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  جاري التحميل...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">لا توجد نتائج</td>
              </tr>
            ) : paged.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.requestId.slice(0, 8)}…</td>
                <td className="px-4 py-3"><EntityBadge type={r.entityType} /></td>
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

      {showCreate && (
        <CreateOperationModal
          onClose={() => setShowCreate(false)}
          onCreated={(r) => setRecords((prev) => [r, ...prev])}
        />
      )}
    </div>
  );
}
