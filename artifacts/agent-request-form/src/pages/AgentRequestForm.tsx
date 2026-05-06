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

export const SERVICES_AVAILABLE = [
  { value: "4G", label: "4G" },
  { value: "FWA", label: "FWA" },
  { value: "ADSL", label: "ADSL" },
  { value: "FTTH", label: "FTTH" },
  { value: "eSIM", label: "eSIM" },
  { value: "FIXD_VOLTE", label: "FIXD VoLTE" },
  { value: "RECHARGE", label: "Recharge" },
];

type FormData = {
  representativeName: string;
  representativeEmail: string;
  agentName: string;
  mobile: string;
  landline: string;
  agentEmail: string;
  city: string;
  fullAddress: string;
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

function calcScores(f: FormData): Scores {
  let readiness = 0;
  if (f.hasSignboard === "true") readiness += 25;
  if (f.hasDevices === "true") readiness += 25;
  if (f.internetQuality === "good") readiness += 30;
  else if (f.internetQuality === "medium") readiness += 15;
  readiness += Math.round((parseInt(f.staffReadiness || "3") / 5) * 20);
  readiness = Math.min(100, readiness);

  let sales = 0;
  if (f.areaTraffic === "high") sales += 40;
  else if (f.areaTraffic === "medium") sales += 25;
  else sales += 10;
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
  return <div />;
}
