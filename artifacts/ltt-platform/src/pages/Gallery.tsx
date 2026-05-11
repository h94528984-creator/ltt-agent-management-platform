import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { AgentRequest } from "@/lib/api";
import { Image as ImageIcon, X, Download, Filter } from "lucide-react";

interface PhotoItem {
  url: string;
  source: string;
  agentName: string;
  category: string;
  date: string;
  requestId: string;
}

export default function Gallery() {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<PhotoItem | null>(null);

  useEffect(() => {
    api.get<AgentRequest[]>("/agent-requests").then(setRequests).finally(() => setLoading(false));
  }, []);

  const photos: PhotoItem[] = useMemo(() => {
    const out: PhotoItem[] = [];
    for (const r of requests) {
      const base = {
        agentName: r.agentName ?? r.representativeName ?? "بدون اسم",
        date: r.createdAt,
        requestId: r.requestId,
        source: r.entityType,
      };
      (r.sitePhotoUrls ?? []).forEach((u) => out.push({ ...base, url: u, category: "موقع" }));
      (r.interiorPhotoUrls ?? []).forEach((u) => out.push({ ...base, url: u, category: "داخلي" }));
      (r.equipmentPhotoUrls ?? []).forEach((u) => out.push({ ...base, url: u, category: "تجهيزات" }));
    }
    return out;
  }, [requests]);

  const filtered = photos.filter((p) => {
    if (filterEntity && p.source !== filterEntity) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (search && !p.agentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const entityTypes = Array.from(new Set(photos.map((p) => p.source)));

  return (
    <div className="p-6 space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ImageIcon size={24} className="text-pink-500" />
          معرض المرفقات
        </h1>
        <p className="text-muted-foreground text-sm mt-1">جميع الصور المرفقة من تقارير التفتيش والكيانات</p>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Filter size={12} /> نوع الكيان</label>
          <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">الكل</option>
            {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">الفئة</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">الكل</option>
            <option value="موقع">موقع</option>
            <option value="داخلي">داخلي</option>
            <option value="تجهيزات">تجهيزات</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">بحث</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم الوكيل..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">جارٍ تحميل الصور...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 bg-white border border-border rounded-xl">
          <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
          <p>لا توجد صور تطابق المعايير</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">عدد الصور: {filtered.length}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((p, idx) => (
              <button key={idx} onClick={() => setPreview(p)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-border hover:shadow-lg transition-shadow">
                <img src={p.url} alt={p.agentName} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                  <p className="text-xs font-semibold truncate">{p.agentName}</p>
                  <p className="text-[10px] opacity-80">{p.category}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={preview.url} alt="" className="w-full max-h-[85vh] object-contain rounded-lg" />
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between bg-black/60 backdrop-blur rounded-lg p-3 text-white">
              <div>
                <p className="font-semibold">{preview.agentName}</p>
                <p className="text-xs opacity-80">{preview.category} · {preview.requestId} · {new Date(preview.date).toLocaleDateString("ar-LY")}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={preview.url} download className="p-2 hover:bg-white/10 rounded-lg" title="تنزيل">
                  <Download size={18} />
                </a>
                <button onClick={() => setPreview(null)} className="p-2 hover:bg-white/10 rounded-lg" title="إغلاق">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
