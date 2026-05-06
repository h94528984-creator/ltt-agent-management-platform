import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { AgentRequest } from "@/lib/api";
import { Plus, X, MapPin, Building2, Store, Truck, Navigation, Search, Pencil } from "lucide-react";

const ENTITY_TYPES = [
  { value: "service_center", label: "مركز خدمة",        icon: Building2, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "fixed_pos",      label: "نقطة بيع ثابتة",   icon: Store,    color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "mobile_van",     label: "سيارة بيع متنقلة", icon: Truck,    color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const SERVICE_OPTIONS = ["ADSL", "4G", "FTTH", "Mobile Recharge", "بطاقات شحن", "تفعيل خطوط"];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-700",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "قيد المراجعة", approved: "نشط", rejected: "مرفوض", cancelled: "ملغاة",
};

function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function EntityModal({ defaultType, editing, onClose, onSaved }: { defaultType: string; editing: AgentRequest | null; onClose: () => void; onSaved: (r: AgentRequest, isNew: boolean) => void }) {
  const isEdit = editing != null;
  const [entityType, setEntityType] = useState(editing?.entityType ?? defaultType);
  const [entityName, setEntityName] = useState(editing?.agentName ?? "");
  const [responsibleEmployee, setResponsibleEmployee] = useState(editing?.representativeName ?? "");
  const [employeePhone, setEmployeePhone] = useState(editing?.mobile ?? "");
  const [city, setCity] = useState(editing?.city ?? "");
  const [address, setAddress] = useState(editing?.fullAddress ?? "");
  const [latitude, setLatitude] = useState(editing?.latitude != null ? String(editing.latitude) : "");
  const [longitude, setLongitude] = useState(editing?.longitude != null ? String(editing.longitude) : "");
  const [services, setServices] = useState<string[]>(Array.isArray(editing?.services) ? (editing!.services as string[]) : []);
  const [staffCount, setStaffCount] = useState(editing?.staffCount != null ? String(editing.staffCount) : "1");
  const [internetQuality, setInternetQuality] = useState(editing?.internetQuality ?? "good");
  const [hasSignboard, setHasSignboard] = useState(editing?.hasSignboard ?? true);
  const [hasDevices, setHasDevices] = useState(editing?.hasDevices ?? true);
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function captureGps() {
    if (!navigator.geolocation) { setError("المتصفح لا يدعم تحديد الموقع"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude.toFixed(6)); setLongitude(pos.coords.longitude.toFixed(6)); setGpsLoading(false); },
      () => { setError("تعذّر الحصول على الموقع"); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function toggleService(s: string) {
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!entityName.trim() || !responsibleEmployee.trim() || !employeePhone.trim() || !city.trim()) {
      setError("الرجاء ملء الحقول الإلزامية"); return;
    }
    setSaving(true); setError(null);
    try {
      const payload = {
        entityType, entityName: entityName.trim(),
        responsibleEmployee: responsibleEmployee.trim(),
        employeePhone: employeePhone.trim(),
        city: city.trim(),
        address: address.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        hasSignboard, hasDevices, internetQuality,
        staffCount: parseInt(staffCount || "1") || 1,
        services, notes: notes.trim() || null,
      };
      const saved = isEdit
        ? await api.patch<AgentRequest>(`/agent-request/${editing!.id}`, payload)
        : await api.post<AgentRequest>("/agent-requests", payload);
      onSaved(saved, !isEdit); onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl my-4" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-bold">{isEdit ? "تعديل كيان" : "إنشاء كيان جديد للشركة"}</h2>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">نوع الكيان *</label>
            <div className="grid grid-cols-3 gap-2">
              {ENTITY_TYPES.map((o) => (
                <button key={o.value} type="button" onClick={() => setEntityType(o.value)}
                  className={`border-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors flex flex-col items-center gap-1 ${entityType === o.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
                  <o.icon size={20} />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">اسم الكيان *</label>
              <input value={entityName} onChange={(e) => setEntityName(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="مثلا: مركز خدمة جنزور" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الموظف المسؤول *</label>
              <input value={responsibleEmployee} onChange={(e) => setResponsibleEmployee(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">هاتف المسؤول *</label>
              <input value={employeePhone} onChange={(e) => setEmployeePhone(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="091XXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المدينة *</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">عدد الموظفين</label>
              <input value={staffCount} onChange={(e) => setStaffCount(e.target.value)} type="number" min="1" className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">العنوان</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="border border-border rounded-lg p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">الموقع الجغرافي</label>
              <button type="button" onClick={captureGps} disabled={gpsLoading} className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50">
                <Navigation size={12} />
                {gpsLoading ? "جاري التحديد..." : "استخدم موقعي الحالي"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={latitude} onChange={(e) => setLatitude(e.target.value)} type="number" step="any" placeholder="خط العرض" className="border border-border rounded-lg px-3 py-2 text-sm" />
              <input value={longitude} onChange={(e) => setLongitude(e.target.value)} type="number" step="any" placeholder="خط الطول" className="border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الخدمات</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => toggleService(s)}
                  className={`px-3 py-1.5 border-2 rounded-full text-xs font-medium ${services.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">جودة الإنترنت</label>
              <select value={internetQuality} onChange={(e) => setInternetQuality(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="good">جيد</option><option value="medium">متوسط</option><option value="weak">ضعيف</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer pt-6">
              <input type="checkbox" checked={hasSignboard} onChange={(e) => setHasSignboard(e.target.checked)} />
              لافتة موجودة
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer pt-6">
              <input type="checkbox" checked={hasDevices} onChange={(e) => setHasDevices(e.target.checked)} />
              أجهزة موجودة
            </label>
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
            {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إنشاء الكيان"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Entities() {
  const [entities, setEntities] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AgentRequest | null>(null);
  const [createDefaultType, setCreateDefaultType] = useState("service_center");

  function openCreate(t: string) { setEditing(null); setCreateDefaultType(t); setShowModal(true); }
  function openEdit(e: AgentRequest) { setEditing(e); setShowModal(true); }

  const load = useCallback(() => {
    setLoading(true);
    api.get<AgentRequest[]>("/agent-requests")
      .then((all) => {
        setEntities(all.filter((r) => r.entityType && r.entityType !== "agent" && r.entityType !== "inspection"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function cancelEntity(id: number) {
    if (!confirm("هل أنت متأكد من إلغاء هذا الكيان؟")) return;
    try {
      await api.patch(`/agent-request/${id}/status`, { status: "cancelled" });
      setEntities((prev) => prev.map((e) => e.id === id ? { ...e, status: "cancelled" } : e));
    } catch (err) {
      alert(err instanceof Error ? err.message : "تعذّر الإلغاء");
    }
  }

  async function approveEntity(id: number) {
    try {
      await api.patch(`/agent-request/${id}/status`, { status: "approved" });
      setEntities((prev) => prev.map((e) => e.id === id ? { ...e, status: "approved" } : e));
    } catch (err) {
      alert(err instanceof Error ? err.message : "تعذّر الاعتماد");
    }
  }

  const filtered = entities.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (e.agentName ?? "").toLowerCase().includes(q) ||
      (e.city ?? "").toLowerCase().includes(q) ||
      (e.representativeName ?? "").toLowerCase().includes(q);
    const matchType = !typeFilter || e.entityType === typeFilter;
    return matchSearch && matchType;
  });

  const counts = ENTITY_TYPES.map((t) => ({
    ...t,
    count: entities.filter((e) => e.entityType === t.value && e.status !== "cancelled").length,
  }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">كيانات الشركة</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة مراكز الخدمة، نقاط البيع الثابتة، وسيارات البيع المتنقلة</p>
        </div>
        <button onClick={() => openCreate("service_center")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
          <Plus size={15} />
          إنشاء كيان جديد
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {counts.map((c) => (
          <button key={c.value} onClick={() => openCreate(c.value)}
            className={`border-2 rounded-xl p-4 text-right transition-all hover:shadow-md ${c.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-80">{c.label}</p>
                <p className="text-2xl font-bold mt-0.5">{c.count}</p>
              </div>
              <c.icon size={28} />
            </div>
            <p className="text-xs opacity-70 mt-2">+ إضافة جديد</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو المدينة..." className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-border rounded-lg px-4 py-2.5 text-sm bg-white">
          <option value="">جميع الأنواع</option>
          {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <p className="col-span-2 text-center py-12 text-muted-foreground">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <Building2 size={32} className="mx-auto mb-2 opacity-40" />
            <p>لا توجد كيانات. اضغط "إنشاء كيان جديد" للبدء.</p>
          </div>
        ) : filtered.map((e) => {
          const typeMeta = ENTITY_TYPES.find((t) => t.value === e.entityType);
          const Icon = typeMeta?.icon ?? Building2;
          const hasCoords = e.latitude != null && e.longitude != null;
          return (
            <div key={e.id} className="bg-white border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${typeMeta?.color ?? "bg-muted"}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{e.agentName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{typeMeta?.label}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[e.status] ?? "bg-gray-100"}`}>
                  {STATUS_LABEL[e.status] ?? e.status}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">المسؤول:</span> {e.representativeName} <span className="text-muted-foreground">— {e.mobile}</span></p>
                <p><span className="text-muted-foreground">المدينة:</span> {e.city}</p>
                {e.fullAddress && <p className="text-xs text-muted-foreground">{e.fullAddress}</p>}
                {Array.isArray(e.services) && e.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.services.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-muted text-xs rounded-full">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                {hasCoords && (
                  <a href={mapsUrl(e.latitude as number, e.longitude as number)} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                    <MapPin size={12} />
                    افتح في الخرائط
                  </a>
                )}
                <button onClick={() => openEdit(e)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-medium">
                  <Pencil size={11} />
                  تعديل
                </button>
                {e.status === "pending" && (
                  <button onClick={() => approveEntity(e.id)} className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-xs font-medium">
                    اعتماد
                  </button>
                )}
                {e.status !== "cancelled" && (
                  <button onClick={() => cancelEntity(e.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-medium">
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <EntityModal
          defaultType={createDefaultType}
          editing={editing}
          onClose={() => setShowModal(false)}
          onSaved={(r, isNew) => {
            setEntities((prev) => isNew ? [r, ...prev] : prev.map((x) => x.id === r.id ? r : x));
          }}
        />
      )}
    </div>
  );
}
