import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { AGENTS, type AgentEntry } from "../data/agentsList";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const API_BASE = "/api";

const ACTIVITY_TYPES = [
  { value: "agent_main",    label: "وكيل رئيسي" },
  { value: "agent_sub",     label: "وكيل فرعي" },
  { value: "service_center",label: "مركز خدمات" },
  { value: "fixed_pos",     label: "نقطة بيع ثابتة" },
  { value: "mobile_van",    label: "سيارة بيع وخدمات متنقلة" },
  { value: "peddler",       label: "بائع متجول" },
];

const SERVICES_AVAILABLE = [
  { value: "4G",         label: "4G" },
  { value: "FWA",        label: "FWA" },
  { value: "ADSL",       label: "ADSL" },
  { value: "FTTH",       label: "FTTH" },
  { value: "eSIM",       label: "eSIM" },
  { value: "FIXD_VOLTE", label: "FIXD VoLTE" },
  { value: "RECHARGE",   label: "Recharge" },
];

const DOC_TYPES = [
  { value: "license",          label: "رخصة تجارية" },
  { value: "commercial_record",label: "سجل تجاري" },
  { value: "contract",         label: "عقد الوكالة" },
  { value: "id_copy",          label: "صورة الهوية" },
  { value: "other",            label: "وثيقة أخرى" },
];

// ─── Shared Types ─────────────────────────────────────────────────────────────

type InspectionFormData = {
  agentName: string;
  agentEmail: string;
  city: string;
  fullAddress: string;
  mobile: string;
  landline: string;
  activityType: string;
  latitude: string;
  longitude: string;
  locationDescription: string;
  hasSignboard: string;
  hasDevices: string;
  internetQuality: string;
  staffReadiness: string;
  areaTraffic: string;
  marketDensitySameCity: string;
  marketDensitySameStreet: string;
  transactionVolumeAdsl: string;
  transactionVolume4g: string;
  documentsComplete: string;
  brandIdentityCompliant: string;
  notes: string;
  services: string[];
};

type NewAgentFormData = {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  channelType: string;
  latitude: string;
  longitude: string;
  internetQuality: string;
  hasSignboard: string;
  hasDevices: string;
  staffReadiness: string;
  areaTraffic: string;
  services: string[];
  notes: string;
};

type PhotoCatKey = "sitePhotos" | "interiorPhotos" | "equipmentPhotos";
type PhotoCategory = { key: PhotoCatKey; label: string; icon: string };
const PHOTO_CATS: PhotoCategory[] = [
  { key: "sitePhotos",     label: "صور الموقع الخارجي / اللافتة", icon: "🏪" },
  { key: "interiorPhotos", label: "صور الداخل", icon: "🏠" },
  { key: "equipmentPhotos",label: "صور الأجهزة والمعدات", icon: "🖥️" },
];

type PhotoState        = Record<PhotoCatKey, File[]>;
type PhotoPreviewState = Record<PhotoCatKey, string[]>;

type DocUpload = { docType: string; file: File | null; notes: string };

// ─── Score helpers ─────────────────────────────────────────────────────────────

type Scores = { readiness: number; sales: number; compliance: number; final: number };

function calcScores(f: InspectionFormData): Scores {
  let readiness = 0;
  if (f.hasSignboard === "true") readiness += 20;
  if (f.hasDevices   === "true") readiness += 20;
  if (f.services.includes("FTTH")) readiness += 15;
  if (f.services.includes("FWA"))  readiness += 10;
  if (f.services.includes("4G"))   readiness += 10;
  if (f.internetQuality === "good")   readiness += 15;
  else if (f.internetQuality === "medium") readiness += 8;
  readiness += Math.round((parseInt(f.staffReadiness || "3") / 5) * 10);
  readiness = Math.min(100, readiness);

  let sales = 0;
  if (f.areaTraffic === "high")   sales += 40;
  else if (f.areaTraffic === "medium") sales += 25;
  else sales += 10;
  const cityComp = parseInt(f.marketDensitySameCity || "0");
  if (cityComp === 0) sales += 20;
  else if (cityComp === 1) sales += 16;
  else if (cityComp === 2) sales += 12;
  else if (cityComp <= 4) sales += 8;
  else sales += 4;
  const street = parseInt(f.marketDensitySameStreet || "0");
  if (street === 0) sales += 30;
  else if (street === 1) sales += 22;
  else if (street === 2) sales += 15;
  else if (street <= 4) sales += 8;
  else sales += 3;
  const totalTx = parseInt(f.transactionVolumeAdsl || "0") + parseInt(f.transactionVolume4g || "0");
  if (totalTx >= 1000) sales += 30;
  else if (totalTx >= 500) sales += 22;
  else if (totalTx >= 200) sales += 15;
  else if (totalTx >= 50)  sales += 8;
  else sales += 3;
  sales = Math.min(100, sales);

  const compliance = (f.documentsComplete === "true" ? 50 : 0) + (f.brandIdentityCompliant === "true" ? 50 : 0);
  const final = Math.round(0.4 * readiness + 0.35 * sales + 0.25 * compliance);
  return { readiness, sales, compliance, final };
}

