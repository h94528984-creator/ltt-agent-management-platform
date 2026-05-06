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
  { value: "agent_main",   label: "وكيل رئيسي" },
  { value: "agent_sub",    label: "وكيل فرعي" },
  { value: "pos_adsl",     label: "نقطة بيع ADSL" },
  { value: "pos_4g",       label: "نقطة بيع 4G" },
  { value: "pos_adsl_4g",  label: "نقطة بيع ADSL/4G" },
  { value: "center_agent", label: "وكيل مركز" },
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
  { key: "sitePhotos",      label: "صور الموقع الخارجي / اللافتة", icon: "🏪" },
  { key: "interiorPhotos",  label: "صور الداخل",                    icon: "🏠" },
  { key: "equipmentPhotos", label: "صور الأجهزة والمعدات",          icon: "🖥️" },
];

function calcScores(f: FormData): Scores {
  let readiness = 0;
  if (f.hasSignboard === "true") readiness += 25;
  if (f.hasDevices === "true")   readiness += 25;
  if (f.internetQuality === "good")        readiness += 30;
  else if (f.internetQuality === "medium") readiness += 15;
  readiness += Math.round((parseInt(f.staffReadiness || "3") / 5) * 20);
  readiness = Math.min(100, readiness);

  let sales = 0;
  if (f.areaTraffic === "high")        sales += 40;
  else if (f.areaTraffic === "medium") sales += 25;
  else                                  sales += 10;
  const street = parseInt(f.marketDensitySameStreet || "0");
  if (street === 0)      sales += 30;
  else if (street === 1) sales += 22;
  else if (street === 2) sales += 15;
  else if (street <= 4)  sales += 8;
  else                   sales += 3;
  const totalTx = (parseInt(f.transactionVolumeAdsl || "0")) + (parseInt(f.transactionVolume4g || "0"));
  if (totalTx >= 1000)     sales += 30;
  else if (totalTx >= 500) sales += 22;
  else if (totalTx >= 200) sales += 15;
  else if (totalTx >= 50)  sales += 8;
  else                      sales += 3;
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              placeholder="🔍  ابحث بالاسم أو المدينة أو رقم الهاتف…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1 text-center">{filtered.length} وكيل</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map(a => (
              <button key={a.id} type="button"
                onClick={() => { onSelect(a); setOpen(false); setSearch(""); }}
                className={`w-full text-right px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 ${selected?.id === a.id ? "bg-orange-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{a.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      {a.city && <span>📍 {a.city}</span>}
                      {a.phone && <span>📞 {a.phone}</span>}
                      {a.lat !== null && <span className="text-green-600 font-medium">📌 GPS</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-300 flex-shrink-0 mt-1">#{a.id}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">لا توجد نتائج</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SuccessScreen({ result, onReset }: { result: SubmitResult; onReset: () => void }) {
  const scoreColor = result.scores.final >= 80 ? "text-green-600" : result.scores.final >= 60 ? "text-yellow-600" : "text-red-600";
  const classification =
    result.scores.final >= 80 ? "أداء ممتاز ✅" :
    result.scores.final >= 60 ? "أداء جيد — يحتاج متابعة ⚠️" : "أداء ضعيف — تدخل فوري مطلوب ❌";
  const activityLabel = ACTIVITY_TYPES.find(a => a.value === result.data.activityType)?.label ?? result.data.activityType;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `*تقرير جولة تفتيشية — LTT المنطقة الغربية*\n` +
      `رقم التقرير: ${result.requestId}\n` +
      `المفتش: ${result.data.representativeName}\n` +
      `الوكيل: ${result.data.agentName}\n` +
      `الجوال: ${result.data.mobile}\n` +
      `المدينة: ${result.data.city}\n` +
      (result.data.fullAddress ? `العنوان: ${result.data.fullAddress}\n` : "") +
      `نوع النشاط: ${activityLabel}\n` +
      `التقييم: ${result.scores.final}/100 — ${classification}\n` +
      (result.data.latitude ? `الموقع: https://maps.google.com/?q=${result.data.latitude},${result.data.longitude}` : "")
    );
    window.open(`https://wa.me/00218912444808?text=${msg}`, "_blank");
  };

  const handleExcelExport = () => {
    const d = result.data; const s = result.scores;
    const ws = XLSX.utils.json_to_sheet([{
      "رقم التقرير": result.requestId,
      "التاريخ": new Date().toLocaleDateString("ar-LY"),
      "اسم المفتش": d.representativeName,
      "اسم الوكيل": d.agentName,
      "الجوال": d.mobile,
      "الهاتف الثابت": d.landline || "—",
      "البريد الإلكتروني": d.agentEmail || "—",
      "المدينة": d.city,
      "العنوان الكامل": d.fullAddress || "—",
      "نوع النشاط": activityLabel,
      "الإحداثيات": d.latitude ? `${d.latitude}, ${d.longitude}` : "—",
      "لافتة LTT": d.hasSignboard === "true" ? "نعم" : "لا",
      "أجهزة وحاسوب": d.hasDevices === "true" ? "نعم" : "لا",
      "جودة الإنترنت": d.internetQuality,
      "جاهزية الموظفين": `${d.staffReadiness}/5`,
      "حركة المنطقة": d.areaTraffic,
      "منافسون في المدينة": d.marketDensitySameCity,
      "منافسون في الشارع": d.marketDensitySameStreet,
      "معاملات ADSL شهرياً": d.transactionVolumeAdsl,
      "معاملات 4G شهرياً": d.transactionVolume4g,
      "مستندات مكتملة": d.documentsComplete === "true" ? "نعم" : "لا",
      "الهوية البصرية LTT": d.brandIdentityCompliant === "true" ? "نعم" : "لا",
      "درجة الجاهزية (40%)": s.readiness,
      "درجة السوق (35%)": s.sales,
      "درجة الامتثال (25%)": s.compliance,
      "التقييم النهائي": s.final,
      "التصنيف": classification,
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير التفتيش");
    XLSX.writeFile(wb, `LTT_Inspection_${result.requestId}.xlsx`);
  };

  const handlePdfExport = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const d = result.data; const s = result.scores;
    doc.setFillColor(26, 54, 112);
    doc.rect(0, 0, 210, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Libya Telecom & Technology", 105, 12, { align: "center" });
    doc.setFontSize(11);
    doc.text("Field Inspection Report — Western Region", 105, 21, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Report: ${result.requestId}   |   Date: ${new Date().toLocaleDateString()}`, 105, 29, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const rows: [string, string][] = [
      ["Inspector (LTT)", d.representativeName],
      ["Agent / Shop Name", d.agentName],
      ["Mobile", d.mobile],
      ["Landline", d.landline || "—"],
      ["Agent Email", d.agentEmail || "—"],
      ["City", d.city],
      ["Full Address", d.fullAddress || "—"],
      ["Activity Type", activityLabel],
      ["GPS", d.latitude ? `${parseFloat(d.latitude).toFixed(5)}, ${parseFloat(d.longitude).toFixed(5)}` : "N/A"],
      ["LTT Signboard", d.hasSignboard === "true" ? "Present" : "Missing"],
      ["Devices & Equipment", d.hasDevices === "true" ? "Present" : "Missing"],
      ["Internet Quality", d.internetQuality === "good" ? "Good" : d.internetQuality === "medium" ? "Medium" : "Poor"],
      ["Staff Readiness", `${d.staffReadiness}/5`],
      ["Area Traffic", d.areaTraffic === "high" ? "High" : d.areaTraffic === "medium" ? "Medium" : "Low"],
      ["LTT Competitors — City", d.marketDensitySameCity || "0"],
      ["LTT Competitors — Street", d.marketDensitySameStreet || "0"],
      ["ADSL Transactions / Month", d.transactionVolumeAdsl || "0"],
      ["4G Transactions / Month", d.transactionVolume4g || "0"],
      ["Documents Complete", d.documentsComplete === "true" ? "Yes" : "No"],
      ["Brand Identity Compliant", d.brandIdentityCompliant === "true" ? "Yes" : "No"],
      ["Notes", d.notes || "N/A"],
    ];
    let y = 42;
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold"); doc.text(label + ":", 15, y);
      doc.setFont("helvetica", "normal"); doc.text(String(value), 80, y);
      y += 7;
    });
    y += 3;
    doc.setFillColor(26, 54, 112);
    doc.rect(15, y, 180, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("INSPECTION SCORES", 105, y + 5, { align: "center" });
    doc.setTextColor(0, 0, 0); y += 12;
    [["Operational Readiness (40%)", s.readiness], ["Market Potential (35%)", s.sales], ["Compliance (25%)", s.compliance]].forEach(([lbl, val]) => {
      doc.setFont("helvetica", "normal"); doc.text(String(lbl) + ":", 15, y);
      doc.setFont("helvetica", "bold"); doc.text(`${val}/100`, 180, y, { align: "right" });
      y += 7;
    });
    y += 3;
    doc.setFontSize(12);
    const verdict = s.final >= 80 ? "EXCELLENT" : s.final >= 60 ? "NEEDS FOLLOW-UP" : "IMMEDIATE ACTION REQUIRED";
    doc.setFont("helvetica", "bold");
    doc.text(`FINAL SCORE: ${s.final}/100  —  ${verdict}`, 105, y, { align: "center" });
    doc.save(`LTT_Inspection_${result.requestId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">تم تسجيل نتيجة الجولة التفتيشية</h2>
          <p className="text-gray-500">رقم التقرير: <span className="font-mono font-bold text-blue-700">{result.requestId}</span></p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">ملخص الزيارة</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-right">
            <div><span className="text-gray-500">المفتش: </span><span className="font-semibold">{result.data.representativeName}</span></div>
            <div><span className="text-gray-500">الوكيل: </span><span className="font-semibold">{result.data.agentName}</span></div>
            <div><span className="text-gray-500">الجوال: </span><span className="font-semibold">{result.data.mobile}</span></div>
            <div><span className="text-gray-500">المدينة: </span><span className="font-semibold">{result.data.city}</span></div>
            <div><span className="text-gray-500">النشاط: </span><span className="font-semibold">{activityLabel}</span></div>
            <div><span className="text-gray-500">التاريخ: </span><span className="font-semibold">{new Date().toLocaleDateString("ar-LY")}</span></div>
            {result.data.fullAddress && <div className="col-span-2"><span className="text-gray-500">العنوان: </span><span className="font-semibold">{result.data.fullAddress}</span></div>}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          <div className={`text-center text-5xl font-black ${scoreColor}`}>
            {result.scores.final}<span className="text-2xl text-gray-400">/100</span>
          </div>
          <div className={`text-center text-lg font-bold ${scoreColor}`}>{classification}</div>
          <div className="space-y-3">
            <ScoreBar label="الجاهزية التشغيلية (40%)" value={result.scores.readiness} color="bg-blue-500" />
            <ScoreBar label="إمكانية السوق (35%)"       value={result.scores.sales}     color="bg-orange-500" />
            <ScoreBar label="الامتثال والوثائق (25%)"   value={result.scores.compliance} color="bg-purple-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handlePdfExport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
            📄 تصدير PDF
          </button>
          <button onClick={handleExcelExport}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm">
            📊 تصدير Excel
          </button>
          <button onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.127 1.532 5.866L.053 23.947l6.272-1.464A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 01-5.032-1.382l-.36-.214-3.738.872.939-3.627-.236-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            إرسال واتساب
          </button>
          <button onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm">
            🔍 تفتيش وكيل آخر
          </button>
        </div>

        {result.data.latitude && (
          <a href={`https://maps.google.com/?q=${result.data.latitude},${result.data.longitude}`}
            target="_blank" rel="noopener noreferrer"
            className="block text-center text-blue-600 underline text-sm">
            📍 عرض الموقع على خرائط Google
          </a>
        )}
      </div>
    </div>
  );
}

const EMPTY_FORM: FormData = {
  representativeName: "", representativeEmail: "",
  agentName: "", mobile: "", landline: "", agentEmail: "",
  city: "", fullAddress: "", activityType: "",
  latitude: "", longitude: "", locationDescription: "",
  hasSignboard: "false", hasDevices: "false",
  internetQuality: "medium", staffReadiness: "3",
  areaTraffic: "medium",
  marketDensitySameCity: "0", marketDensitySameStreet: "0",
  transactionVolumeAdsl: "", transactionVolume4g: "",
  documentsComplete: "false", brandIdentityCompliant: "false",
  notes: "",
};

type PhotoState = Record<PhotoCatKey, File[]>;
type PreviewState = Record<PhotoCatKey, string[]>;

export default function AgentRequestForm() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [selectedAgent, setSelectedAgent] = useState<AgentEntry | null>(null);
  const [photos, setPhotos] = useState<PhotoState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [previews, setPreviews] = useState<PreviewState>({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "agentSelect", string>>>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapPos, setMapPos] = useState<[number, number] | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const scores = calcScores(form);
  const set = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleRepresentativeChange = (name: string) => {
    const rep = REPRESENTATIVES.find(r => r.name === name);
    setForm(f => ({ ...f, representativeName: name, representativeEmail: rep?.email ?? "" }));
  };

  const handleAgentSelect = (agent: AgentEntry) => {
    setSelectedAgent(agent);
    setForm(f => ({
      ...f,
      agentName:  agent.name.trim(),
      mobile:     agent.phone || f.mobile,
      agentEmail: agent.email || f.agentEmail,
      city:       agent.city || f.city,
      latitude:   agent.lat !== null ? String(agent.lat) : f.latitude,
      longitude:  agent.lng !== null ? String(agent.lng) : f.longitude,
    }));
    if (agent.lat !== null && agent.lng !== null) {
      setMapPos([agent.lat, agent.lng]);
    }
    setErrors(e => ({ ...e, agentSelect: undefined, agentName: undefined, city: undefined }));
  };

  const handlePhotos = (cat: PhotoCatKey, files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - photos[cat].length;
    const newFiles = Array.from(files).slice(0, remaining)
      .filter(f => f.size <= 5 * 1024 * 1024 && /\.(jpg|jpeg|png|pdf)$/i.test(f.name));
    setPhotos(prev => ({ ...prev, [cat]: [...prev[cat], ...newFiles] }));
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => ({ ...prev, [cat]: [...prev[cat], e.target?.result as string] }));
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (cat: PhotoCatKey, i: number) => {
    setPhotos(prev => ({ ...prev, [cat]: prev[cat].filter((_, idx) => idx !== i) }));
    setPreviews(prev => ({ ...prev, [cat]: prev[cat].filter((_, idx) => idx !== i) }));
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setForm(f => ({ ...f, latitude: lat, longitude: lng }));
        setMapPos([pos.coords.latitude, pos.coords.longitude]);
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleMapPick = useCallback((lat: number, lng: number) => {
    setForm(f => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
    setMapPos([lat, lng]);
  }, []);

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData | "agentSelect", string>> = {};
    if (!form.representativeName) e.representativeName = "مطلوب";
    if (!selectedAgent)           e.agentSelect = "يرجى اختيار الوكيل من القائمة";
    if (!form.agentName)           e.agentName = "مطلوب";
    if (!form.city)                e.city = "مطلوب";
    if (!form.activityType)        e.activityType = "يرجى تحديد نوع النشاط";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.sitePhotos.forEach(f      => fd.append("sitePhotos",      f));
      photos.interiorPhotos.forEach(f  => fd.append("interiorPhotos",  f));
      photos.equipmentPhotos.forEach(f => fd.append("equipmentPhotos", f));
      const res = await fetch("/api/agent-request", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "حدث خطأ" }));
        throw new Error((err as { error?: string }).error);
      }
      const saved = await res.json() as { requestId: string; finalScore: number };
      setSubmitResult({ requestId: saved.requestId, finalScore: saved.finalScore, data: form, scores, agentEntry: selectedAgent });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ في الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitResult(null);
    setSelectedAgent(null);
    setForm(EMPTY_FORM);
    setPhotos({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
    setPreviews({ sitePhotos: [], interiorPhotos: [], equipmentPhotos: [] });
    setMapPos(null);
    setErrors({});
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  if (submitResult) return <SuccessScreen result={submitResult} onReset={handleReset} />;

  const inp  = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-white";
  const lbl  = "block text-sm font-semibold text-gray-700 mb-1";
  const errc = "text-xs text-red-500 mt-1";
  const sec  = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4";
  const stit = "text-base font-bold text-gray-900 mb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <header className="bg-[hsl(220,55%,18%)] text-white py-5 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <div className="text-xs text-orange-300 font-semibold">Libya Telecom & Technology</div>
            <h1 className="text-xl font-black">نموذج تقييم الوكلاء — الجولات التفتيشية</h1>
            <div className="text-xs text-blue-200">المنطقة الغربية — قسم المبيعات بالتجزئة</div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">التقييم الآني</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">ج: <span className="font-bold text-blue-600">{scores.readiness}</span></span>
            <span className="text-xs text-gray-500">س: <span className="font-bold text-orange-600">{scores.sales}</span></span>
            <span className="text-xs text-gray-500">ا: <span className="font-bold text-purple-600">{scores.compliance}</span></span>
            <span className={`text-xl font-black ${scores.final >= 80 ? "text-green-600" : scores.final >= 60 ? "text-yellow-600" : "text-red-600"}`}>
              {scores.final}<span className="text-xs text-gray-400">/100</span>
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Section 1: Inspector + Agent */}
        <div className={sec}>
          <h2 className={stit}>
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">١</span>
            بيانات المفتش والوكيل
          </h2>

          <div>
            <label className={lbl}>اسم المفتش (موظف LTT) *</label>
            <select className={`${inp} ${errors.representativeName ? "border-red-400" : ""}`}
              value={form.representativeName} onChange={e => handleRepresentativeChange(e.target.value)}>
              <option value="">— اختر المفتش —</option>
              {REPRESENTATIVES.map(r => <option key={r.email} value={r.name}>{r.name}</option>)}
            </select>
            {errors.representativeName && <p className={errc}>{errors.representativeName}</p>}
          </div>

          <div>
            <label className={lbl}>اختيار الوكيل *</label>
            <AgentSelector selected={selectedAgent} onSelect={handleAgentSelect} />
            {errors.agentSelect && <p className={errc}>{errors.agentSelect}</p>}
          </div>

          {selectedAgent && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-2">
                <span>📋</span> بيانات الوكيل المسجلة — يمكن تعديلها
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>اسم الوكيل / المحل *</label>
                  <input className={`${inp} ${errors.agentName ? "border-red-400" : ""}`}
                    value={form.agentName} onChange={e => set("agentName", e.target.value)} />
                  {errors.agentName && <p className={errc}>{errors.agentName}</p>}
                </div>
                <div>
                  <label className={lbl}>المدينة *</label>
                  <input className={`${inp} ${errors.city ? "border-red-400" : ""}`}
                    value={form.city} onChange={e => set("city", e.target.value)} />
                  {errors.city && <p className={errc}>{errors.city}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>الجوال</label>
                  <input className={inp} dir="ltr" placeholder="09XXXXXXXX"
                    value={form.mobile} onChange={e => set("mobile", e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>الهاتف الثابت</label>
                  <input className={inp} dir="ltr" placeholder="021XXXXXXX"
                    value={form.landline} onChange={e => set("landline", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>البريد الإلكتروني للوكيل</label>
                <input className={inp} type="email" dir="ltr"
                  value={form.agentEmail} onChange={e => set("agentEmail", e.target.value)} />
              </div>
              <div>
                <label className={lbl}>العنوان التفصيلي</label>
                <input className={inp} placeholder="الحي، الشارع، رقم المحل…"
                  value={form.fullAddress} onChange={e => set("fullAddress", e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className={lbl}>نوع النشاط *</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_TYPES.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => set("activityType", value)}
                  className={`py-2 px-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                    form.activityType === value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:border-orange-300"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {errors.activityType && <p className={errc}>{errors.activityType}</p>}
          </div>
        </div>

        {/* Section 2: Location */}
        <div className={sec}>
          <h2 className={stit}>
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-lg">📍</span>
            الموقع الجغرافي
            {form.latitude && <span className="mr-auto text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ محدد</span>}
          </h2>

          {selectedAgent?.lat !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
              <span>📌</span>
              <span>إحداثيات مسجلة مسبقاً: <strong className="font-mono">{selectedAgent?.lat?.toFixed(5)}, {selectedAgent?.lng?.toFixed(5)}</strong> — يمكن تحديثها</span>
            </div>
          )}

          <button type="button" onClick={handleGPS} disabled={gpsLoading}
            className="w-full py-2.5 border-2 border-dashed border-green-400 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {gpsLoading ? "جاري التحديد…" : "📍 تحديد الموقع الحالي بالـ GPS"}
          </button>

          {form.latitude && (
            <div className="text-xs text-center text-green-700 bg-green-50 rounded-lg p-2 font-mono">
              {form.latitude} , {form.longitude}
              <a href={`https://maps.google.com/?q=${form.latitude},${form.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="block text-blue-600 underline mt-1">عرض على خرائط Google</a>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-2">أو انقر على الخريطة لتحديد / تصحيح الموقع يدوياً</label>
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 240 }}>
              <MapContainer
                center={mapPos ?? [32.9, 13.18]} zoom={mapPos ? 14 : 7}
                style={{ height: "100%", width: "100%" }}
                key={mapPos ? `${mapPos[0]}-${mapPos[1]}` : "default"}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                <MapPicker onPick={handleMapPick} />
                {mapPos && <Marker position={mapPos} />}
              </MapContainer>
            </div>
          </div>

          <div>
            <label className={lbl}>وصف الموقع (اختياري)</label>
            <input className={inp} placeholder="مجاور لـ…، شارع…، أمام…"
              value={form.locationDescription} onChange={e => set("locationDescription", e.target.value)} />
          </div>
        </div>

        {/* Section 3: Readiness */}
        <div className={sec}>
          <h2 className={stit}>
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center">٢</span>
            الجاهزية التشغيلية
            <span className="mr-auto text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{scores.readiness}/100</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              ["hasSignboard", "لافتة / لوحة LTT واضحة"],
              ["hasDevices",   "أجهزة وحواسيب متوفرة"],
            ] as [keyof FormData, string][]).map(([key, label]) => (
              <div key={key}>
                <label className={lbl}>{label}</label>
                <div className="flex gap-2">
                  {[["true", "نعم ✓"], ["false", "لا ✗"]].map(([val, lbl2]) => (
                    <button key={val} type="button" onClick={() => set(key, val)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        form[key] === val
                          ? val === "true" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-500"
                      }`}>
                      {lbl2}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className={lbl}>جودة الاتصال بالإنترنت</label>
            <div className="flex gap-2">
              {[["good", "جيد 🟢"], ["medium", "متوسط 🟡"], ["poor", "ضعيف 🔴"]].map(([val, lbl2]) => (
                <button key={val} type="button" onClick={() => set("internetQuality", val)}
                  className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                    form.internetQuality === val ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}>
                  {lbl2}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={lbl}>
              جاهزية الموظفين: <span className="text-orange-600 font-bold">{form.staffReadiness}/5</span>
            </label>
            <input type="range" min={1} max={5} value={form.staffReadiness}
              onChange={e => set("staffReadiness", e.target.value)} className="w-full accent-orange-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>ضعيف ١</span><span>٢</span><span>٣</span><span>٤</span><span>ممتاز ٥</span>
            </div>
          </div>
        </div>

        {/* Section 4: Market */}
        <div className={sec}>
          <h2 className={stit}>
            <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold flex items-center justify-center">٣</span>
            إمكانية السوق والمعاملات
            <span className="mr-auto text-sm font-normal text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{scores.sales}/100</span>
          </h2>
          <div>
            <label className={lbl}>حركة المنطقة التجارية</label>
            <div className="flex gap-2">
              {[["high", "عالية 🔥"], ["medium", "متوسطة ⚡"], ["low", "ضعيفة 🌙"]].map(([val, lbl2]) => (
                <button key={val} type="button" onClick={() => set("areaTraffic", val)}
                  className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${
                    form.areaTraffic === val ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}>
                  {lbl2}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>منافسو LTT في المدينة</label>
              <input type="number" min={0} className={inp} placeholder="0" dir="ltr"
                value={form.marketDensitySameCity} onChange={e => set("marketDensitySameCity", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>منافسو LTT في نفس الشارع</label>
              <input type="number" min={0} className={inp} placeholder="0" dir="ltr"
                value={form.marketDensitySameStreet} onChange={e => set("marketDensitySameStreet", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>معاملات ADSL الشهرية</label>
              <input type="number" min={0} className={inp} placeholder="مثال: 300" dir="ltr"
                value={form.transactionVolumeAdsl} onChange={e => set("transactionVolumeAdsl", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>معاملات 4G الشهرية</label>
              <input type="number" min={0} className={inp} placeholder="مثال: 500" dir="ltr"
                value={form.transactionVolume4g} onChange={e => set("transactionVolume4g", e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            إجمالي المعاملات الشهرية (ADSL + 4G):{" "}
            <strong className="text-gray-600">
              {((parseInt(form.transactionVolumeAdsl || "0")) + (parseInt(form.transactionVolume4g || "0"))).toLocaleString()}
            </strong>
          </p>
        </div>

        {/* Section 5: Compliance */}
        <div className={sec}>
          <h2 className={stit}>
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center">٤</span>
            الامتثال والوثائق
            <span className="mr-auto text-sm font-normal text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{scores.compliance}/100</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              ["documentsComplete",      "الوثائق والمستندات مكتملة"],
              ["brandIdentityCompliant", "الالتزام بالهوية البصرية LTT"],
            ] as [keyof FormData, string][]).map(([key, label]) => (
              <div key={key}>
                <label className={lbl}>{label}</label>
                <div className="flex gap-2">
                  {[["true", "نعم ✓"], ["false", "لا ✗"]].map(([val, lbl2]) => (
                    <button key={val} type="button" onClick={() => set(key, val)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        form[key] === val
                          ? val === "true" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600"
                          : "border-gray-200 text-gray-500"
                      }`}>
                      {lbl2}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Photos */}
        <div className={sec}>
          <h2 className={stit}>
            <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 text-lg flex items-center justify-center">📸</span>
            صور الزيارة الميدانية
          </h2>
          <div className="space-y-5">
            {PHOTO_CATS.map(cat => (
              <PhotoUploadSection
                key={cat.key} cat={cat}
                files={photos[cat.key]} previews={previews[cat.key]}
                onAdd={files => handlePhotos(cat.key, files)}
                onRemove={i => removePhoto(cat.key, i)}
              />
            ))}
          </div>
        </div>

        {/* Section 7: Notes */}
        <div className={sec}>
          <h2 className={stit}>
            <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center">٥</span>
            ملاحظات المفتش
          </h2>
          <textarea className={`${inp} resize-none`} rows={4}
            placeholder="ملاحظات حول الزيارة، المشكلات المرصودة، التوصيات…"
            value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>

        {/* Score summary */}
        <div className="bg-[hsl(220,55%,18%)] text-white rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-lg">ملخص التقييم التفتيشي</h3>
          <div className="space-y-3">
            {[
              { label: "الجاهزية التشغيلية (40%)", val: scores.readiness,  color: "bg-blue-400" },
              { label: "إمكانية السوق (35%)",        val: scores.sales,      color: "bg-orange-400" },
              { label: "الامتثال والوثائق (25%)",    val: scores.compliance, color: "bg-purple-400" },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-200">{label}</span>
                  <span className="font-bold">{val}/100</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full">
                  <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 pt-3 flex justify-between items-center">
            <span className="font-bold text-lg">التقييم النهائي</span>
            <span className={`text-4xl font-black ${scores.final >= 80 ? "text-green-400" : scores.final >= 60 ? "text-yellow-400" : "text-red-400"}`}>
              {scores.final}<span className="text-lg text-white/50">/100</span>
            </span>
          </div>
          <p className="text-xs text-white/50 text-center">
            يُرسل التقرير إلى: y.rahuma@ltt.ly — للمراجعة: s.zawia@ltt.ly
          </p>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-2xl text-lg font-black shadow-lg transition-all active:scale-95">
          {submitting ? "جاري الإرسال…" : "إرسال تقرير الجولة التفتيشية"}
        </button>

        <p className="text-center text-xs text-gray-400 pb-6">
          سيتم إرسال نسخة من التقرير بالبريد الإلكتروني إلى إدارة المبيعات والمراجعة
        </p>
      </form>
    </div>
  );
}
