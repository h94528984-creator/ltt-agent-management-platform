import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { AGENTS, type AgentEntry } from "../data/agentsList";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const REPRESENTATIVES = [
  { name: "Yazeed Rahuma",     email: "y.rahuma@ltt.ly" },
  { name: "Abdul Momen Zober", email: "a.zober@ltt.ly" },
  { name: "Ahmed Esaa",        email: "a.esaa@ltt.ly" },
  { name: "Esra Abugriss",     email: "e.abugriss@ltt.ly" },
  { name: "Fadel Elgherwi",    email: "f.elgherwi@ltt.ly" },
  { name: "Feras Bashir",      email: "f.bashir@ltt.ly" },
  { name: "Hassan Joma",       email: "h.joma@ltt.ly" },
  { name: "Jalal Khalifa",     email: "j.khalifa@ltt.ly" },
  { name: "Jamal Oun",         email: "j.oun@ltt.ly" },
  { name: "Milad Kashoun",     email: "m.kashoun@ltt.ly" },
  { name: "Moad Alamory",      email: "m.alamory@ltt.ly" },
  { name: "Mohamed Adel",      email: "m.adel@ltt.ly" },
  { name: "Mohamed Doban",     email: "m.doban@ltt.ly" },
  { name: "Mohamed Eshtiewi",  email: "m.eshtiewi@ltt.ly" },
  { name: "Mohamed Jarallah",  email: "m.jarallah@ltt.ly" },
  { name: "Mohammed Butota",   email: "m.butota@ltt.ly" },
  { name: "Munir Kosha",       email: "m.kosha@ltt.ly" },
  { name: "Nabil Almeshri",    email: "n.almeshri@ltt.ly" },
  { name: "Seraj Zawia",       email: "s.zawia@ltt.ly" },
];