function getServiceScore(services: string[]) {
  let score = 0;
  if (services.includes("FTTH"))       score += 30;
  if (services.includes("FWA"))        score += 20;
  if (services.includes("4G"))         score += 20;
  if (services.includes("ADSL"))       score += 10;
  if (services.includes("eSIM"))       score += 10;
  if (services.includes("FIXD_VOLTE")) score += 5;
  if (services.includes("RECHARGE"))   score += 5;
  return Math.min(100, score);
}

// ─── Shared UI Components ──────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MapPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  function ClickHandler() {
    useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
    return null;
  }
  return <ClickHandler />;
}

function PhotoUploadSection({ cat, files, previews, onAdd, onRemove }: {
  cat: PhotoCategory; files: File[]; previews: string[];
  onAdd: (f: FileList | null) => void; onRemove: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {cat.icon} {cat.label} <span className="text-gray-400 font-normal">(حتى 5 ملفات)</span>
      </label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
        onClick={() => ref.current?.click()}
        onDrop={e => { e.preventDefault(); onAdd(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}>
        <p className="text-sm text-gray-500">
          {files.length === 0 ? "اسحب الملفات هنا أو انقر للاختيار" : `${files.length} ملف محدد`}
        </p>
      </div>
      <input ref={ref} type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="hidden"
        onChange={e => onAdd(e.target.files)} />
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
              {src.startsWith("blob:") || src.startsWith("data:") ? (
                <img src={src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
              )}
              <button type="button" onClick={() => onRemove(i)}
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xl">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentSelector({ selected, onSelect }: { selected: AgentEntry | null; onSelect: (a: AgentEntry) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const ref                 = useRef<HTMLDivElement>(null);

  const filtered = search.trim().length < 1
    ? AGENTS
    : AGENTS.filter(a =>
        a.name.includes(search) || a.city.includes(search) ||
        a.phone.includes(search) || String(a.id).includes(search));

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-right flex items-center justify-between hover:border-orange-400 transition-colors focus:outline-none focus:border-orange-500 bg-white">
        {selected ? (
          <div className="text-right">
            <div className="font-bold text-gray-900 text-sm">{selected.name}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
              {selected.city  && <span>📍 {selected.city}</span>}
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
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المدينة أو الرقم"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.map(a => (
              <button key={a.id} type="button" onClick={() => { onSelect(a); setOpen(false); }}
                className="w-full text-right px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0">
                <div className="font-medium text-gray-900 text-sm">{a.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  {a.city  && <span>📍 {a.city}</span>}
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

// ─── Map panel (shared) ────────────────────────────────────────────────────────

function MapPanel({ lat, lng, onChange }: { lat: string; lng: string; onChange: (lat: string, lng: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-3">📍 الموقع الجغرافي</h2>
      <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={[32.8872, 13.1913]} zoom={6} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapPicker onPick={(la, ln) => onChange(String(la), String(ln))} />
          {lat && lng && <Marker position={[Number(lat), Number(lng)]} />}
        </MapContainer>
      </div>
      <div className="grid gap-3 md:grid-cols-2 mt-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">خط العرض</label>
          <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={lat}
            onChange={e => onChange(e.target.value, lng)} placeholder="32.8872" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">خط الطول</label>
          <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={lng}
            onChange={e => onChange(lat, e.target.value)} placeholder="13.1913" />
        </div>
      </div>
      {lat && lng && (
        <p className="mt-2 text-xs text-green-600 font-medium">✓ الإحداثيات محددة: {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODE 1 — Inspection of existing agent
// ═══════════════════════════════════════════════════════════════════════════════

function InspectionMode() {
  const [selectedAgent, setSelectedAgent] = useState<AgentEntry | null>(AGENTS[0] ?? null);
  const [form, setForm] = useState<InspectionFormData>({
    agentName:              AGENTS[0]?.name    ?? "",
    agentEmail:             AGENTS[0]?.email   ?? "",
    city:                   AGENTS[0]?.city    ?? "",
    fullAddress:            AGENTS[0]?.address ?? "",
    mobile:                 AGENTS[0]?.phone   ?? "",
    landline:               "",
    activityType:           ACTIVITY_TYPES[0]?.value ?? "",
    latitude:               AGENTS[0]?.lat?.toString() ?? "",
    longitude:              AGENTS[0]?.lng?.toString() ?? "",
    locationDescription:    "",
    hasSignboard:           "true",
    hasDevices:             "true",
    internetQuality:        "good",
    staffReadiness:         "3",
    areaTraffic:            "medium",
    marketDensitySameCity:  "0",
    marketDensitySameStreet:"0",
    transactionVolumeAdsl:  "0",
    transactionVolume4g:    "0",
    documentsComplete:      "true",
    brandIdentityCompliant: "true",
    notes:                  "",
    services:               [],
  });
  const [photos, setPhotos]             = useState<PhotoState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviewState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  useEffect(() => {
    if (!selectedAgent) return;
    setForm(p => ({
      ...p,
      agentName:   selectedAgent.name,
      mobile:      selectedAgent.phone,
      agentEmail:  selectedAgent.email,
      city:        selectedAgent.city,
      fullAddress: selectedAgent.address,
      latitude:    selectedAgent.lat?.toString() ?? "",
      longitude:   selectedAgent.lng?.toString() ?? "",
    }));
  }, [selectedAgent]);

  useEffect(() => {
    if (form.hasDevices !== "true" && form.services.length > 0)
      setForm(p => ({ ...p, services: [] }));
  }, [form.hasDevices, form.services.length]);

  const scores       = calcScores(form);
  const serviceScore = getServiceScore(form.services);
  const isDealerChannel = form.activityType === "agent_main" || form.activityType === "agent_sub";

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

  const toggleService = useCallback((s: string) => {
    setForm(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        agentName: form.agentName, city: form.city, activityType: form.activityType,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        hasSignboard: form.hasSignboard === "true",
        hasDevices: form.hasDevices === "true",
        internetQuality: form.internetQuality, staffReadiness: parseInt(form.staffReadiness),
        areaTraffic: form.areaTraffic, documentsComplete: form.documentsComplete === "true",
        brandIdentityCompliant: form.brandIdentityCompliant === "true",
        services: form.services, notes: form.notes,
        scores: { readiness: scores.readiness, sales: scores.sales, compliance: scores.compliance, final: scores.final },
      };
      const res = await fetch(`${API_BASE}/agent-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 4000); }
    } finally { setSaving(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left column */}
      <div className="space-y-4">
        {/* Agent selector */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">اختر الوكيل</label>
          <AgentSelector selected={selectedAgent} onSelect={a => setSelectedAgent(a)} />
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">بيانات الوكيل</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-xl border border-gray-200 p-3 text-sm" value={form.agentName} onChange={e => setForm(p => ({ ...p, agentName: e.target.value }))} placeholder="اسم الوكيل" />
            <input className="rounded-xl border border-gray-200 p-3 text-sm" value={form.mobile}    onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))}    placeholder="رقم الجوال" />
            <input className="rounded-xl border border-gray-200 p-3 text-sm" value={form.agentEmail} onChange={e => setForm(p => ({ ...p, agentEmail: e.target.value }))} placeholder="البريد الإلكتروني" />
            <input className="rounded-xl border border-gray-200 p-3 text-sm" value={form.city}      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}      placeholder="المدينة" />
            <select className="rounded-xl border border-gray-200 p-3 text-sm" value={form.activityType} onChange={e => setForm(p => ({ ...p, activityType: e.target.value }))}>
              {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input className="rounded-xl border border-gray-200 p-3 text-sm md:col-span-1" value={form.fullAddress} onChange={e => setForm(p => ({ ...p, fullAddress: e.target.value }))} placeholder="العنوان" />
          </div>
        </div>

        {/* License / readiness */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">{isDealerChannel ? "التراخيص والجاهزية" : "القناة والخدمات"}</h2>
          {isDealerChannel ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <select className="rounded-xl border border-gray-200 p-3 text-sm" value={form.documentsComplete} onChange={e => setForm(p => ({ ...p, documentsComplete: e.target.value }))}>
                  <option value="true">الوثائق مكتملة</option>
                  <option value="false">الوثائق ناقصة</option>
                </select>
                <select className="rounded-xl border border-gray-200 p-3 text-sm" value={form.brandIdentityCompliant} onChange={e => setForm(p => ({ ...p, brandIdentityCompliant: e.target.value }))}>
                  <option value="true">الهوية التجارية متوافقة</option>
                  <option value="false">الهوية التجارية غير متوافقة</option>
                </select>
                <select className="rounded-xl border border-gray-200 p-3 text-sm" value={form.hasSignboard} onChange={e => setForm(p => ({ ...p, hasSignboard: e.target.value }))}>
                  <option value="true">يوجد لافتة</option>
                  <option value="false">لا توجد لافتة</option>
                </select>
                <select className="rounded-xl border border-gray-200 p-3 text-sm" value={form.hasDevices} onChange={e => setForm(p => ({ ...p, hasDevices: e.target.value }))}>
                  <option value="true">الأجهزة متوفرة</option>
                  <option value="false">الأجهزة غير متوفرة</option>
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {SERVICES_AVAILABLE.map(s => (
                  <label key={s.value} className="flex items-center gap-2 rounded-xl border border-gray-200 p-3 text-sm cursor-pointer hover:bg-orange-50">
                    <input type="checkbox" checked={form.services.includes(s.value)} disabled={form.hasDevices !== "true"} onChange={() => toggleService(s.value)} />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.locationDescription}
              onChange={e => setForm(p => ({ ...p, locationDescription: e.target.value }))} placeholder="وصف القناة / الفرع" />
          )}
        </div>

        {/* Operational */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">الجاهزية التشغيلية</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">جودة الإنترنت</label>
              <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.internetQuality} onChange={e => setForm(p => ({ ...p, internetQuality: e.target.value }))}>
                <option value="good">جيدة</option>
                <option value="medium">متوسطة</option>
                <option value="weak">ضعيفة</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">حركة المنطقة التجارية</label>
              <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.areaTraffic} onChange={e => setForm(p => ({ ...p, areaTraffic: e.target.value }))}>
                <option value="high">مرتفعة</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">جاهزية الموظفين (1–5)</label>
              <input type="range" min="1" max="5" className="w-full" value={form.staffReadiness}
                onChange={e => setForm(p => ({ ...p, staffReadiness: e.target.value }))} />
              <div className="text-center text-sm font-bold text-orange-600">{form.staffReadiness}/5</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">منافسون في المدينة</label>
              <input type="number" min="0" className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                value={form.marketDensitySameCity} onChange={e => setForm(p => ({ ...p, marketDensitySameCity: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">منافسون في الشارع</label>
              <input type="number" min="0" className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                value={form.marketDensitySameStreet} onChange={e => setForm(p => ({ ...p, marketDensitySameStreet: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">حجم معاملات ADSL / شهر</label>
              <input type="number" min="0" className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                value={form.transactionVolumeAdsl} onChange={e => setForm(p => ({ ...p, transactionVolumeAdsl: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">حجم معاملات 4G / شهر</label>
              <input type="number" min="0" className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                value={form.transactionVolume4g} onChange={e => setForm(p => ({ ...p, transactionVolume4g: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-2">ملاحظات</h2>
          <textarea className="w-full rounded-xl border border-gray-200 p-3 text-sm min-h-28"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="أي ملاحظات إضافية..." />
        </div>

        {/* Save button */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <button type="button" onClick={handleSave} disabled={saving}
            className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 transition-colors disabled:opacity-60">
            {saving ? "جارٍ الحفظ…" : saved ? "✓ تم الحفظ بنجاح" : "حفظ التفتيش"}
          </button>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Map */}
        <MapPanel lat={form.latitude} lng={form.longitude}
          onChange={(la, ln) => setForm(p => ({ ...p, latitude: la, longitude: ln }))} />

        {/* Scores */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">التقييم</h2>
          <div className="space-y-3">
            <ScoreBar label="الجاهزية"  value={scores.readiness}  color="bg-blue-500" />
            <ScoreBar label="المبيعات"  value={scores.sales}      color="bg-emerald-500" />
            <ScoreBar label="الالتزام"  value={scores.compliance} color="bg-orange-500" />
            <ScoreBar label="النهائي"   value={scores.final}      color="bg-purple-500" />
            <ScoreBar label="الخدمات"   value={serviceScore}      color="bg-indigo-500" />
          </div>
          <div className="mt-4 rounded-xl bg-purple-50 border border-purple-200 p-3 text-center">
            <div className="text-2xl font-black text-purple-700">{scores.final}</div>
            <div className="text-xs text-purple-500">النقاط الإجمالية</div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">المرفقات</h2>
          {PHOTO_CATS.map(cat => (
            <PhotoUploadSection key={cat.key} cat={cat}
              files={photos[cat.key]} previews={photoPreviews[cat.key]}
              onAdd={files => handleAddPhotos(cat.key, files)}
              onRemove={i => handleRemovePhoto(cat.key, i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODE 2 — Create new agent
// ═══════════════════════════════════════════════════════════════════════════════

function NewAgentMode() {
  const [form, setForm] = useState<NewAgentFormData>({
    name:            "",
    phone:           "",
    email:           "",
    city:            "",
    address:         "",
    channelType:     "agent_main",
    latitude:        "",
    longitude:       "",
    internetQuality: "good",
    hasSignboard:    "true",
    hasDevices:      "true",
    staffReadiness:  "3",
    areaTraffic:     "medium",
    services:        [],
    notes:           "",
  });

  const [photos, setPhotos]             = useState<PhotoState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviewState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [docUploads, setDocUploads]      = useState<DocUpload[]>(DOC_TYPES.map(d => ({ docType: d.value, file: null, notes: "" })));
  const [saving, setSaving]             = useState(false);
  const [result, setResult]             = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (form.hasDevices !== "true" && form.services.length > 0)
      setForm(p => ({ ...p, services: [] }));
  }, [form.hasDevices, form.services.length]);

  const toggleService = (s: string) => {
    setForm(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));
  };

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

  const serviceScore = getServiceScore(form.services);

  const handleSave = async () => {
    if (!form.name.trim()) { setResult({ ok: false, msg: "يرجى إدخال اسم الوكيل" }); return; }
    setSaving(true);
    setResult(null);
    try {
      const body = {
        name:     form.name,
        location: form.city || "غير محدد",
        city:     form.city   || null,
        address:  form.address || null,
        phone:    form.phone  || null,
        email:    form.email  || null,
        type:     "dealer",
        status:   "active",
        latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        notes:    form.notes || null,
      };
      const res = await fetch(`${API_BASE}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setResult({ ok: false, msg: (err as { error?: string }).error ?? "حدث خطأ عند الحفظ" });
        return;
      }
      const agent = await res.json() as { id: number };

      // Upload documents if provided
      for (const doc of docUploads) {
        if (!doc.file) continue;
        const fd = new FormData();
        fd.append("agentId", String(agent.id));
        fd.append("docType", doc.docType);
        fd.append("notes",   doc.notes);
        fd.append("file",    doc.file);
        await fetch(`${API_BASE}/documents`, { method: "POST", body: fd }).catch(() => null);
      }

      setResult({ ok: true, msg: `✓ تم إنشاء الوكيل بنجاح (رقم ${agent.id})` });
      // Reset form
      setForm({ name:"",phone:"",email:"",city:"",address:"",channelType:"agent_main",latitude:"",longitude:"",internetQuality:"good",hasSignboard:"true",hasDevices:"true",staffReadiness:"3",areaTraffic:"medium",services:[],notes:"" });
      setDocUploads(DOC_TYPES.map(d => ({ docType: d.value, file: null, notes: "" })));
      setPhotos({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
      setPhotoPreviews({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
    } finally { setSaving(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left column */}
      <div className="space-y-4">
        {/* Contact info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">👤 بيانات التواصل</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">اسم الوكيل <span className="text-red-500">*</span></label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-orange-400 focus:outline-none" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم الكامل للوكيل" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">رقم الجوال</label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="09XXXXXXXX" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">البريد الإلكتروني</label>
              <input type="email" className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@domain.com" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">🏠 العنوان</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">المدينة</label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="طرابلس / الزاوية / مصراتة…" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">نوع القناة</label>
              <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.channelType}
                onChange={e => setForm(p => ({ ...p, channelType: e.target.value }))}>
                {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">العنوان التفصيلي</label>
              <input className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="الشارع، الحي، رقم المبنى" />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">📶 الخدمات المقدمة</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">توافر الأجهزة</label>
              <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.hasDevices}
                onChange={e => setForm(p => ({ ...p, hasDevices: e.target.value }))}>
                <option value="true">الأجهزة متوفرة</option>
                <option value="false">الأجهزة غير متوفرة</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">اللافتة التجارية</label>
              <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.hasSignboard}
                onChange={e => setForm(p => ({ ...p, hasSignboard: e.target.value }))}>
                <option value="true">يوجد لافتة</option>
                <option value="false">لا توجد لافتة</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {SERVICES_AVAILABLE.map(s => (
              <label key={s.value} className={`flex items-center gap-2 rounded-xl border p-3 text-sm cursor-pointer transition-colors ${form.services.includes(s.value) ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:bg-gray-50"} ${form.hasDevices !== "true" ? "opacity-40 cursor-not-allowed" : ""}`}>
                <input type="checkbox" checked={form.services.includes(s.value)} disabled={form.hasDevices !== "true"}
                  onChange={() => toggleService(s.value)} />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 flex items-center justify-between">
            <span className="text-sm text-indigo-700 font-medium">نقاط الخدمات</span>
            <span className="font-black text-indigo-700 text-lg">{serviceScore}/100</span>
          </div>
        </div>

        {/* Operational readiness */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">⚡ الجاهزية التشغيلية</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">جودة الإنترنت</label>
              <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.internetQuality}
                onChange={e => setForm(p => ({ ...p, internetQuality: e.target.value }))}>
                <option value="good">جيدة</option>
                <option value="medium">متوسطة</option>
                <option value="weak">ضعيفة</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">حركة المنطقة التجارية</label>
              <select className="w-full rounded-xl border border-gray-200 p-3 text-sm" value={form.areaTraffic}
                onChange={e => setForm(p => ({ ...p, areaTraffic: e.target.value }))}>
                <option value="high">مرتفعة</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">جاهزية الموظفين (1–5)</label>
              <input type="range" min="1" max="5" className="w-full accent-orange-500" value={form.staffReadiness}
                onChange={e => setForm(p => ({ ...p, staffReadiness: e.target.value }))} />
              <div className="text-center text-sm font-bold text-orange-600 mt-1">{form.staffReadiness}/5</div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">📄 الوثائق والتراخيص</h2>
          <p className="text-xs text-gray-500">ارفع الوثائق الرسمية للوكيل (PDF أو صورة)</p>
          {docUploads.map((doc, idx) => {
            const typeLabel = DOC_TYPES.find(d => d.value === doc.docType)?.label ?? doc.docType;
            const fileRef = useRef<HTMLInputElement>(null);
            return (
              <div key={doc.docType} className="border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{typeLabel}</span>
                  {doc.file && <span className="text-xs text-green-600 font-medium">✓ {doc.file.name}</span>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex-1 text-center rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors">
                    {doc.file ? "تغيير الملف" : "اختر ملف"}
                  </button>
                  {doc.file && (
                    <button type="button" onClick={() => setDocUploads(prev => prev.map((d, i) => i === idx ? { ...d, file: null } : d))}
                      className="rounded-lg border border-red-200 text-red-500 px-3 text-xs hover:bg-red-50">
                      حذف
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0] ?? null;
                    setDocUploads(prev => prev.map((d, i) => i === idx ? { ...d, file: f } : d));
                  }} />
                <input className="w-full rounded-lg border border-gray-200 p-2 text-xs" value={doc.notes}
                  onChange={e => setDocUploads(prev => prev.map((d, i) => i === idx ? { ...d, notes: e.target.value } : d))}
                  placeholder="ملاحظة اختيارية" />
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-2">ملاحظات إضافية</h2>
          <textarea className="w-full rounded-xl border border-gray-200 p-3 text-sm min-h-24"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="أي معلومات إضافية..." />
        </div>

        {/* Save */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          {result && (
            <div className={`rounded-xl p-3 text-sm font-medium text-center ${result.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {result.msg}
            </div>
          )}
          <button type="button" onClick={handleSave} disabled={saving}
            className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-3 transition-colors disabled:opacity-60">
            {saving ? "جارٍ الحفظ…" : "✚ إنشاء وكيل جديد وحفظ في قاعدة البيانات"}
          </button>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Map */}
        <MapPanel lat={form.latitude} lng={form.longitude}
          onChange={(la, ln) => setForm(p => ({ ...p, latitude: la, longitude: ln }))} />

        {/* Attachments */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">🖼️ الصور والمرفقات</h2>
          {PHOTO_CATS.map(cat => (
            <PhotoUploadSection key={cat.key} cat={cat}
              files={photos[cat.key]} previews={photoPreviews[cat.key]}
              onAdd={files => handleAddPhotos(cat.key, files)}
              onRemove={i => handleRemovePhoto(cat.key, i)} />
          ))}
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">ملخص البيانات</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "الاسم",       val: form.name         || "—" },
              { label: "الجوال",      val: form.phone        || "—" },
              { label: "المدينة",     val: form.city         || "—" },
              { label: "نوع القناة",  val: ACTIVITY_TYPES.find(t => t.value === form.channelType)?.label || "—" },
              { label: "الخدمات",     val: form.services.length ? form.services.join("، ") : "لا توجد" },
              { label: "الموقع",      val: form.latitude && form.longitude ? `${Number(form.latitude).toFixed(4)}, ${Number(form.longitude).toFixed(4)}` : "لم يُحدَّد" },
              { label: "الوثائق",     val: `${docUploads.filter(d => d.file).length} / ${DOC_TYPES.length} مرفوعة` },
            ].map(r => (
              <div key={r.label} className="flex justify-between border-b border-gray-50 pb-1">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-medium text-gray-800 text-left max-w-[55%] break-words">{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — Mode selector
// ═══════════════════════════════════════════════════════════════════════════════

type Mode = "inspection" | "new_agent";

export default function AgentRequestForm() {
  const [mode, setMode] = useState<Mode>("inspection");

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h1 className="text-2xl font-black text-gray-900">التفتيش على الوكلاء</h1>
          <p className="mt-1 text-sm text-gray-500">نظام LTT لمتابعة الوكلاء — المنطقة الغربية</p>
        </div>

        {/* Mode selector */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">اختر نوع العملية:</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setMode("inspection")}
              className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all ${mode === "inspection" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
              <div className="text-2xl mb-1">🔍</div>
              <div>تفتيش على وكيل قائم</div>
              <div className="text-xs font-normal text-gray-400 mt-1">تقييم وكيل موجود في النظام</div>
            </button>
            <button type="button" onClick={() => setMode("new_agent")}
              className={`rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all ${mode === "new_agent" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
              <div className="text-2xl mb-1">✚</div>
              <div>إنشاء وكيل جديد</div>
              <div className="text-xs font-normal text-gray-400 mt-1">تسجيل وكيل جديد في قاعدة البيانات</div>
            </button>
          </div>
        </div>

        {/* Active mode */}
        {mode === "inspection" ? <InspectionMode /> : <NewAgentMode />}
      </div>
    </div>
  );
}
