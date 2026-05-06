export const DOC_TYPE_LABELS: Record<string, string> = {
  license: "الترخيص",
  commercial_record: "السجل التجاري",
  contract: "العقد",
  activity_card: "بطاقة النشاط",
  tax_card: "البطاقة الضريبية",
  chamber_membership: "عضوية الغرفة",
  other: "أخرى",
};

export const DOC_TYPE_OPTIONS = Object.entries(DOC_TYPE_LABELS).map(([v, l]) => ({ v, l }));

export const STATUS_LABELS: Record<string, string> = {
  valid: "ساري",
  expiring_soon: "قارب على الانتهاء",
  expired: "منتهي",
  suspended: "موقوف",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  valid:         { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  expiring_soon: { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500" },
  expired:       { bg: "bg-red-50",     text: "text-red-700",     ring: "ring-red-200",     dot: "bg-red-500" },
  suspended:     { bg: "bg-slate-100",  text: "text-slate-700",   ring: "ring-slate-300",   dot: "bg-slate-500" },
};

export const CHANNEL_LABELS: Record<string, string> = {
  agent_main: "وكيل رئيسي",
  agent_sub: "وكيل فرعي",
  service_center: "مركز خدمات",
  fixed_pos: "نقطة بيع ثابتة",
  mobile_van: "سيارة متنقلة",
  peddler: "بائع متجول",
};

export function daysUntilExpiry(expiry: string | null | undefined): number | null {
  if (!expiry) return null;
  const exp = new Date(expiry).getTime();
  if (isNaN(exp)) return null;
  return Math.floor((exp - Date.now()) / (1000 * 60 * 60 * 24));
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("ar-LY", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return "—";
  }
}

