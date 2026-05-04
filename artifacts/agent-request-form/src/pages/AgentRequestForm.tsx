import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const EMPLOYEES = [
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

type FormData = {
  employeeName: string;
  employeeEmail: string;
  agentName: string;
  phone: string;
  city: string;
  agentType: string;
  latitude: string;
  longitude: string;
  locationDescription: string;
  hasSignboard: string;
  hasDevices: string;
  internetQuality: string;
  staffReadiness: string;
  areaTraffic: string;
  nearCompetitors: string;
  dailySalesEstimate: string;
  documentsComplete: string;
  brandIdentityCompliant: string;
  notes: string;
};

type Scores = { readiness: number; sales: number; compliance: number; final: number };
type SubmitResult = { requestId: string; finalScore: number; data: FormData; scores: Scores };

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
  if (f.nearCompetitors === "far") sales += 30;
  else if (f.nearCompetitors === "medium") sales += 20;
  else sales += 10;
  const est = parseInt(f.dailySalesEstimate || "0");
  if (est >= 1000) sales += 30;
  else if (est >= 500) sales += 22;
  else if (est >= 200) sales += 15;
  else if (est >= 100) sales += 8;
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

function SuccessScreen({ result, onReset }: { result: SubmitResult; onReset: () => void }) {
  const scoreColor = result.scores.final >= 80 ? "text-green-600" : result.scores.final >= 60 ? "text-yellow-600" : "text-red-600";
  const classification = result.scores.final >= 80 ? "مؤهل للموافقة" : result.scores.final >= 60 ? "يحتاج مراجعة" : "غير مؤهل حالياً";

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `طلب إنشاء وكيل جديد:\n` +
      `رقم الطلب: ${result.requestId}\n` +
      `اسم الوكيل: ${result.data.agentName}\n` +
      `المدينة: ${result.data.city}\n` +
      `النوع: ${result.data.agentType}\n` +
      `التقييم: ${result.scores.final}/100\n` +
      `التصنيف: ${classification}\n` +
      (result.data.latitude ? `الموقع: https://maps.google.com/?q=${result.data.latitude},${result.data.longitude}` : "")
    );
    window.open(`https://wa.me/218912444808?text=${msg}`, "_blank");
  };

  const handleExcelExport = () => {
    const ws = XLSX.utils.json_to_sheet([{
      "اسم الموظف": result.data.employeeName,
      "اسم الوكيل": result.data.agentName,
      "المدينة": result.data.city,
      "النوع": result.data.agentType,
      "الهاتف": result.data.phone,
      "جاهزية تشغيلية": result.scores.readiness,
      "إمكانية المبيعات": result.scores.sales,
      "الامتثال": result.scores.compliance,
      "التقييم النهائي": result.scores.final,
      "التصنيف": classification,
      "رقم الطلب": result.requestId,
      "التاريخ": new Date().toLocaleDateString("ar-LY"),
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "طلب الوكيل");
    XLSX.writeFile(wb, `agent_request_${result.requestId}.xlsx`);
  };

  const handlePdfExport = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Libya Telecom & Technology", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("New Agent Creation Request", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const d = result.data;
    const s = result.scores;
    const rows: [string, string][] = [
      ["Request ID", result.requestId],
      ["Date", new Date().toLocaleDateString()],
      ["Employee", d.employeeName],
      ["Agent Name", d.agentName],
      ["Phone", d.phone],
      ["City", d.city],
      ["Agent Type", d.agentType],
      ["Coordinates", d.latitude ? `${parseFloat(d.latitude).toFixed(5)}, ${parseFloat(d.longitude).toFixed(5)}` : "N/A"],
      ["Signboard", d.hasSignboard === "true" ? "Yes" : "No"],
      ["Devices", d.hasDevices === "true" ? "Yes" : "No"],
      ["Internet Quality", d.internetQuality],
      ["Staff Readiness", `${d.staffReadiness}/5`],
      ["Area Traffic", d.areaTraffic],
      ["Near Competitors", d.nearCompetitors],
      ["Daily Sales Estimate (LYD)", d.dailySalesEstimate],
      ["Documents Complete", d.documentsComplete === "true" ? "Yes" : "No"],
      ["Brand Identity", d.brandIdentityCompliant === "true" ? "Yes" : "No"],
      ["Notes", d.notes || "N/A"],
      ["Readiness Score", `${s.readiness}/100`],
      ["Sales Score", `${s.sales}/100`],
      ["Compliance Score", `${s.compliance}/100`],
      ["FINAL SCORE", `${s.final}/100 - ${classification}`],
    ];
    let y = 45;
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 75, y);
      y += 8;
    });
    doc.save(`agent_request_${result.requestId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تم إرسال الطلب بنجاح</h2>
          <p className="text-gray-500 mt-1">رقم الطلب: <span className="font-mono font-bold text-blue-700">{result.requestId}</span></p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-right space-y-3">
          <h3 className="font-bold text-gray-800 text-lg border-b pb-2">ملخص الطلب</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">الموظف:</span> <span className="font-semibold">{result.data.employeeName}</span></div>
            <div><span className="text-gray-500">اسم الوكيل:</span> <span className="font-semibold">{result.data.agentName}</span></div>
            <div><span className="text-gray-500">المدينة:</span> <span className="font-semibold">{result.data.city}</span></div>
            <div><span className="text-gray-500">النوع:</span> <span className="font-semibold">{result.data.agentType}</span></div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className={`text-5xl font-black ${scoreColor}`}>{result.scores.final}<span className="text-2xl text-gray-400">/100</span></div>
          <div className={`text-lg font-bold ${scoreColor}`}>{classification}</div>
          <div className="space-y-3 text-right">
            <ScoreBar label="الجاهزية التشغيلية" value={result.scores.readiness} color="bg-blue-500" />
            <ScoreBar label="إمكانية المبيعات" value={result.scores.sales} color="bg-orange-500" />
            <ScoreBar label="الامتثال" value={result.scores.compliance} color="bg-purple-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handlePdfExport} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>
            تصدير PDF
          </button>
          <button onClick={handleExcelExport} className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>
            تصدير Excel
          </button>
          <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.127 1.532 5.866L.053 23.947l6.272-1.464A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 01-5.032-1.382l-.36-.214-3.738.872.939-3.627-.236-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
            إرسال واتساب
          </button>
          <button onClick={onReset} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            طلب جديد
          </button>
        </div>
        {result.data.latitude && (
          <a href={`https://maps.google.com/?q=${result.data.latitude},${result.data.longitude}`} target="_blank" rel="noopener noreferrer"
            className="block text-blue-600 underline text-sm">
            📍 عرض الموقع على خرائط Google
          </a>
        )}
      </div>
    </div>
  );
}

