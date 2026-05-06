import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapPin, X } from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function MapPickerModal({
  initialLat, initialLng, onClose, onPick,
}: {
  initialLat: string; initialLng: string;
  onClose: () => void;
  onPick: (lat: string, lng: string) => void;
}) {
  const startLat = initialLat ? Number(initialLat) : 32.8872;
  const startLng = initialLng ? Number(initialLng) : 13.1913;
  const hasInitial = !!initialLat && !!initialLng;
  const [lat, setLat] = useState<number | null>(hasInitial ? startLat : null);
  const [lng, setLng] = useState<number | null>(hasInitial ? startLng : null);

  const confirm = () => {
    if (lat == null || lng == null) return;
    onPick(lat.toFixed(6), lng.toFixed(6));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col" style={{ height: "min(80vh, 640px)" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><MapPin size={18} /> اختر الموقع على الخريطة</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="px-5 py-2 text-xs text-muted-foreground bg-amber-50 border-b border-amber-200">
          ℹ️ انقر في أي مكان على الخريطة لتحديد الموقع — يمكنك التكبير والتحريك للوصول للمكان الدقيق.
        </div>
        <div className="flex-1 relative">
          <MapContainer center={[startLat, startLng]} zoom={hasInitial ? 14 : 7} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler onPick={(la, ln) => { setLat(la); setLng(ln); }} />
            {lat != null && lng != null && <Marker position={[lat, lng]} />}
          </MapContainer>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-muted-foreground">
            {lat != null && lng != null
              ? <>📍 <span className="text-foreground font-semibold">{lat.toFixed(6)}, {lng.toFixed(6)}</span></>
              : "— لم يتم تحديد موقع بعد —"}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">إلغاء</button>
            <button type="button" onClick={confirm} disabled={lat == null || lng == null}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">تأكيد الموقع</button>
          </div>
        </div>
      </div>
    </div>
  );
}