const ACTIVITY_TYPES = [
  { value: "agent_main", label: "وكيل رئيسي" },
  { value: "agent_sub", label: "وكيل فرعي" },
  { value: "service_center", label: "مركز خدمات" },
  { value: "fixed_pos", label: "نقطة بيع ثابتة" },
  { value: "mobile_van", label: "سيارة بيع وخدمات متنقلة" },
  { value: "peddler", label: "بائع متجول" },
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

type FormData = {
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

type Scores = { readiness: number; sales: number; compliance: number; final: number };
type SubmitResult = { requestId: string; finalScore: number; data: FormData; scores: Scores; agentEntry: AgentEntry | null };

type PhotoCatKey = "sitePhotos" | "interiorPhotos" | "equipmentPhotos";
type PhotoCategory = { key: PhotoCatKey; label: string; icon: string };
const PHOTO_CATS: PhotoCategory[] = [
  { key: "sitePhotos", label: "صور الموقع الخارجي / اللافتة", icon: "🏪" },
  { key: "interiorPhotos", label: "صور الداخل", icon: "🏠" },
  { key: "equipmentPhotos", label: "صور الأجهزة والمعدات", icon: "🖥️" },
];

type PhotoState = Record<PhotoCatKey, File[]>;
type PhotoPreviewState = Record<PhotoCatKey, string[]>;

function calcScores(f: FormData): Scores {
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
  const cityCompetitors = parseInt(f.marketDensitySameCity || "0");
  if (cityCompetitors === 0) sales += 20;
  else if (cityCompetitors === 1) sales += 16;
  else if (cityCompetitors === 2) sales += 12;
  else if (cityCompetitors <= 4) sales += 8;
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
  else if (totalTx >= 50) sales += 8;
  else sales += 3;
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
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
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
              {src.startsWith("data:image") ? (
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search.trim().length < 1
    ? AGENTS
    : AGENTS.filter(a =>
        a.name.includes(search) ||
        a.city.includes(search) ||
        a.phone.includes(search) ||
        String(a.id).includes(search)
      );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-right flex items-center justify-between hover:border-orange-400 transition-colors focus:outline-none focus:border-orange-500 bg-white">
        {selected ? (
          <div className="text-right">
            <div className="font-bold text-gray-900 text-sm">{selected.name}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
              {selected.city && <span>📍 {selected.city}</span>}
              {selected.phone && <span>📞 {selected.phone}</span>}
              {selected.lat !== null && <span className="text-green-600">✓ إحداثيات متوفرة</span>}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">— ابحث أو اختر الوكيل —</span>
        )}
        <span className="text-gray-400 mr-2">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full bg-white border-2 border-orange-300 rounded-xl shadow-2xl mt-1 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input autoFocus
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المدينة أو الرقم"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.map(a => (
              <button key={a.id} type="button" onClick={() => { onSelect(a); setOpen(false); }}
                className="w-full text-right px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0">
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

export default function AgentRequestForm() {
  const [selectedAgent, setSelectedAgent] = useState<AgentEntry | null>(AGENTS[0] ?? null);
  const [form, setForm] = useState<FormData>({
    agentName: AGENTS[0]?.name ?? "",
    agentEmail: AGENTS[0]?.email ?? "",
    city: AGENTS[0]?.city ?? "",
    fullAddress: AGENTS[0]?.address ?? "",
    mobile: AGENTS[0]?.phone ?? "",
    landline: "",
    activityType: ACTIVITY_TYPES[0]?.value ?? "",
    latitude: AGENTS[0]?.lat?.toString() ?? "",
    longitude: AGENTS[0]?.lng?.toString() ?? "",
    locationDescription: "",
    hasSignboard: "true",
    hasDevices: "true",
    internetQuality: "good",
    staffReadiness: "3",
    areaTraffic: "medium",
    marketDensitySameCity: "0",
    marketDensitySameStreet: "0",
    transactionVolumeAdsl: "0",
    transactionVolume4g: "0",
    documentsComplete: "true",
    brandIdentityCompliant: "true",
    notes: "",
    services: [],
  });
  const [photos, setPhotos] = useState<PhotoState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviewState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });

  useEffect(() => {
    if (!selectedAgent) return;
    setForm((prev) => ({
      ...prev,
      agentName: selectedAgent.name,
      mobile: selectedAgent.phone,
      agentEmail: selectedAgent.email,
      city: selectedAgent.city,
      fullAddress: selectedAgent.address,
      latitude: selectedAgent.lat?.toString() ?? "",
      longitude: selectedAgent.lng?.toString() ?? "",
    }));
  }, [selectedAgent]);

  const scores = calcScores(form);
  const serviceScore = getServiceScore(form.services);
  const isDealerChannel = form.activityType === "agent_main" || form.activityType === "agent_sub";

  const handleAddPhotos = useCallback((key: PhotoCatKey, list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).slice(0, 5);
    setPhotos((prev) => ({ ...prev, [key]: next }));
    setPhotoPreviews((prev) => ({
      ...prev,
      [key]: next.map((file) => file.type.startsWith("image/") ? URL.createObjectURL(file) : file.name),
    }));
  }, []);

  const toggleService = useCallback((service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((item) => item !== service)
        : [...prev.services, service],
    }));
  }, []);

  const handleRemovePhoto = useCallback((key: PhotoCatKey, index: number) => {
    setPhotos((prev) => {
      const next = prev[key].filter((_, i) => i !== index);
      setPhotoPreviews((p) => ({ ...p, [key]: next.map((file) => file.type.startsWith("image/") ? URL.createObjectURL(file) : file.name) }));
      return { ...prev, [key]: next };
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">التفتيش على الوكلاء</h1>
          <p className="mt-1 text-sm text-gray-500">اختر وكيلاً من القائمة ثم أكمل بيانات التفتيش.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوكيل</label>
              <AgentSelector
                selected={selectedAgent}
                onSelect={(a) => {
                  setSelectedAgent(a);
                  setForm((prev) => ({ ...prev, agentName: a.name, mobile: a.phone, agentEmail: a.email, city: a.city, fullAddress: a.address }));
                }}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input className="w-full rounded-xl border border-gray-200 p-3" value={form.agentName} onChange={(e) => setForm({ ...form, agentName: e.target.value })} placeholder="اسم الوكيل" />
                <input className="w-full rounded-xl border border-gray-200 p-3" value={form.agentEmail} onChange={(e) => setForm({ ...form, agentEmail: e.target.value })} placeholder="بريد الوكيل" />
                <input className="w-full rounded-xl border border-gray-200 p-3" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="الهاتف" />
                <input className="w-full rounded-xl border border-gray-200 p-3" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="مكان الوكيل / المدينة" />
                <select className="w-full rounded-xl border border-gray-200 p-3" value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })}>
                  {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">{isDealerChannel ? "التراخيص والجاهزية" : "القناة والخدمات"}</h2>
              {isDealerChannel ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <select className="w-full rounded-xl border border-gray-200 p-3" value={form.documentsComplete} onChange={(e) => setForm({ ...form, documentsComplete: e.target.value })}>
                      <option value="true">الوثائق مكتملة</option>
                      <option value="false">الوثائق ناقصة</option>
                    </select>
                    <select className="w-full rounded-xl border border-gray-200 p-3" value={form.brandIdentityCompliant} onChange={(e) => setForm({ ...form, brandIdentityCompliant: e.target.value })}>
                      <option value="true">الهوية التجارية متوافقة</option>
                      <option value="false">الهوية التجارية غير متوافقة</option>
                    </select>
                    <select className="w-full rounded-xl border border-gray-200 p-3" value={form.hasSignboard} onChange={(e) => setForm({ ...form, hasSignboard: e.target.value })}>
                      <option value="true">يوجد لافتة</option>
                      <option value="false">لا توجد لافتة</option>
                    </select>
                    <select className="w-full rounded-xl border border-gray-200 p-3" value={form.hasDevices} onChange={(e) => setForm({ ...form, hasDevices: e.target.value })}>
                      <option value="true">الأجهزة متوفرة</option>
                      <option value="false">الأجهزة غير متوفرة</option>
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className="w-full rounded-xl border border-gray-200 p-3" value={form.fullAddress} onChange={(e) => setForm({ ...form, fullAddress: e.target.value })} placeholder="العنوان الكامل" />
                    <input className="w-full rounded-xl border border-gray-200 p-3" value={form.locationDescription} onChange={(e) => setForm({ ...form, locationDescription: e.target.value })} placeholder="وصف القناة / الفرع" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {SERVICES_AVAILABLE.map((s) => (
                      <label key={s.value} className="flex items-center gap-2 rounded-xl border border-gray-200 p-3">
                        <input type="checkbox" checked={form.services.includes(s.value)} onChange={() => toggleService(s.value)} />
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="w-full rounded-xl border border-gray-200 p-3" value={form.fullAddress} onChange={(e) => setForm({ ...form, fullAddress: e.target.value })} placeholder="العنوان الكامل" />
                  <input className="w-full rounded-xl border border-gray-200 p-3" value={form.locationDescription} onChange={(e) => setForm({ ...form, locationDescription: e.target.value })} placeholder="وصف القناة / الفرع" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">إرسال/تصدير</h2>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-xl bg-black text-white px-4 py-3">حفظ التفتيش</button>
                <button type="button" className="rounded-xl border border-gray-200 px-4 py-3">تصدير PDF</button>
                <button type="button" className="rounded-xl border border-gray-200 px-4 py-3">تصدير Excel</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">التقييم</h2>
              <div className="space-y-3">
                <ScoreBar label="الجاهزية" value={scores.readiness} color="bg-blue-500" />
                <ScoreBar label="المبيعات" value={scores.sales} color="bg-emerald-500" />
                <ScoreBar label="الالتزام" value={scores.compliance} color="bg-orange-500" />
                <ScoreBar label="النهائي" value={scores.final} color="bg-purple-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">الموقع الجغرافي</h2>
              <div className="h-80 rounded-xl overflow-hidden border border-gray-200">
                <MapContainer center={[32.8872, 13.1913]} zoom={6} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapPicker onPick={(lat, lng) => setForm((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }))} />
                  {form.latitude && form.longitude && <Marker position={[Number(form.latitude), Number(form.longitude)]} />}
                </MapContainer>
              </div>
              <div className="grid gap-3 md:grid-cols-2 mt-4">
                <input className="w-full rounded-xl border border-gray-200 p-3" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="خط العرض" />
                <input className="w-full rounded-xl border border-gray-200 p-3" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="خط الطول" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">ملاحظات</h2>
              <textarea className="w-full rounded-xl border border-gray-200 p-3 min-h-32" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">تقييم نوع الخدمات</h2>
              <ScoreBar label="الخدمات" value={serviceScore} color="bg-indigo-500" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">المرفقات</h2>
              {PHOTO_CATS.map((cat) => (
                <PhotoUploadSection
                  key={cat.key}
                  cat={cat}
                  files={photos[cat.key]}
                  previews={photoPreviews[cat.key]}
                  onAdd={(files) => handleAddPhotos(cat.key, files)}
                  onRemove={(i) => handleRemovePhoto(cat.key, i)}
                />
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">الموقع والجاهزية التشغيلية</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <select className="w-full rounded-xl border border-gray-200 p-3" value={form.internetQuality} onChange={(e) => setForm({ ...form, internetQuality: e.target.value })}>
                  <option value="good">جيد</option>
                  <option value="medium">متوسط</option>
                  <option value="weak">ضعيف</option>
                </select>
                <select className="w-full rounded-xl border border-gray-200 p-3" value={form.areaTraffic} onChange={(e) => setForm({ ...form, areaTraffic: e.target.value })}>
                  <option value="high">حركة المنطقة التجارية مرتفعة</option>
                  <option value="medium">حركة المنطقة التجارية متوسطة</option>
                  <option value="low">حركة المنطقة التجارية منخفضة</option>
                </select>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">عدد الوكلاء في نفس المدينة</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-gray-200 p-3"
                    value={form.marketDensitySameCity}
                    onChange={(e) => setForm({ ...form, marketDensitySameCity: e.target.value })}
                    placeholder="أدخل العدد"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">عدد المنافسين في نفس الشارع</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-gray-200 p-3"
                    value={form.marketDensitySameStreet}
                    onChange={(e) => setForm({ ...form, marketDensitySameStreet: e.target.value })}
                    placeholder="أدخل العدد"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
