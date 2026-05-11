import { useState } from "react";
import { ExternalLink, RefreshCw, MessageCircle } from "lucide-react";

const ASSISTANT_URL = "https://ltt-assistant-hub.replit.app/";

export default function Assistant() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="h-screen flex flex-col" dir="rtl">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageCircle size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">المساعد الذكي</h1>
            <p className="text-xs text-muted-foreground">منصة المحادثة والمساعدة الذكية لـ LTT</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-gray-50"
            title="إعادة تحميل"
          >
            <RefreshCw size={14} />
            تحديث
          </button>
          <a
            href={ASSISTANT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:opacity-90"
          >
            <ExternalLink size={14} />
            فتح في نافذة جديدة
          </a>
        </div>
      </div>

      <div className="flex-1 bg-gray-100 overflow-hidden">
        <iframe
          key={reloadKey}
          src={ASSISTANT_URL}
          title="LTT Assistant Hub"
          className="w-full h-full border-0"
          allow="clipboard-write; microphone; camera; geolocation"
        />
      </div>
    </div>
  );
}
