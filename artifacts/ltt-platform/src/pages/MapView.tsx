import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { api } from "@/lib/api";
import type { AgentRequest } from "@/lib/api";
import { Download, MapPin, Filter, Flame, Share2, Check } from "lucide-react";

function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);
  useEffect(() => {
    if (layerRef.current) map.removeLayer(layerRef.current);
    if (points.length === 0) return;
    const layer = (L as unknown as { heatLayer: (pts: [number, number, number][], opts?: object) => L.Layer }).heatLayer(points, {
      radius: 30, blur: 25, maxZoom: 12,
      gradient: { 0.2: "#3b82f6", 0.4: "#10b981", 0.6: "#f59e0b", 0.8: "#ef4444", 1.0: "#7f1d1d" },
    });
    layer.addTo(map);
    layerRef.current = layer;
    return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
  }, [map, points]);
  return null;
}

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

interface Agent { id: number; name: string; city: string | null; phone: string | null; status: string; type: string | null; channelType: string | null; latitude: number | null; longitude: number | null }

type MarkerKind = "agent" | "service_center" | "fixed_pos" | "mobile_van";

const KIND_META: Record<MarkerKind, { label: string; color: string; emoji: string }> = {
  agent:          { label: "وكلاء",            color: "#16a34a", emoji: "🟢" },
  service_center: { label: "مراكز خدمات",      color: "#2563eb", emoji: "🔵" },
  fixed_pos:      { label: "نقاط بيع ثابتة",    color: "#7c3aed", emoji: "🟣" },
  mobile_van:     { label: "سيارات متنقلة",     color: "#ea580c", emoji: "🟠" },
};

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const ICONS: Record<MarkerKind, L.DivIcon> = {
  agent: makeIcon(KIND_META.agent.color),
  service_center: makeIcon(KIND_META.service_center.color),
  fixed_pos: makeIcon(KIND_META.fixed_pos.color),
  mobile_van: makeIcon(KIND_META.mobile_van.color),
};

