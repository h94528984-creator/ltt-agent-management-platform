import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { AgentEntry } from "../data/agentsList";

export type ServiceCenterEntry = { id: number; name: string; lat: number; lng: number; address: string };
export type FixedPosEntry = { id: number; name: string; lat: number; lng: number; address: string };

function useAgents(): AgentEntry[] {
  const [items, setItems] = useState<AgentEntry[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/agents`)
      .then(r => r.ok ? r.json() : [])
      .then((rows: Array<{ id: number; name: string; city: string | null; address: string | null; phone: string | null; email: string | null; latitude: number | null; longitude: number | null }>) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const norm = (s: string) => s.replace(/\s+/g, " ").trim();
        const deduped: AgentEntry[] = [];
        for (const r of rows) {
          const key = norm(r.name).toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push({
            id: r.id, name: r.name, city: r.city ?? "", address: r.address ?? "",
            phone: r.phone ?? "", email: r.email ?? "",
            lat: r.latitude != null ? Number(r.latitude) : null,
            lng: r.longitude != null ? Number(r.longitude) : null,
          });
        }
        deduped.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        setItems(deduped);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return items;
}

function useEntityList(entityType: "service_center" | "fixed_pos" | "mobile_van") {
  const [items, setItems] = useState<ServiceCenterEntry[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/agent-requests?entityType=${entityType}`)
      .then(r => r.ok ? r.json() : [])
      .then((rows: Array<{ id: number; agentName: string; latitude: number | null; longitude: number | null; fullAddress: string | null; status: string }>) => {
        if (cancelled) return;
        setItems(rows
          .filter(r => r.status !== "cancelled" && r.latitude != null && r.longitude != null)
          .map(r => ({ id: r.id, name: r.agentName, lat: Number(r.latitude), lng: Number(r.longitude), address: r.fullAddress ?? "" }))
        );
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [entityType]);
  return items;
}

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const API_BASE = "/api";

const CLASS_OPTIONS = [
  { value: "A", label: "الفئة (أ) - Class A", guarantee: "25,000 د.ل.", branches: "25 فرعاً" },
  { value: "B", label: "الفئة (ب) - Class B", guarantee: "20,000 د.ل.", branches: "15 فرعاً" },
  { value: "C", label: "الفئة (جـ) - Class C", guarantee: "15,000 د.ل.", branches: "7 فروع" },
  { value: "D", label: "الفئة (د) - Class D", guarantee: "10,000 د.ل.", branches: "3 فروع" },
  { value: "E", label: "الفئة (هـ) - Class E", guarantee: "5,000 د.ل.", branches: "1 فرع فقط" },
];

const ACTIVITY_TYPES = [
  { value: "agent_main", label: "وكيل - الفئة (أ)" },
  { value: "agent_sub", label: "وكيل - الفئة (ب)" },
  { value: "agent_c", label: "وكيل - الفئة (ج)" },
  { value: "agent_d", label: "وكيل - الفئة (د)" },
  { value: "agent_e", label: "وكيل - الفئة (هـ)" },
];

const SERVICES_AVAILABLE = [
  { value: "4G", label: "4G" },
  { value: "FWA", label: "FWA" },
  { value: "ADSL", label: "ADSL" },
  { value: "FTTH", label: "FTTH" },
  { value: "eSIM", label: "eSIM" },
  { value: "FIXD_VOLTE", label: "FIXD VoLTE" },
  { value: "RECHARGE", label: "Recharge" },
];

const DOC_TYPES = [
  { value: "license", label: "رخصة تجارية" },
  { value: "commercial_record", label: "سجل تجاري" },
  { value: "contract", label: "عقد الوكالة" },
  { value: "id_copy", label: "صورة الهوية" },
  { value: "other", label: "وثيقة أخرى" },
];

type Mode = "inspection" | "new_agent" | "service_center" | "fixed_pos" | "mobile_van";

const MODE_CONFIG: Record<Mode, { label: string; icon: string; color: string; activeColor: string; description: string }> = {
  inspection:     { label: "تفتيش على وكيل قائم",             icon: "🔍", color: "border-orange-500 bg-orange-50 text-orange-700", activeColor: "border-orange-500 bg-orange-50 text-orange-700", description: "مراجعة ميدانية لوكيل مسجّل" },
  new_agent:      { label: "إنشاء وكيل جديد",                 icon: "➕", color: "border-green-500 bg-green-50 text-green-700",  activeColor: "border-green-500 bg-green-50 text-green-700",  description: "تسجيل وكيل جديد في المنظومة" },
  service_center: { label: "مركز خدمات",                      icon: "🏢", color: "border-blue-500 bg-blue-50 text-blue-700",    activeColor: "border-blue-500 bg-blue-50 text-blue-700",    description: "موظفو الشركة" },
  fixed_pos:      { label: "نقطة بيع ثابتة",                  icon: "🏪", color: "border-indigo-500 bg-indigo-50 text-indigo-700", activeColor: "border-indigo-500 bg-indigo-50 text-indigo-700", description: "موظفو الشركة" },
  mobile_van:     { label: "سيارة بيع وخدمات متنقلة",         icon: "🚐", color: "border-purple-500 bg-purple-50 text-purple-700", activeColor: "border-purple-500 bg-purple-50 text-purple-700", description: "موظفو الشركة" },
};

type InspectionFormData = {
  agentName: string; agentEmail: string; city: string; fullAddress: string;
  mobile: string; landline: string; activityType: string;
  latitude: string; longitude: string; locationDescription: string;
  hasSignboard: string; hasDevices: string; internetQuality: string;
  staffReadiness: string; areaTraffic: string; marketDensitySameCity: string;
  marketDensitySameStreet: string; transactionVolumeAdsl: string; transactionVolume4g: string;
  documentsComplete: string; brandIdentityCompliant: string; notes: string; services: string[];
};

type NewAgentFormData = {
  name: string; phone: string; email: string; city: string; address: string;
  agentClass: string; channelType: string; classType: string;
  latitude: string; longitude: string; internetQuality: string;
  hasSignboard: string; hasDevices: string; staffReadiness: string;
  areaTraffic: string; services: string[]; notes: string;
};

type CompanyEntityFormData = {
  entityName: string; responsibleEmployee: string; employeePhone: string;
  city: string; address: string; latitude: string; longitude: string;
  hasSignboard: string; hasDevices: string; internetQuality: string;
  staffCount: string; staffReadiness: string; areaTraffic: string;
  services: string[]; notes: string;
};

const defaultCompanyEntityForm: CompanyEntityFormData = {
  entityName: "", responsibleEmployee: "", employeePhone: "", city: "", address: "",
  latitude: "", longitude: "", hasSignboard: "true", hasDevices: "true",
  internetQuality: "good", staffCount: "1", staffReadiness: "3", areaTraffic: "medium",
  services: [], notes: "",
};

type PhotoCatKey = "sitePhotos" | "interiorPhotos" | "equipmentPhotos";
type PhotoCategory = { key: PhotoCatKey; label: string; icon: string };
const PHOTO_CATS: PhotoCategory[] = [
  { key: "sitePhotos", label: "صور الموقع الخارجي / اللافتة", icon: "🏪" },
  { key: "interiorPhotos", label: "صور الداخل", icon: "🏠" },
  { key: "equipmentPhotos", label: "صور الأجهزة والمعدات", icon: "🖥️" },
];

type PhotoState = Record<PhotoCatKey, File[]>;
type PhotoPreviewState = Record<PhotoCatKey, string[]>;
type DocUpload = { docType: string; file: File | null; notes: string };

function DocUploadRow({ doc, idx, onChange }: {
  doc: DocUpload; idx: number;
  onChange: (idx: number, update: Partial<DocUpload>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const typeLabel = DOC_TYPES.find(d => d.value === doc.docType)?.label ?? doc.docType;
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{typeLabel}</span>
        {doc.file && <span className="text-xs text-green-600 font-medium">✓ {doc.file.name}</span>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => ref.current?.click()} className="flex-1 text-center rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors">
          {doc.file ? "تغيير الملف" : "اختر ملف"}
        </button>
        {doc.file && <button type="button" onClick={() => onChange(idx, { file: null })} className="rounded-lg border border-red-200 text-red-500 px-3 text-xs hover:bg-red-50">حذف</button>}
      </div>
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => onChange(idx, { file: e.target.files?.[0] ?? null })} />
      <input className="w-full rounded-lg border border-gray-200 p-2 text-xs" value={doc.notes} onChange={e => onChange(idx, { notes: e.target.value })} placeholder="ملاحظة اختيارية" />
    </div>
  );
}

type Scores = { readiness: number; sales: number; compliance: number; final: number };
function calcScores(f: InspectionFormData): Scores {
  let readiness = 0;
  if (f.hasSignboard === "true") readiness += 20;
  if (f.hasDevices === "true") readiness += 20;
  if (f.services.includes("FTTH")) readiness += 15;
  if (f.services.includes("FWA")) readiness += 10;
  if (f.services.includes("4G")) readiness += 10;
  if (f.internetQuality === "good") readiness += 15;
  else if (f.internetQuality === "medium") readiness += 8;
  readiness += Math.round((parseInt(f.staffReadiness || "3") / 5) * 10);
  readiness = Math.min(100, readiness);
  let sales = 0;
  if (f.areaTraffic === "high") sales += 40;
  else if (f.areaTraffic === "medium") sales += 25;
  else sales += 10;
  const cityComp = parseInt(f.marketDensitySameCity || "0");
  if (cityComp === 0) sales += 20; else if (cityComp === 1) sales += 16; else if (cityComp === 2) sales += 12; else if (cityComp <= 4) sales += 8; else sales += 4;
  const street = parseInt(f.marketDensitySameStreet || "0");
  if (street === 0) sales += 30; else if (street === 1) sales += 22; else if (street === 2) sales += 15; else if (street <= 4) sales += 8; else sales += 3;
  const totalTx = parseInt(f.transactionVolumeAdsl || "0") + parseInt(f.transactionVolume4g || "0");
  if (totalTx >= 1000) sales += 30; else if (totalTx >= 500) sales += 22; else if (totalTx >= 200) sales += 15; else if (totalTx >= 50) sales += 8; else sales += 3;
  sales = Math.min(100, sales);
  const compliance = (f.documentsComplete === "true" ? 50 : 0) + (f.brandIdentityCompliant === "true" ? 50 : 0);
  const final = Math.round(0.4 * readiness + 0.35 * sales + 0.25 * compliance);
  return { readiness, sales, compliance, final };
}

function getServiceScore(services: string[]) {
  let score = 0;
  if (services.includes("FTTH")) score += 30;
  if (services.includes("FWA")) score += 20;
  if (services.includes("4G")) score += 20;
  if (services.includes("ADSL")) score += 10;
  if (services.includes("eSIM")) score += 10;
  if (services.includes("FIXD_VOLTE")) score += 5;
  if (services.includes("RECHARGE")) score += 5;
  return Math.min(100, score);
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className="text-gray-600">{label}</span><span className="font-bold">{value}/100</span></div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function MapPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  function ClickHandler() { useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } }); return null; }
  return <ClickHandler />;
}

