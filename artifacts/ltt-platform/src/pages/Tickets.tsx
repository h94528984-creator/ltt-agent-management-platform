import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Search, ChevronDown, AlertCircle, Clock, CheckCircle2, Plus, X, MapPin, Navigation } from "lucide-react";

interface Ticket {
  id: number;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  agentId: number | null;
  assignedToId: number | null;
  createdById: number | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "منخفضة", medium: "متوسطة", high: "عالية", urgent: "عاجل",
};
const STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة", in_progress: "قيد التنفيذ", resolved: "محلولة", closed: "مغلقة",
};
const CATEGORY_LABELS: Record<string, string> = {
  technical: "تقني", compliance: "امتثال", billing: "فواتير", stock: "مخزون", other: "أخرى",
};

function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function CreateTicketModal({ users, onClose, onCreated }: { users: User[]; onClose: () => void; onCreated: (t: Ticket) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("medium");
  const [agentId, setAgentId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function captureGps() {
    if (!navigator.geolocation) { setError("المتصفح لا يدعم تحديد الموقع"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude.toFixed(6)); setLongitude(pos.coords.longitude.toFixed(6)); setGpsLoading(false); },
      () => { setError("تعذّر الحصول على الموقع — اسمح بصلاحية تحديد الموقع"); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { setError("العنوان والوصف مطلوبان"); return; }
    setSaving(true); setError(null);
    try {
      const userRaw = localStorage.getItem("ltt_user");
      const createdById = userRaw ? (JSON.parse(userRaw).id as number) : 1;
      const body: Record<string, unknown> = {
        title: title.trim(), description: description.trim(),
        category, priority, createdById,
      };
      if (agentId.trim()) body.agentId = parseInt(agentId.trim());
      if (assignedToId) body.assignedToId = parseInt(assignedToId);
      if (locationName.trim()) body.locationName = locationName.trim();
      if (latitude.trim()) body.latitude = parseFloat(latitude);
      if (longitude.trim()) body.longitude = parseFloat(longitude);
      const created = await api.post<Ticket>("/tickets", body);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form className="bg-white rounded-2xl max-w-xl w-full shadow-2xl my-4" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-bold text-foreground">إنشاء تذكرة عمل جديدة</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">العنوان *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="مثال: مشكلة في جهاز POS" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الوصف *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">الفئة</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الأولوية</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
                {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">إسناد إلى موظف</label>
            <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">— غير مسند —</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">معرّف الوكيل (اختياري)</label>
            <input value={agentId} onChange={(e) => setAgentId(e.target.value)} type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" placeholder="رقم الوكيل" />
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">الموقع الجغرافي (اختياري)</label>
              <button type="button" onClick={captureGps} disabled={gpsLoading} className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50">
                <Navigation size={12} />
                {gpsLoading ? "جاري التحديد..." : "استخدم موقعي الحالي"}
              </button>
            </div>
            <input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="اسم الموقع — مثل: مركز جنزور" className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <input value={latitude} onChange={(e) => setLatitude(e.target.value)} type="number" step="any" placeholder="خط العرض" className="border border-border rounded-lg px-3 py-2 text-sm" />
              <input value={longitude} onChange={(e) => setLongitude(e.target.value)} type="number" step="any" placeholder="خط الطول" className="border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <div className="border-t border-border px-6 py-3 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">إلغاء</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">{saving ? "جاري الحفظ..." : "إنشاء التذكرة"}</button>
        </div>
      </form>
    </div>
  );
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Ticket[]>("/tickets").catch(() => [] as Ticket[]),
      api.get<User[]>("/users").catch(() => [] as User[]),
    ]).then(([t, u]) => { setTickets(t); setUsers(u); }).finally(() => setLoading(false));
  }, []);

  const userMap = new Map(users.map((u) => [u.id, u]));

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
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث في التذاكر..." className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none border border-border rounded-lg pr-4 pl-8 py-2.5 text-sm bg-white">
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
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المسند إليه</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الموقع</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الأولوية</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">لا توجد تذاكر</td></tr>
            ) : filtered.map((t) => {
              const assignee = t.assignedToId ? userMap.get(t.assignedToId) : null;
              const hasCoords = t.latitude != null && t.longitude != null;
              return (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[t.category] ?? t.category}</span>
                      {t.description && <span className="text-xs text-muted-foreground truncate max-w-xs">— {t.description}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {assignee ? (
                      <div>
                        <p className="text-sm text-foreground">{assignee.fullName}</p>
                        <p className="text-xs text-muted-foreground">{assignee.role}</p>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">غير مسند</span>}
                  </td>
                  <td className="px-4 py-3">
                    {hasCoords ? (
                      <a href={mapsUrl(t.latitude as number, t.longitude as number)} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition-colors">
                        <MapPin size={11} />
                        {t.locationName ?? "افتح في الخرائط"}
                      </a>
                    ) : t.locationName ? (
                      <span className="text-xs text-muted-foreground">{t.locationName}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateTicketModal users={users} onClose={() => setShowCreate(false)} onCreated={(t) => setTickets((prev) => [t, ...prev])} />
      )}
    </div>
  );
}