type MapPoint = {
  kind: MarkerKind;
  id: number;
  name: string;
  city: string;
  phone: string;
  status: string;
  extra: string;
  lat: number;
  lng: number;
};

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function MapView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [entities, setEntities] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState<Record<MarkerKind, boolean>>({
    agent: true, service_center: true, fixed_pos: true, mobile_van: true,
  });
  const [heatmap, setHeatmap] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/map` : "";
  const shareText = "خريطة الوكلاء والمراكز — Libya Telecom & Technology";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      window.prompt("انسخ الرابط:", shareUrl);
    });
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shareUrl });
        setShareOpen(false);
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  }

  useEffect(() => {
    Promise.all([
      api.get<Agent[]>("/agents").catch(() => [] as Agent[]),
      api.get<AgentRequest[]>("/agent-requests").catch(() => [] as AgentRequest[]),
    ]).then(([a, e]) => { setAgents(a); setEntities(e); }).finally(() => setLoading(false));
  }, []);

  const points = useMemo<MapPoint[]>(() => {
    const fromAgents: MapPoint[] = agents
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a) => ({
        kind: "agent" as const, id: a.id, name: a.name, city: a.city ?? "—", phone: a.phone ?? "—",
        status: a.status, extra: a.channelType ?? a.type ?? "—",
        lat: Number(a.latitude), lng: Number(a.longitude),
      }));
    const fromEntities: MapPoint[] = entities
      .filter((e) => e.entityType !== "agent" && e.entityType !== "inspection" && e.latitude != null && e.longitude != null && e.status !== "cancelled")
      .map((e) => ({
        kind: e.entityType as MarkerKind, id: e.id, name: e.agentName ?? "—", city: e.city ?? "—", phone: e.mobile ?? "—",
        status: e.status, extra: e.representativeName ?? "—",
        lat: Number(e.latitude), lng: Number(e.longitude),
      }));
    return [...fromAgents, ...fromEntities];
  }, [agents, entities]);

  const filtered = points.filter((p) => enabled[p.kind]);

  const counts = useMemo(() => {
    const c: Record<MarkerKind, number> = { agent: 0, service_center: 0, fixed_pos: 0, mobile_van: 0 };
    points.forEach((p) => { c[p.kind]++; });
    return c;
  }, [points]);

  const center: [number, number] = filtered.length > 0
    ? [filtered.reduce((s, p) => s + p.lat, 0) / filtered.length, filtered.reduce((s, p) => s + p.lng, 0) / filtered.length]
    : [32.0, 13.5];

  function exportAll() {
    downloadCsv(`ltt-locations-${new Date().toISOString().slice(0, 10)}.csv`, filtered.map((p) => ({
      "النوع": KIND_META[p.kind].label,
      "الاسم": p.name,
      "المدينة": p.city,
      "الهاتف": p.phone,
      "تفاصيل": p.extra,
      "الحالة": p.status,
      "خط العرض": p.lat,
      "خط الطول": p.lng,
      "رابط الخرائط": `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
    })));
  }

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2"><MapPin size={22} /> الخريطة التفاعلية</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">جميع مواقع الوكلاء وكيانات الشركة على خريطة واحدة</p>
          </div>
          <button onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[hsl(210,75%,28%)] to-[hsl(28,85%,48%)] text-white shadow-lg hover:opacity-90 ring-2 ring-orange-300/40 shrink-0">
            <Share2 size={18} /> مشاركة الخريطة
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setHeatmap((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm border ${heatmap ? "bg-orange-500 text-white border-orange-500" : "bg-white border-border hover:bg-muted"}`}>
            <Flame size={14} /> {heatmap ? "إخفاء الحرارية" : "خريطة حرارية"}
          </button>
          <button onClick={exportAll} disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-xs sm:text-sm hover:bg-primary/90 disabled:opacity-50">
            <Download size={14} /> تصدير ({filtered.length})
          </button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Filter size={14} /> فلترة حسب النوع
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(KIND_META) as MarkerKind[]).map((k) => {
            const meta = KIND_META[k];
            const active = enabled[k];
            return (
              <button key={k} type="button" onClick={() => setEnabled((p) => ({ ...p, [k]: !p[k] }))}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all text-right ${active ? "border-primary bg-primary/5" : "border-border bg-muted/30 opacity-60"}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: meta.color }} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{meta.label}</div>
                  <div className="text-xs text-muted-foreground">{counts[k]} موقع</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" dir="rtl" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Share2 size={18} /> مشاركة الخريطة العامة</h3>
              <button onClick={() => setShareOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-3">رابط عام بدون تسجيل دخول — مناسب لمشاركته مع أي شخص</p>
            <div className="flex gap-2 mb-4">
              <input type="text" readOnly value={shareUrl} dir="ltr"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-700" />
              <button onClick={copyLink}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 ${copied ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
                {copied ? <><Check size={14} /> تم</> : "نسخ"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`} target="_blank" rel="noopener noreferrer"
                onClick={() => setShareOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600">
                <span>💬</span> واتساب
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                onClick={() => setShareOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600">
                <span>✈️</span> تيليجرام
              </a>
              <a href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`}
                onClick={() => setShareOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-gray-700 text-white hover:bg-gray-800">
                <span>📧</span> البريد
              </a>
              <button onClick={nativeShare}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[hsl(210,75%,28%)] to-[hsl(28,85%,48%)] text-white hover:opacity-90">
                <Share2 size={14} /> مشاركة أخرى
              </button>
            </div>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer"
              className="mt-3 block text-center text-xs text-blue-600 hover:underline">
              👁️ معاينة الرابط في تبويب جديد
            </a>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden" style={{ height: "calc(100vh - 320px)", minHeight: 480 }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">جاري تحميل المواقع...</div>
        ) : (
          <MapContainer center={center} zoom={7} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {heatmap && <HeatLayer points={filtered.map((p) => [p.lat, p.lng, 1])} />}
            {!heatmap && <LayerGroup>
              {filtered.map((p) => (
                <Marker key={`${p.kind}-${p.id}`} position={[p.lat, p.lng]} icon={ICONS[p.kind]}>
                  <Popup>
                    <div className="text-right text-sm space-y-1" dir="rtl" style={{ minWidth: 200 }}>
                      <div className="font-bold text-base">{p.name}</div>
                      <div><span className="font-semibold">النوع:</span> {KIND_META[p.kind].label}</div>
                      <div><span className="font-semibold">المدينة:</span> {p.city}</div>
                      <div><span className="font-semibold">الهاتف:</span> {p.phone}</div>
                      <div><span className="font-semibold">التفاصيل:</span> {p.extra}</div>
                      <div><span className="font-semibold">الحالة:</span> {p.status}</div>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer"
                        className="inline-block mt-2 text-blue-600 hover:underline text-xs">📍 افتح في Google Maps</a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