function PhotoUploadSection({ cat, files, previews, onAdd, onRemove }: {
  cat: PhotoCategory; files: File[]; previews: string[];
  onAdd: (f: FileList | null) => void; onRemove: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{cat.icon} {cat.label} <span className="text-gray-400 font-normal">(حتى 5 ملفات)</span></label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
        onClick={() => ref.current?.click()}
        onDrop={e => { e.preventDefault(); onAdd(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}>
        <p className="text-sm text-gray-500">{files.length === 0 ? "اسحب الملفات هنا أو انقر للاختيار" : `${files.length} ملف محدد`}</p>
      </div>
      <input ref={ref} type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => onAdd(e.target.files)} />
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
              {src.startsWith("blob:") || src.startsWith("data:") ? <img src={src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>}
              <button type="button" onClick={() => onRemove(i)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xl">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentSelector({ selected, onSelect, agents }: { selected: AgentEntry | null; onSelect: (a: AgentEntry) => void; agents: AgentEntry[] }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = search.trim().length < 1 ? agents : agents.filter(a => a.name.includes(search) || a.city.includes(search) || a.phone.includes(search) || String(a.id).includes(search));
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-right flex items-center justify-between hover:border-orange-400 transition-colors focus:outline-none focus:border-orange-500 bg-white">
        {selected ? (
          <div className="text-right">
            <div className="font-bold text-gray-900 text-sm">{selected.name}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
              {selected.city && <span>📍 {selected.city}</span>}
              {selected.phone && <span>📞 {selected.phone}</span>}
              {selected.lat !== null && <span className="text-green-600">✓ إحداثيات متوفرة</span>}
            </div>
          </div>
        ) : <span className="text-gray-400">— ابحث أو اختر الوكيل —</span>}
        <span className="text-gray-400 mr-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute z-50 w-full bg-white border-2 border-orange-300 rounded-xl shadow-2xl mt-1 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو المدينة أو الرقم" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.map(a => (
              <button key={a.id} type="button" onClick={() => { onSelect(a); setOpen(false); }} className="w-full text-right px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0">
                <div className="font-medium text-gray-900 text-sm">{a.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  {a.city && <span>📍 {a.city}</span>}
                  {a.phone && <span>📞 {a.phone}</span>}
                  {a.email && <span>✉️ {a.email}</span>}
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">لا توجد نتائج</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCenterSelector({ selected, onSelect, items }: { selected: ServiceCenterEntry | null; onSelect: (c: ServiceCenterEntry) => void; items: ServiceCenterEntry[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-right flex items-center justify-between hover:border-blue-400 transition-colors focus:outline-none focus:border-blue-500 bg-white">
        {selected ? (
          <div className="text-right">
            <div className="font-bold text-gray-900 text-sm">{selected.name}</div>
            <div className="text-xs text-green-600 mt-0.5">✓ إحداثيات متوفرة — {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</div>
          </div>
        ) : <span className="text-gray-400">— اختر مركز الخدمات —</span>}
        <span className="text-gray-400 mr-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute z-50 w-full bg-white border-2 border-blue-300 rounded-xl shadow-2xl mt-1 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 && <div className="px-4 py-3 text-sm text-gray-400">— لا توجد مراكز معتمدة بعد —</div>}
            {items.map(c => (
              <button key={c.id} type="button" onClick={() => { onSelect(c); setOpen(false); }}
                className="w-full text-right px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                  {c.address && <div className="text-xs text-gray-500 mt-0.5">📍 {c.address}</div>}
                </div>
                <span className="text-xs text-green-600 font-mono mr-2">{c.lat.toFixed(4)}, {c.lng.toFixed(4)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FixedPosSelector({ selected, onSelect, items }: { selected: FixedPosEntry | null; onSelect: (p: FixedPosEntry) => void; items: FixedPosEntry[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-right flex items-center justify-between hover:border-indigo-400 transition-colors focus:outline-none focus:border-indigo-500 bg-white">
        {selected ? (
          <div className="text-right">
            <div className="font-bold text-gray-900 text-sm">{selected.name}</div>
            <div className="text-xs text-green-600 mt-0.5">✓ إحداثيات متوفرة — {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</div>
          </div>
        ) : <span className="text-gray-400">— اختر نقطة البيع —</span>}
        <span className="text-gray-400 mr-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute z-50 w-full bg-white border-2 border-indigo-300 rounded-xl shadow-2xl mt-1 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 && <div className="px-4 py-3 text-sm text-gray-400">— لا توجد نقاط بيع معتمدة بعد —</div>}
            {items.map(p => (
              <button key={p.id} type="button" onClick={() => { onSelect(p); setOpen(false); }}
                className="w-full text-right px-4 py-3 hover:bg-indigo-50 border-b border-gray-50 last:border-0 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                  {p.address && <div className="text-xs text-gray-500 mt-0.5">📍 {p.address}</div>}
                </div>
                <span className="text-xs text-green-600 font-mono mr-2">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MapPanel({ lat, lng, agentLat, agentLng, onChange }: {
  lat: string; lng: string; agentLat?: string; agentLng?: string;
  onChange: (lat: string, lng: string) => void;
}) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const hasAgentCoords = agentLat && agentLng && agentLat !== "" && agentLng !== "";
  const mapCenter: [number, number] = lat && lng ? [Number(lat), Number(lng)] : [32.8872, 13.1913];

  const handleGps = () => {
    if (!navigator.geolocation) { setGpsError("المتصفح لا يدعم GPS"); return; }
    setGpsLoading(true); setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { onChange(String(pos.coords.latitude.toFixed(6)), String(pos.coords.longitude.toFixed(6))); setGpsLoading(false); },
      () => { setGpsError("تعذّر تحديد الموقع — تأكد من منح الإذن"); setGpsLoading(false); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
      <h2 className="font-semibold text-gray-900">📍 الموقع الجغرافي</h2>
      {hasAgentCoords && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          <span className="text-lg">📌</span>
          <span>إحداثيات مسجلة مسبقاً:&nbsp;<span className="font-mono font-semibold">{Number(agentLat).toFixed(4)}, {Number(agentLng).toFixed(4)}</span>&nbsp;—&nbsp;يمكن تحديثها</span>
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-2">
        <button type="button" onClick={handleGps} disabled={gpsLoading}
          className="w-full rounded-xl border-2 border-dashed border-red-300 bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60">
          {gpsLoading ? "⏳ جارٍ تحديد الموقع..." : "📍 تحديد الموقع الحالي بالـ GPS"}
        </button>
        <button type="button"
          onClick={() => {
            if (!lat || !lng) { setGpsError("حدّد الإحداثيات أولاً ثم اضغط للتنقل"); return; }
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          disabled={!lat || !lng}
          title="يفتح خرائط Google للملاحة إلى الإحداثيات المحددة"
          className="w-full rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50">
          🧭 افتح في الخرائط للملاحة إلى الموقع
        </button>
      </div>
      {gpsError && <p className="text-xs text-red-500 text-center">{gpsError}</p>}
      <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={mapCenter} zoom={lat && lng ? 12 : 6} key={`${lat}-${lng}`} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapPicker onPick={(la, ln) => onChange(String(la), String(ln))} />
          {lat && lng && <Marker position={[Number(lat), Number(lng)]} />}
        </MapContainer>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div><label className="text-xs text-gray-500 mb-1 block">خط العرض</label><input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={lat} onChange={e => onChange(e.target.value, lng)} placeholder="32.8872" /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">خط الطول</label><input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={lng} onChange={e => onChange(lat, e.target.value)} placeholder="13.1913" /></div>
      </div>
    </div>
  );
}

function CompanyEntityForm({
  mode, form, onChange, photos, photoPreviews, onAddPhotos, onRemovePhoto,
  selectedCenter, onSelectCenter, selectedFixedPos, onSelectFixedPos,
}: {
  mode: "service_center" | "fixed_pos" | "mobile_van";
  form: CompanyEntityFormData;
  onChange: (update: Partial<CompanyEntityFormData>) => void;
  photos: PhotoState; photoPreviews: PhotoPreviewState;
  onAddPhotos: (key: PhotoCatKey, files: FileList | null) => void;
  onRemovePhoto: (key: PhotoCatKey, i: number) => void;
  selectedCenter: ServiceCenterEntry | null;
  onSelectCenter: (c: ServiceCenterEntry) => void;
  selectedFixedPos: FixedPosEntry | null;
  onSelectFixedPos: (p: FixedPosEntry) => void;
}) {
  const cfg = MODE_CONFIG[mode];
  const serviceCenters = useEntityList("service_center");
  const fixedPosItems = useEntityList("fixed_pos");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/agent-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: mode,
          entityName: form.entityName,
          responsibleEmployee: form.responsibleEmployee,
          employeePhone: form.employeePhone,
          city: form.city,
          address: form.address,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          hasSignboard: form.hasSignboard === "true",
          hasDevices: form.hasDevices === "true",
          internetQuality: form.internetQuality,
          staffCount: parseInt(form.staffCount || "1"),
          staffReadiness: parseInt(form.staffReadiness || "3"),
          areaTraffic: form.areaTraffic,
          services: form.services,
          notes: form.notes,
        }),
      });
      if (!res.ok) { setResult({ ok: false, msg: "حدث خطأ عند الحفظ" }); return; }
      setResult({ ok: true, msg: `✓ تم حفظ بيانات ${cfg.label} بنجاح` });
    } finally { setSaving(false); }
  };

  const toggleService = (s: string) => {
    onChange({ services: form.services.includes(s) ? form.services.filter(x => x !== s) : [...form.services, s] });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        {/* Service center picker — only in service_center mode */}
        {mode === "service_center" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 اختر مركز الخدمات</label>
            <ServiceCenterSelector selected={selectedCenter} onSelect={onSelectCenter} items={serviceCenters} />
          </div>
        )}
        {/* Fixed POS picker — only in fixed_pos mode */}
        {mode === "fixed_pos" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏪 اختر نقطة البيع الثابتة</label>
            <FixedPosSelector selected={selectedFixedPos} onSelect={onSelectFixedPos} items={fixedPosItems} />
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold mb-4 border-2 ${cfg.color}`}>
            <span>{cfg.icon}</span><span>{cfg.label}</span><span className="text-xs font-normal opacity-70">— {cfg.description}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">اسم الكيان / المنشأة <span className="text-red-500">*</span></label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-400 focus:outline-none" value={form.entityName} onChange={e => onChange({ entityName: e.target.value })} placeholder={`اسم ${cfg.label}`} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">اسم الموظف المسؤول</label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.responsibleEmployee} onChange={e => onChange({ responsibleEmployee: e.target.value })} placeholder="اسم الموظف" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">هاتف الموظف</label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.employeePhone} onChange={e => onChange({ employeePhone: e.target.value })} placeholder="09XXXXXXXX" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">المدينة</label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.city} onChange={e => onChange({ city: e.target.value })} placeholder="المدينة" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">عدد الموظفين</label>
              <input type="number" min="1" className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.staffCount} onChange={e => onChange({ staffCount: e.target.value })} placeholder="1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">العنوان الكامل</label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.address} onChange={e => onChange({ address: e.target.value })} placeholder="العنوان التفصيلي" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">الجاهزية التشغيلية</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.hasSignboard} onChange={e => onChange({ hasSignboard: e.target.value })}>
              <option value="true">يوجد لافتة</option>
              <option value="false">لا توجد لافتة</option>
            </select>
            <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.hasDevices} onChange={e => onChange({ hasDevices: e.target.value })}>
              <option value="true">الأجهزة متوفرة</option>
              <option value="false">الأجهزة غير متوفرة</option>
            </select>
            <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.internetQuality} onChange={e => onChange({ internetQuality: e.target.value })}>
              <option value="good">جودة الإنترنت: جيدة</option>
              <option value="medium">جودة الإنترنت: متوسطة</option>
              <option value="poor">جودة الإنترنت: ضعيفة</option>
            </select>
            <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.areaTraffic} onChange={e => onChange({ areaTraffic: e.target.value })}>
              <option value="high">حركة المنطقة: مرتفعة</option>
              <option value="medium">حركة المنطقة: متوسطة</option>
              <option value="low">حركة المنطقة: منخفضة</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="text-xs text-gray-500 mb-2 block">الخدمات المقدّمة</label>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
              {SERVICES_AVAILABLE.map(s => (
                <label key={s.value} className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form.services.includes(s.value)} disabled={form.hasDevices !== "true"} onChange={() => toggleService(s.value)} />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <label className="text-xs text-gray-500 mb-1 block">ملاحظات</label>
          <textarea className="w-full rounded-xl border border-gray-200 p-3 text-sm" rows={3} value={form.notes} onChange={e => onChange({ notes: e.target.value })} placeholder="أي ملاحظات إضافية..." />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          {result && (
            <div className={`rounded-xl p-3 mb-3 text-sm font-semibold ${result.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {result.msg}
            </div>
          )}
          <button type="button" onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-black text-white px-4 py-3 text-sm font-semibold hover:bg-gray-800 disabled:opacity-60">
            {saving ? "⏳ جارٍ الحفظ..." : `💾 حفظ بيانات ${cfg.label}`}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <MapPanel lat={form.latitude} lng={form.longitude} onChange={(la, ln) => onChange({ latitude: la, longitude: ln })} />
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">المرفقات</h2>
          {PHOTO_CATS.map(cat => (
            <PhotoUploadSection key={cat.key} cat={cat} files={photos[cat.key]} previews={photoPreviews[cat.key]}
              onAdd={files => onAddPhotos(cat.key, files)} onRemove={i => onRemovePhoto(cat.key, i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AgentRequestForm() {
  const [mode, setMode] = useState<Mode>("inspection");
  const agents = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<AgentEntry | null>(null);
  useEffect(() => {
    if (!selectedAgent && agents.length > 0) setSelectedAgent(agents[0]);
  }, [agents, selectedAgent]);
  const [form, setForm] = useState<InspectionFormData>({
    agentName: "", agentEmail: "", city: "",
    fullAddress: "", mobile: "", landline: "",
    activityType: ACTIVITY_TYPES[0]?.value ?? "", latitude: "",
    longitude: "", locationDescription: "",
    hasSignboard: "true", hasDevices: "true", internetQuality: "good", staffReadiness: "3",
    areaTraffic: "medium", marketDensitySameCity: "0", marketDensitySameStreet: "0",
    transactionVolumeAdsl: "0", transactionVolume4g: "0",
    documentsComplete: "true", brandIdentityCompliant: "true", notes: "", services: [],
  });
  const [newAgentForm, setNewAgentForm] = useState<NewAgentFormData>({
    name: "", phone: "", email: "", city: "", address: "", agentClass: "A",
    channelType: "agent_main", classType: "A", latitude: "", longitude: "",
    internetQuality: "good", hasSignboard: "true", hasDevices: "true",
    staffReadiness: "3", areaTraffic: "medium", services: [], notes: "",
  });
  const [companyForm, setCompanyForm] = useState<CompanyEntityFormData>(defaultCompanyEntityForm);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenterEntry | null>(null);
  const [selectedFixedPos, setSelectedFixedPos] = useState<FixedPosEntry | null>(null);
  const [photos, setPhotos] = useState<PhotoState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviewState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [docUploads, setDocUploads] = useState<DocUpload[]>(DOC_TYPES.map(d => ({ docType: d.value, file: null, notes: "" })));
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!selectedAgent) return;
    setForm(p => ({ ...p, agentName: selectedAgent.name, mobile: selectedAgent.phone, agentEmail: selectedAgent.email, city: selectedAgent.city, fullAddress: selectedAgent.address, latitude: selectedAgent.lat?.toString() ?? "", longitude: selectedAgent.lng?.toString() ?? "" }));
  }, [selectedAgent]);

  useEffect(() => {
    if (!selectedCenter) return;
    setCompanyForm(p => ({
      ...p,
      entityName: selectedCenter.name,
      address: selectedCenter.address || p.address,
      latitude: String(selectedCenter.lat),
      longitude: String(selectedCenter.lng),
    }));
  }, [selectedCenter]);

  useEffect(() => {
    if (!selectedFixedPos) return;
    setCompanyForm(p => ({
      ...p,
      entityName: selectedFixedPos.name,
      address: selectedFixedPos.address || p.address,
      latitude: String(selectedFixedPos.lat),
      longitude: String(selectedFixedPos.lng),
    }));
  }, [selectedFixedPos]);

  useEffect(() => { if (form.hasDevices !== "true" && form.services.length > 0) setForm(p => ({ ...p, services: [] })); }, [form.hasDevices, form.services.length]);
  useEffect(() => { if (newAgentForm.hasDevices !== "true" && newAgentForm.services.length > 0) setNewAgentForm(p => ({ ...p, services: [] })); }, [newAgentForm.hasDevices, newAgentForm.services.length]);

  const scores = calcScores(form);
  const serviceScore = getServiceScore(form.services);

  const handleAddPhotos = useCallback((key: PhotoCatKey, list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).slice(0, 5);
    setPhotos(p => ({ ...p, [key]: next }));
    setPhotoPreviews(p => ({ ...p, [key]: next.map(f => f.type.startsWith("image/") ? URL.createObjectURL(f) : f.name) }));
  }, []);

  const handleRemovePhoto = useCallback((key: PhotoCatKey, index: number) => {
    setPhotos(p => {
      const next = p[key].filter((_, i) => i !== index);
      setPhotoPreviews(pr => ({ ...pr, [key]: next.map(f => f.type.startsWith("image/") ? URL.createObjectURL(f) : f.name) }));
      return { ...p, [key]: next };
    });
  }, []);

  const toggleService = useCallback((s: string) => { setForm(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] })); }, []);
  const toggleNewService = useCallback((s: string) => { setNewAgentForm(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] })); }, []);

  const handleSaveNewAgent = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/agents`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAgentForm.name, location: newAgentForm.city || "غير محدد", city: newAgentForm.city || null, address: newAgentForm.address || null, phone: newAgentForm.phone || null, email: newAgentForm.email || null, type: "dealer", status: "active", latitude: newAgentForm.latitude ? parseFloat(newAgentForm.latitude) : null, longitude: newAgentForm.longitude ? parseFloat(newAgentForm.longitude) : null, notes: newAgentForm.notes || null }),
      });
      if (!res.ok) return setResult({ ok: false, msg: "حدث خطأ عند حفظ الوكيل" });
      const agent = await res.json() as { id: number };
      for (const doc of docUploads) {
        if (!doc.file) continue;
        const fd = new FormData();
        fd.append("agentId", String(agent.id)); fd.append("docType", doc.docType); fd.append("notes", doc.notes); fd.append("file", doc.file);
        await fetch(`${API_BASE}/documents`, { method: "POST", body: fd }).catch(() => null);
      }
      setResult({ ok: true, msg: `✓ تم إنشاء الوكيل بنجاح (رقم ${agent.id})` });
    } finally { setSaving(false); }
  };

  const isCompanyMode = mode === "service_center" || mode === "fixed_pos" || mode === "mobile_van";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h1 className="text-2xl font-black text-gray-900">منصة متابعة عمليات المراكز والوكلاء</h1>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">اختر نوع العملية:</p>
          <div className="space-y-2">
            {/* Agent operations — top row */}
            <div className="grid grid-cols-2 gap-3">
              {(["inspection", "new_agent"] as const).map(m => {
                const cfg = MODE_CONFIG[m];
                const isActive = mode === m;
                return (
                  <button key={m} type="button" onClick={() => setMode(m)}
                    className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all text-center ${isActive ? cfg.activeColor : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
                    <div className="text-2xl mb-1">{cfg.icon}</div>
                    <div>{cfg.label}</div>
                  </button>
                );
              })}
            </div>
            {/* Company entity operations — bottom row */}
            <div className="border-t border-gray-100 pt-2">
              <p className="text-xs text-gray-400 mb-2">كيانات موظفو الشركة:</p>
              <div className="grid grid-cols-3 gap-3">
                {(["service_center", "fixed_pos", "mobile_van"] as const).map(m => {
                  const cfg = MODE_CONFIG[m];
                  const isActive = mode === m;
                  return (
                    <button key={m} type="button" onClick={() => setMode(m)}
                      className={`rounded-xl border-2 px-3 py-3 text-xs font-semibold transition-all text-center ${isActive ? cfg.activeColor : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
                      <div className="text-xl mb-1">{cfg.icon}</div>
                      <div>{cfg.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Mode */}
        {mode === "inspection" && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">اختر الوكيل</label>
                <AgentSelector selected={selectedAgent} onSelect={a => setSelectedAgent(a)} agents={agents} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.agentName} onChange={e => setForm({ ...form, agentName: e.target.value })} placeholder="اسم الوكيل" />
                  <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.agentEmail} onChange={e => setForm({ ...form, agentEmail: e.target.value })} placeholder="بريد الوكيل" />
                  <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="الهاتف" />
                  <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="المدينة" />
                  <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.activityType} onChange={e => setForm({ ...form, activityType: e.target.value })}>
                    {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.fullAddress} onChange={e => setForm({ ...form, fullAddress: e.target.value })} placeholder="العنوان الكامل" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">التراخيص والجاهزية</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.documentsComplete} onChange={e => setForm({ ...form, documentsComplete: e.target.value })}>
                    <option value="true">الوثائق مكتملة</option><option value="false">الوثائق ناقصة</option>
                  </select>
                  <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.brandIdentityCompliant} onChange={e => setForm({ ...form, brandIdentityCompliant: e.target.value })}>
                    <option value="true">الهوية التجارية متوافقة</option><option value="false">الهوية التجارية غير متوافقة</option>
                  </select>
                  <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.hasSignboard} onChange={e => setForm({ ...form, hasSignboard: e.target.value })}>
                    <option value="true">يوجد لافتة</option><option value="false">لا توجد لافتة</option>
                  </select>
                  <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.hasDevices} onChange={e => setForm({ ...form, hasDevices: e.target.value })}>
                    <option value="true">الأجهزة متوفرة</option><option value="false">الأجهزة غير متوفرة</option>
                  </select>
                </div>
                <div className="grid gap-2 grid-cols-2 md:grid-cols-3 mt-4">
                  {SERVICES_AVAILABLE.map(s => (
                    <label key={s.value} className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 cursor-pointer">
                      <input type="checkbox" checked={form.services.includes(s.value)} disabled={form.hasDevices !== "true"} onChange={() => toggleService(s.value)} />
                      <span className="text-sm">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <button type="button" className="w-full rounded-xl bg-black text-white px-4 py-3 text-sm font-semibold hover:bg-gray-800">حفظ التفتيش</button>
              </div>
            </div>
            <div className="space-y-4">
              <MapPanel lat={form.latitude} lng={form.longitude} agentLat={selectedAgent?.lat?.toString() ?? ""} agentLng={selectedAgent?.lng?.toString() ?? ""} onChange={(la, ln) => setForm({ ...form, latitude: la, longitude: ln })} />
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">التقييم</h2>
                <div className="space-y-3">
                  <ScoreBar label="الجاهزية" value={scores.readiness} color="bg-blue-500" />
                  <ScoreBar label="المبيعات" value={scores.sales} color="bg-emerald-500" />
                  <ScoreBar label="الالتزام" value={scores.compliance} color="bg-orange-500" />
                  <ScoreBar label="النهائي" value={scores.final} color="bg-purple-500" />
                  <ScoreBar label="الخدمات" value={serviceScore} color="bg-indigo-500" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <h2 className="font-semibold text-gray-900">المرفقات</h2>
                {PHOTO_CATS.map(cat => (
                  <PhotoUploadSection key={cat.key} cat={cat} files={photos[cat.key]} previews={photoPreviews[cat.key]}
                    onAdd={files => handleAddPhotos(cat.key, files)} onRemove={i => handleRemovePhoto(cat.key, i)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* New Agent Mode */}
        {mode === "new_agent" && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">بيانات الوكيل</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">اسم الوكيل <span className="text-red-500">*</span></label>
                    <input className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-orange-400 focus:outline-none" value={newAgentForm.name} onChange={e => setNewAgentForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: شركة النور" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">الهاتف</label>
                    <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={newAgentForm.phone} onChange={e => setNewAgentForm(p => ({ ...p, phone: e.target.value }))} placeholder="0912345678" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">البريد الإلكتروني</label>
                    <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={newAgentForm.email} onChange={e => setNewAgentForm(p => ({ ...p, email: e.target.value }))} placeholder="agent@example.com" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">المدينة</label>
                    <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={newAgentForm.city} onChange={e => setNewAgentForm(p => ({ ...p, city: e.target.value }))} placeholder="المدينة" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">فئة الوكيل</label>
                    <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={newAgentForm.classType} onChange={e => setNewAgentForm(p => ({ ...p, classType: e.target.value }))}>
                      {CLASS_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">العنوان</label>
                    <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={newAgentForm.address} onChange={e => setNewAgentForm(p => ({ ...p, address: e.target.value }))} placeholder="العنوان الكامل" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">الوثائق المطلوبة</h2>
                <div className="space-y-3">
                  {docUploads.map((doc, idx) => (
                    <DocUploadRow key={doc.docType} doc={doc} idx={idx} onChange={(i, u) => setDocUploads(prev => prev.map((d, j) => j === i ? { ...d, ...u } : d))} />
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                {result && (
                  <div className={`rounded-xl p-3 mb-3 text-sm font-semibold ${result.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {result.msg}
                  </div>
                )}
                <button type="button" onClick={handleSaveNewAgent} disabled={saving} className="w-full rounded-xl bg-green-700 text-white px-4 py-3 text-sm font-semibold hover:bg-green-800 disabled:opacity-60">
                  {saving ? "⏳ جارٍ الحفظ..." : "✓ حفظ الوكيل الجديد"}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <MapPanel lat={newAgentForm.latitude} lng={newAgentForm.longitude} onChange={(la, ln) => setNewAgentForm(p => ({ ...p, latitude: la, longitude: ln }))} />
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <h2 className="font-semibold text-gray-900">المرفقات</h2>
                {PHOTO_CATS.map(cat => (
                  <PhotoUploadSection key={cat.key} cat={cat} files={photos[cat.key]} previews={photoPreviews[cat.key]}
                    onAdd={files => handleAddPhotos(cat.key, files)} onRemove={i => handleRemovePhoto(cat.key, i)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Company Entity Modes */}
        {isCompanyMode && (
          <CompanyEntityForm
            mode={mode as "service_center" | "fixed_pos" | "mobile_van"}
            form={companyForm}
            onChange={update => setCompanyForm(p => ({ ...p, ...update }))}
            photos={photos} photoPreviews={photoPreviews}
            onAddPhotos={handleAddPhotos} onRemovePhoto={handleRemovePhoto}
            selectedCenter={selectedCenter}
            onSelectCenter={c => setSelectedCenter(c)}
            selectedFixedPos={selectedFixedPos}
            onSelectFixedPos={p => setSelectedFixedPos(p)}
          />
        )}

      </div>
    </div>
  );
}
