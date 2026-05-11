import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapPin, Filter, Flame, Share2, Check } from "lucide-react";

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
interface Entity { id: number; entityType: string | null; agentName: string | null; city: string | null; mobile: string | null; representativeName: string | null; status: string; latitude: number | null; longitude: number | null }

type MarkerKind = "agent" | "service_center" | "fixed_pos" | "mobile_van";

const KIND_META: Record<MarkerKind, { label: string; color: string }> = {
  agent:          { label: "وكلاء",            color: "#16a34a" },
  service_center: { label: "مراكز خدمات",      color: "#2563eb" },
  fixed_pos:      { label: "نقاط بيع ثابتة",    color: "#7c3aed" },
  mobile_van:     { label: "سيارات متنقلة",     color: "#ea580c" },
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

type MapPoint = { kind: MarkerKind; id: number; name: string; city: string; phone: string; extra: string; lat: number; lng: number };

export default function PublicMap() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
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
    }).catch(() => { window.prompt("انسخ الرابط:", shareUrl); });
  }

  async function nativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: shareText, text: shareText, url: shareUrl }); setShareOpen(false); } catch { /* */ }
    } else { copyLink(); }
  }

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const apiBase = base.startsWith("/") ? "/api" : "/api";
    void apiBase;
    Promise.all([
      fetch("/api/agents").then(r => r.ok ? r.json() : []).catch(() => []) as Promise<Agent[]>,
      fetch("/api/agent-requests").then(r => r.ok ? r.json() : []).catch(() => []) as Promise<Entity[]>,
    ]).then(([a, e]) => { setAgents(a); setEntities(e); }).finally(() => setLoading(false));
  }, []);

  const points = useMemo<MapPoint[]>(() => {
    const fromAgents: MapPoint[] = agents
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a) => ({
        kind: "agent" as const, id: a.id, name: a.name, city: a.city ?? "—", phone: a.phone ?? "—",
        extra: a.channelType ?? a.type ?? "—",
        lat: Number(a.latitude), lng: Number(a.longitude),
      }));
    const fromEntities: MapPoint[] = entities
      .filter((e) => e.entityType !== "agent" && e.entityType !== "inspection" && e.latitude != null && e.longitude != null && e.status !== "cancelled")
      .map((e) => ({
        kind: e.entityType as MarkerKind, id: e.id, name: e.agentName ?? "—", city: e.city ?? "—", phone: e.mobile ?? "—",
        extra: e.representativeName ?? "—",
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <header className="bg-gradient-to-r from-[hsl(210,75%,28%)] to-[hsl(28,85%,48%)] text-white px-3 py-2.5 flex items-center gap-2 shadow-md">
        <img src="/company-logo.png" alt="LTT" className="h-9 w-9 object-contain shrink-0 bg-white/10 rounded-lg p-1" />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm sm:text-lg font-bold leading-tight flex items-center gap-1.5">
            <MapPin size={16} /> خريطة الوكلاء والمراكز
          </h1>
          <p className="text-[10px] sm:text-xs text-blue-50 truncate">Libya Telecom &amp; Technology</p>
        </div>
        <button onClick={() => setShareOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold bg-white text-[hsl(210,75%,28%)] hover:bg-blue-50 shadow">
          <Share2 size={14} /> مشاركة
        </button>
      </header>

      {shareOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" dir="rtl" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Share2 size={18} /> مشاركة الخريطة</h3>
              <button onClick={() => setShareOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
            </div>
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
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
          <Filter size={12} /> فلترة حسب النوع
          <button onClick={() => setHeatmap((v) => !v)}
            className={`mr-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs border ${heatmap ? "bg-orange-500 text-white border-orange-500" : "bg-white border-gray-300 hover:bg-gray-50"}`}>
            <Flame size={12} /> {heatmap ? "إخفاء الحرارية" : "خريطة حرارية"}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(KIND_META) as MarkerKind[]).map((k) => {
            const meta = KIND_META[k];
            const active = enabled[k];
            return (
              <button key={k} type="button" onClick={() => setEnabled((p) => ({ ...p, [k]: !p[k] }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-right ${active ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: meta.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">{meta.label}</div>
                  <div className="text-[10px] text-gray-500">{counts[k]} موقع</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 py-20">جاري تحميل المواقع...</div>
        ) : (
          <MapContainer center={center} zoom={7} className="h-full w-full" style={{ minHeight: "calc(100vh - 200px)" }}>
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

      <footer className="bg-white border-t border-gray-200 px-4 py-2 text-center text-[11px] text-gray-500">
        © Libya Telecom &amp; Technology — لوحة تحكم عمليات المراكز والوكلاء
      </footer>
    </div>
  );
}