export default function AgentRequestForm() {
  const [form, setForm] = useState<FormData>({
    employeeName: "", employeeEmail: "", agentName: "", phone: "", city: "", agentType: "",
    latitude: "", longitude: "", locationDescription: "",
    hasSignboard: "false", hasDevices: "false", internetQuality: "medium", staffReadiness: "3",
    areaTraffic: "medium", nearCompetitors: "medium", dailySalesEstimate: "",
    documentsComplete: "false", brandIdentityCompliant: "false", notes: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapPos, setMapPos] = useState<[number, number] | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scores = calcScores(form);

  const set = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleEmployeeChange = (name: string) => {
    const emp = EMPLOYEES.find(e => e.name === name);
    setForm(f => ({ ...f, employeeName: name, employeeEmail: emp?.email ?? "" }));
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - images.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const valid = newFiles.filter(f => f.size <= 5 * 1024 * 1024 && /\.(jpg|jpeg|png|pdf)$/i.test(f.name));
    setImages(prev => [...prev, ...valid]);
    valid.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
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
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.employeeName) e.employeeName = "مطلوب";
    if (!form.agentName) e.agentName = "مطلوب";
    if (!form.phone) e.phone = "مطلوب";
    if (!form.city) e.city = "مطلوب";
    if (!form.agentType) e.agentType = "مطلوب";
    if (!form.dailySalesEstimate) e.dailySalesEstimate = "مطلوب";
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
      images.forEach(img => fd.append("images", img));
      const res = await fetch("/api/agent-request", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "حدث خطأ" }));
        throw new Error(err.error);
      }
      const saved = await res.json() as { requestId: string; finalScore: number };
      setSubmitResult({ requestId: saved.requestId, finalScore: saved.finalScore, data: form, scores });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ في الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Load Cairo font
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  if (submitResult) return <SuccessScreen result={submitResult} onReset={() => { setSubmitResult(null); setForm({ employeeName: "", employeeEmail: "", agentName: "", phone: "", city: "", agentType: "", latitude: "", longitude: "", locationDescription: "", hasSignboard: "false", hasDevices: "false", internetQuality: "medium", staffReadiness: "3", areaTraffic: "medium", nearCompetitors: "medium", dailySalesEstimate: "", documentsComplete: "false", brandIdentityCompliant: "false", notes: "" }); setImages([]); setPreviews([]); }} />;

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errClass = "text-xs text-red-500 mt-1";
  const sectionClass = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4";
  const sectionTitle = "text-lg font-bold text-navy-900 mb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      <header className="bg-[hsl(220,55%,18%)] text-white py-5 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
          </div>
          <div>
            <div className="text-xs text-orange-300 font-semibold">Libya Telecom & Technology</div>
            <h1 className="text-xl font-black">نموذج طلب إنشاء وكيل جديد</h1>
            <div className="text-xs text-blue-200">المنطقة الغربية — قسم المبيعات</div>
          </div>
        </div>
      </header>

      {/* Live Score Banner */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">التقييم الآني</span>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">ج: <span className="font-bold text-blue-600">{scores.readiness}</span></div>
            <div className="text-xs text-gray-500">م: <span className="font-bold text-orange-600">{scores.sales}</span></div>
            <div className="text-xs text-gray-500">ا: <span className="font-bold text-purple-600">{scores.compliance}</span></div>
            <div className={`text-lg font-black ${scores.final >= 80 ? "text-green-600" : scores.final >= 60 ? "text-yellow-600" : "text-red-600"}`}>
              {scores.final}<span className="text-xs text-gray-400">/100</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* SECTION 1: Basic Info */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">١</span>
            المعلومات الأساسية
          </h2>
          <div>
            <label className={labelClass}>اسم الموظف *</label>
            <select className={`${inputClass} ${errors.employeeName ? "border-red-400" : ""}`} value={form.employeeName} onChange={e => handleEmployeeChange(e.target.value)}>
              <option value="">— اختر الموظف —</option>
              {EMPLOYEES.map(emp => <option key={emp.email} value={emp.name}>{emp.name}</option>)}
            </select>
            {errors.employeeName && <p className={errClass}>{errors.employeeName}</p>}
          </div>
          <div>
            <label className={labelClass}>اسم الوكيل *</label>
            <input className={`${inputClass} ${errors.agentName ? "border-red-400" : ""}`} placeholder="الاسم الكامل للوكيل أو المحل" value={form.agentName} onChange={e => set("agentName", e.target.value)} />
            {errors.agentName && <p className={errClass}>{errors.agentName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>رقم الهاتف *</label>
              <input className={`${inputClass} ${errors.phone ? "border-red-400" : ""}`} placeholder="09XXXXXXXX" dir="ltr" value={form.phone} onChange={e => set("phone", e.target.value)} />
              {errors.phone && <p className={errClass}>{errors.phone}</p>}
            </div>
            <div>
              <label className={labelClass}>المدينة *</label>
              <input className={`${inputClass} ${errors.city ? "border-red-400" : ""}`} placeholder="طرابلس، مصراتة…" value={form.city} onChange={e => set("city", e.target.value)} />
              {errors.city && <p className={errClass}>{errors.city}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass}>نوع الوكيل *</label>
            <div className="grid grid-cols-2 gap-2">
              {[["main", "وكيل رئيسي"], ["sub", "وكيل فرعي"], ["pos", "نقطة بيع"], ["mobile", "بائع متجول"]].map(([val, label]) => (
                <button key={val} type="button"
                  onClick={() => set("agentType", val)}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all ${form.agentType === val ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                  {label}
                </button>
              ))}
            </div>
            {errors.agentType && <p className={errClass}>{errors.agentType}</p>}
          </div>
        </div>

        {/* SECTION 2: Location */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center">📍</span>
            الموقع والمرفقات
          </h2>
          <button type="button" onClick={handleGPS} disabled={gpsLoading}
            className="w-full py-2.5 border-2 border-dashed border-green-400 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {gpsLoading ? "جاري التحديد…" : "📍 تحديد الموقع تلقائيًا"}
          </button>
          {form.latitude && (
            <div className="text-xs text-center text-green-700 bg-green-50 rounded-lg p-2">
              {form.latitude}, {form.longitude}
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-2">أو انقر على الخريطة لاختيار الموقع يدويًا</label>
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 220 }}>
              <MapContainer
                center={mapPos ?? [32.9, 13.18]}
                zoom={mapPos ? 14 : 10}
                style={{ height: "100%", width: "100%" }}
                key={mapPos ? `${mapPos[0]}-${mapPos[1]}` : "default"}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                <MapPicker onPick={handleMapPick} />
                {mapPos && <Marker position={mapPos} />}
              </MapContainer>
            </div>
          </div>
          <div>
            <label className={labelClass}>وصف الموقع (اختياري)</label>
            <input className={inputClass} placeholder="مجاور لـ…، شارع…" value={form.locationDescription} onChange={e => set("locationDescription", e.target.value)} />
          </div>

          {/* File Upload */}
          <div>
            <label className={labelClass}>صور الموقع (حتى 5 صور – JPG, PNG, PDF)</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={e => { e.preventDefault(); handleImages(e.dataTransfer.files); }}
              onDragOver={e => e.preventDefault()}
            >
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-sm text-gray-500">{images.length === 0 ? "اسحب الصور هنا أو انقر للاختيار" : `${images.length} صورة محددة`}</p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => handleImages(e.target.files)} />
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xl">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Operational Readiness */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center">٢</span>
            الجاهزية التشغيلية
            <span className="mr-auto text-sm font-normal text-blue-600">{scores.readiness}/100</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>توفر لوحة إعلانية</label>
              <div className="flex gap-2">
                {[["true", "نعم ✓"], ["false", "لا ✗"]].map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => set("hasSignboard", val)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${form.hasSignboard === val ? (val === "true" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-gray-200 text-gray-500"}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>توفر أجهزة</label>
              <div className="flex gap-2">
                {[["true", "نعم ✓"], ["false", "لا ✗"]].map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => set("hasDevices", val)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${form.hasDevices === val ? (val === "true" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-gray-200 text-gray-500"}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>جودة الاتصال بالإنترنت</label>
            <div className="flex gap-2">
              {[["good", "جيد 🟢"], ["medium", "متوسط 🟡"], ["poor", "ضعيف 🔴"]].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => set("internetQuality", val)}
                  className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${form.internetQuality === val ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-300"}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>جاهزية الموظفين: <span className="text-orange-600">{form.staffReadiness}/5</span></label>
            <input type="range" min={1} max={5} value={form.staffReadiness} onChange={e => set("staffReadiness", e.target.value)}
              className="w-full accent-orange-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>ضعيف ١</span><span>٢</span><span>٣</span><span>٤</span><span>ممتاز ٥</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Sales Potential */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>
            <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold flex items-center justify-center">٣</span>
            إمكانية المبيعات
            <span className="mr-auto text-sm font-normal text-orange-600">{scores.sales}/100</span>
          </h2>
          <div>
            <label className={labelClass}>حركة المنطقة</label>
            <div className="flex gap-2">
              {[["high", "عالية 🔥"], ["medium", "متوسطة"], ["low", "ضعيفة"]].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => set("areaTraffic", val)}
                  className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${form.areaTraffic === val ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-300"}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>قربه من المنافسين</label>
            <div className="flex gap-2">
              {[["close", "قريب 🔴"], ["medium", "متوسط 🟡"], ["far", "بعيد 🟢"]].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => set("nearCompetitors", val)}
                  className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${form.nearCompetitors === val ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-300"}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>تقدير المبيعات اليومية (دينار ليبي) *</label>
            <input type="number" min={0} className={`${inputClass} ${errors.dailySalesEstimate ? "border-red-400" : ""}`}
              placeholder="مثال: 500" dir="ltr"
              value={form.dailySalesEstimate} onChange={e => set("dailySalesEstimate", e.target.value)} />
            {errors.dailySalesEstimate && <p className={errClass}>{errors.dailySalesEstimate}</p>}
          </div>
        </div>

        {/* SECTION 5: Compliance */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center">٤</span>
            الامتثال
            <span className="mr-auto text-sm font-normal text-purple-600">{scores.compliance}/100</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>مستندات مكتملة</label>
              <div className="flex gap-2">
                {[["true", "نعم ✓"], ["false", "لا ✗"]].map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => set("documentsComplete", val)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${form.documentsComplete === val ? (val === "true" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-gray-200 text-gray-500"}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>التزام بالهوية البصرية</label>
              <div className="flex gap-2">
                {[["true", "نعم ✓"], ["false", "لا ✗"]].map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => set("brandIdentityCompliant", val)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${form.brandIdentityCompliant === val ? (val === "true" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-gray-200 text-gray-500"}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: Notes */}
        <div className={sectionClass}>
          <h2 className={sectionTitle}>
            <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center">٥</span>
            ملاحظات عامة
          </h2>
          <textarea className={`${inputClass} resize-none`} rows={4} placeholder="أي ملاحظات إضافية…"
            value={form.notes} onChange={e => set("notes", e.target.value)} />
        </div>

        {/* Score Summary */}
        <div className="bg-[hsl(220,55%,18%)] text-white rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-lg">التقييم الإجمالي</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-blue-200">الجاهزية التشغيلية (40%)</span><span className="font-bold">{scores.readiness}/100</span></div>
            <div className="h-1.5 bg-white/20 rounded-full"><div className="h-full bg-blue-400 rounded-full" style={{ width: `${scores.readiness}%` }} /></div>
            <div className="flex justify-between text-sm"><span className="text-orange-200">إمكانية المبيعات (35%)</span><span className="font-bold">{scores.sales}/100</span></div>
            <div className="h-1.5 bg-white/20 rounded-full"><div className="h-full bg-orange-400 rounded-full" style={{ width: `${scores.sales}%` }} /></div>
            <div className="flex justify-between text-sm"><span className="text-purple-200">الامتثال (25%)</span><span className="font-bold">{scores.compliance}/100</span></div>
            <div className="h-1.5 bg-white/20 rounded-full"><div className="h-full bg-purple-400 rounded-full" style={{ width: `${scores.compliance}%` }} /></div>
          </div>
          <div className="border-t border-white/20 pt-3 flex justify-between items-center">
            <span className="font-bold text-lg">النتيجة النهائية</span>
            <span className={`text-4xl font-black ${scores.final >= 80 ? "text-green-400" : scores.final >= 60 ? "text-yellow-400" : "text-red-400"}`}>
              {scores.final}<span className="text-lg text-white/50">/100</span>
            </span>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-2xl text-lg font-black shadow-lg transition-all active:scale-95">
          {submitting ? "جاري الإرسال…" : "إرسال الطلب"}
        </button>

        <p className="text-center text-xs text-gray-400 pb-6">
          سيتم إرسال نسخة من الطلب بالبريد الإلكتروني إلى إدارة المبيعات
        </p>
      </form>
    </div>
  );
}
