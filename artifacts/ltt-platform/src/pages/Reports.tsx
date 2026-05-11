import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import {
  FileBarChart,
  Download,
  Users as UsersIcon,
  FileText,
  Building2,
  ClipboardList,
  Ticket as TicketIcon,
  Package,
  UserCheck,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Agent {
  id: number;
  name: string;
  city?: string | null;
  classification?: string | null;
  channelType?: string | null;
  region?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
interface DocStatus {
  agentId: number;
  expired: number;
  expiring: number;
  valid: number;
}
interface AgentRequest {
  id: number;
  requestId?: string | null;
  entityType?: string | null;
  entityName?: string | null;
  responsibleEmployee?: string | null;
  employeePhone?: string | null;
  address?: string | null;
  status: string;
  createdAt: string;
}
interface Ticket {
  id: number;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  assignedToId?: number | null;
  createdById?: number | null;
  locationName?: string | null;
  createdAt: string;
}
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  minQuantity?: number | null;
  category?: string | null;
}
interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department?: string | null;
  isActive: boolean;
  createdAt: string;
}
interface AgentDocument {
  id: number;
  agentId: number;
  type: string;
  number?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
}

type Loading<T> = { data: T | null; loading: boolean; error: string | null };
function init<T>(): Loading<T> {
  return { data: null, loading: true, error: null };
}

export default function Reports() {
  const [agents, setAgents] = useState<Loading<Agent[]>>(init());
  const [docStatus, setDocStatus] = useState<Loading<DocStatus[]>>(init());
  const [documents, setDocuments] = useState<Loading<AgentDocument[]>>(init());
  const [requests, setRequests] = useState<Loading<AgentRequest[]>>(init());
  const [tickets, setTickets] = useState<Loading<Ticket[]>>(init());
  const [inventory, setInventory] = useState<Loading<InventoryItem[]>>(init());
  const [users, setUsers] = useState<Loading<User[]>>(init());

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const fetcher = async <T,>(
      url: string,
      setter: React.Dispatch<React.SetStateAction<Loading<T>>>,
    ) => {
      try {
        const data = await api.get<T>(url);
        setter({ data, loading: false, error: null });
      } catch (e) {
        setter({ data: null, loading: false, error: e instanceof Error ? e.message : "خطأ" });
      }
    };
    await Promise.all([
      fetcher<Agent[]>("/agents", setAgents),
      fetcher<DocStatus[]>("/documents/agent-status", setDocStatus),
      fetcher<AgentDocument[]>("/documents", setDocuments),
      fetcher<AgentRequest[]>("/agent-requests", setRequests),
      fetcher<Ticket[]>("/tickets", setTickets),
      fetcher<InventoryItem[]>("/inventory", setInventory),
      fetcher<User[]>("/users", setUsers),
    ]);
  }

  // Summaries
  const agentList = agents.data ?? [];
  const ds = docStatus.data ?? [];
  const docExpired = ds.reduce((a, d) => a + (d.expired ?? 0), 0);
  const docExpiring = ds.reduce((a, d) => a + (d.expiring ?? 0), 0);
  const docValid = ds.reduce((a, d) => a + (d.valid ?? 0), 0);

  const reqList = requests.data ?? [];
  const inspections = reqList.filter((r) => r.entityType === "inspection" || !r.entityType);
  const entities = reqList.filter((r) => r.entityType && r.entityType !== "inspection" && r.entityType !== "agent");
  const serviceCenters = entities.filter((r) => r.entityType === "service_center");
  const fixedPos = entities.filter((r) => r.entityType === "fixed_pos");
  const mobileVans = entities.filter((r) => r.entityType === "mobile_van");

  const ticketList = tickets.data ?? [];
  const openTickets = ticketList.filter((t) => t.status !== "closed" && t.status !== "resolved");
  const urgentTickets = ticketList.filter((t) => t.priority === "urgent");

  const inv = inventory.data ?? [];
  const lowStock = inv.filter((i) => i.minQuantity != null && i.quantity <= (i.minQuantity ?? 0));

  const userList = users.data ?? [];
  const activeUsers = userList.filter((u) => u.isActive).length;

  const todayStr = new Date().toISOString().slice(0, 10);

  // Classification breakdown
  const classBreakdown: Record<string, number> = {};
  agentList.forEach((a) => {
    const k = a.classification || "غير مصنف";
    classBreakdown[k] = (classBreakdown[k] ?? 0) + 1;
  });

  // City breakdown (top 8)
  const cityBreakdown: Record<string, number> = {};
  agentList.forEach((a) => {
    const k = a.city || "غير محدد";
    cityBreakdown[k] = (cityBreakdown[k] ?? 0) + 1;
  });
  const topCities = Object.entries(cityBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Role breakdown
  const roleBreakdown: Record<string, number> = {};
  userList.forEach((u) => {
    roleBreakdown[u.role] = (roleBreakdown[u.role] ?? 0) + 1;
  });

  return (
    <div className="p-3 sm:p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 rounded-lg">
            <FileBarChart size={22} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">التقارير الشاملة</h1>
            <p className="text-muted-foreground text-sm mt-0.5">ملخصات وتصدير CSV لكل بيانات النظام</p>
          </div>
        </div>
        <button
          onClick={() => { void load(); }}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-50"
        >
          تحديث البيانات
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={UsersIcon} color="blue" label="إجمالي الوكلاء" value={agentList.length} loading={agents.loading} />
        <KpiCard icon={Building2} color="purple" label="كيانات الشركة" value={entities.length} loading={requests.loading} />
        <KpiCard icon={ClipboardList} color="emerald" label="تقارير التفتيش" value={inspections.length} loading={requests.loading} />
        <KpiCard icon={TicketIcon} color="orange" label="التذاكر المفتوحة" value={openTickets.length} loading={tickets.loading} />
        <KpiCard icon={AlertTriangle} color="red" label="مستندات منتهية" value={docExpired} loading={docStatus.loading} />
        <KpiCard icon={AlertTriangle} color="amber" label="مستندات على وشك الانتهاء" value={docExpiring} loading={docStatus.loading} />
        <KpiCard icon={CheckCircle2} color="green" label="مستندات سارية" value={docValid} loading={docStatus.loading} />
        <KpiCard icon={Package} color="rose" label="عناصر منخفضة المخزون" value={lowStock.length} loading={inventory.loading} />
      </div>

      {/* Reports grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <ReportCard
          icon={UsersIcon}
          color="blue"
          title="تقرير الوكلاء"
          subtitle={`${agentList.length} وكيل`}
          loading={agents.loading}
          onExport={() =>
            exportCsv(
              agentList as unknown as Record<string, unknown>[],
              [
                { key: "id", label: "المعرف" },
                { key: "name", label: "الاسم" },
                { key: "classification", label: "التصنيف" },
                { key: "channelType", label: "نوع القناة" },
                { key: "city", label: "المدينة" },
                { key: "region", label: "المنطقة" },
                { key: "address", label: "العنوان" },
                { key: "phone", label: "الهاتف" },
                { key: "email", label: "البريد الإلكتروني" },
                { key: "latitude", label: "خط العرض" },
                { key: "longitude", label: "خط الطول" },
              ],
              `agents_report_${todayStr}.csv`,
            )
          }
        >
          <BreakdownList title="حسب التصنيف" data={classBreakdown} colorMap={{
            "A": "bg-emerald-100 text-emerald-700",
            "B": "bg-blue-100 text-blue-700",
            "C": "bg-amber-100 text-amber-700",
            "D": "bg-orange-100 text-orange-700",
            "E": "bg-red-100 text-red-700",
          }} />
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1.5">أعلى المدن</p>
            <div className="space-y-1">
              {topCities.map(([city, n]) => (
                <div key={city} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                  <span>{city}</span>
                  <span className="font-semibold text-foreground">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </ReportCard>

        <ReportCard
          icon={FileText}
          color="amber"
          title="تقرير المستندات والتراخيص"
          subtitle={`${(documents.data?.length ?? 0)} مستند`}
          loading={documents.loading || docStatus.loading}
          onExport={() =>
            exportCsv(
              (documents.data ?? []) as unknown as Record<string, unknown>[],
              [
                { key: "id", label: "المعرف" },
                { key: "agentId", label: "معرّف الوكيل" },
                { key: "type", label: "النوع" },
                { key: "number", label: "الرقم" },
                { key: "issueDate", label: "تاريخ الإصدار" },
                { key: "expiryDate", label: "تاريخ الانتهاء" },
              ],
              `documents_report_${todayStr}.csv`,
            )
          }
        >
          <div className="grid grid-cols-3 gap-2">
            <StatTile color="red" icon={XCircle} label="منتهي" value={docExpired} />
            <StatTile color="amber" icon={AlertTriangle} label="سينتهي" value={docExpiring} />
            <StatTile color="green" icon={CheckCircle2} label="سارٍ" value={docValid} />
          </div>
        </ReportCard>

        <ReportCard
          icon={Building2}
          color="purple"
          title="تقرير كيانات الشركة"
          subtitle={`${entities.length} كيان`}
          loading={requests.loading}
          onExport={() =>
            exportCsv(
              entities as unknown as Record<string, unknown>[],
              [
                { key: "requestId", label: "معرّف الطلب" },
                { key: "entityType", label: "النوع" },
                { key: "entityName", label: "الاسم" },
                { key: "responsibleEmployee", label: "المسؤول" },
                { key: "employeePhone", label: "الهاتف" },
                { key: "address", label: "العنوان" },
                { key: "status", label: "الحالة" },
                { key: "createdAt", label: "تاريخ الإنشاء" },
              ],
              `entities_report_${todayStr}.csv`,
            )
          }
        >
          <div className="grid grid-cols-3 gap-2">
            <StatTile color="indigo" icon={Building2} label="مراكز خدمة" value={serviceCenters.length} />
            <StatTile color="cyan" icon={Building2} label="نقاط بيع" value={fixedPos.length} />
            <StatTile color="teal" icon={Building2} label="سيارات متنقلة" value={mobileVans.length} />
          </div>
        </ReportCard>

        <ReportCard
          icon={ClipboardList}
          color="emerald"
          title="تقرير عمليات التفتيش"
          subtitle={`${inspections.length} عملية`}
          loading={requests.loading}
          onExport={() =>
            exportCsv(
              inspections as unknown as Record<string, unknown>[],
              [
                { key: "requestId", label: "معرّف الطلب" },
                { key: "entityType", label: "النوع" },
                { key: "entityName", label: "اسم الكيان" },
                { key: "responsibleEmployee", label: "المسؤول" },
                { key: "address", label: "العنوان" },
                { key: "status", label: "الحالة" },
                { key: "createdAt", label: "التاريخ" },
              ],
              `inspections_report_${todayStr}.csv`,
            )
          }
        >
          <div className="grid grid-cols-2 gap-2">
            {["pending", "approved", "rejected", "cancelled"].map((s) => {
              const n = inspections.filter((i) => i.status === s).length;
              const labels: Record<string, string> = {
                pending: "قيد المراجعة",
                approved: "معتمدة",
                rejected: "مرفوضة",
                cancelled: "ملغاة",
              };
              const colors: Record<string, string> = {
                pending: "amber",
                approved: "green",
                rejected: "red",
                cancelled: "gray",
              };
              return <StatTile key={s} color={colors[s]} icon={ClipboardList} label={labels[s]} value={n} />;
            })}
          </div>
        </ReportCard>

        <ReportCard
          icon={TicketIcon}
          color="orange"
          title="تقرير التذاكر"
          subtitle={`${ticketList.length} تذكرة (${openTickets.length} مفتوحة)`}
          loading={tickets.loading}
          onExport={() =>
            exportCsv(
              ticketList as unknown as Record<string, unknown>[],
              [
                { key: "id", label: "المعرف" },
                { key: "title", label: "العنوان" },
                { key: "description", label: "الوصف" },
                { key: "priority", label: "الأولوية" },
                { key: "status", label: "الحالة" },
                { key: "assignedToId", label: "المستلم" },
                { key: "createdById", label: "المُنشئ" },
                { key: "locationName", label: "الموقع" },
                { key: "createdAt", label: "التاريخ" },
              ],
              `tickets_report_${todayStr}.csv`,
            )
          }
        >
          <div className="grid grid-cols-2 gap-2">
            <StatTile color="red" icon={TrendingUp} label="عاجلة" value={urgentTickets.length} />
            <StatTile color="orange" icon={TicketIcon} label="مفتوحة" value={openTickets.length} />
            <StatTile color="green" icon={CheckCircle2} label="مغلقة" value={ticketList.length - openTickets.length} />
            <StatTile color="blue" icon={TicketIcon} label="إجمالي" value={ticketList.length} />
          </div>
        </ReportCard>

        <ReportCard
          icon={Package}
          color="rose"
          title="تقرير المخزون"
          subtitle={`${inv.length} عنصر`}
          loading={inventory.loading}
          onExport={() =>
            exportCsv(
              inv as unknown as Record<string, unknown>[],
              [
                { key: "id", label: "المعرف" },
                { key: "name", label: "الاسم" },
                { key: "category", label: "الفئة" },
                { key: "quantity", label: "الكمية" },
                { key: "minQuantity", label: "الحد الأدنى" },
              ],
              `inventory_report_${todayStr}.csv`,
            )
          }
        >
          {lowStock.length > 0 ? (
            <div>
              <p className="text-xs text-red-600 font-semibold mb-1.5">⚠ {lowStock.length} عنصر تحت الحد الأدنى</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {lowStock.slice(0, 5).map((i) => (
                  <div key={i.id} className="flex items-center justify-between text-xs bg-red-50 border border-red-200 px-2 py-1 rounded">
                    <span>{i.name}</span>
                    <span className="font-semibold text-red-700">{i.quantity}/{i.minQuantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">جميع العناصر فوق الحد الأدنى ✓</p>
          )}
        </ReportCard>

        <ReportCard
          icon={UserCheck}
          color="indigo"
          title="تقرير المستخدمين"
          subtitle={`${userList.length} مستخدم (${activeUsers} نشط)`}
          loading={users.loading}
          onExport={() =>
            exportCsv(
              userList as unknown as Record<string, unknown>[],
              [
                { key: "id", label: "المعرف" },
                { key: "fullName", label: "الاسم الكامل" },
                { key: "email", label: "البريد الإلكتروني" },
                { key: "role", label: "الدور" },
                { key: "department", label: "القسم" },
                { key: "isActive", label: "نشط" },
                { key: "createdAt", label: "تاريخ الإنشاء" },
              ],
              `users_report_${todayStr}.csv`,
            )
          }
        >
          <BreakdownList title="حسب الدور" data={roleBreakdown} colorMap={{
            admin: "bg-red-100 text-red-700",
          }} />
        </ReportCard>

        <ReportCard
          icon={FileBarChart}
          color="slate"
          title="تقرير شامل (كل البيانات)"
          subtitle="تصدير ملف ZIP/CSV واحد بكل البيانات"
          loading={false}
          onExport={() => exportFullReport()}
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            ينزّل ملف نصي واحد يحتوي ملخصاً تنفيذياً لجميع المؤشرات: عدد الوكلاء، الكيانات، التذاكر، المستندات، المستخدمين والمخزون.
          </p>
        </ReportCard>

      </div>
    </div>
  );

  function exportFullReport() {
    const lines = [
      `تقرير شامل — ${todayStr}`,
      `========================================`,
      ``,
      `[الوكلاء]`,
      `إجمالي: ${agentList.length}`,
      ...Object.entries(classBreakdown).map(([k, v]) => `  - تصنيف ${k}: ${v}`),
      ``,
      `[المدن — أعلى 8]`,
      ...topCities.map(([c, n]) => `  - ${c}: ${n}`),
      ``,
      `[المستندات]`,
      `منتهي: ${docExpired} | سينتهي: ${docExpiring} | سارٍ: ${docValid}`,
      ``,
      `[كيانات الشركة]`,
      `مراكز خدمة: ${serviceCenters.length}`,
      `نقاط بيع: ${fixedPos.length}`,
      `سيارات متنقلة: ${mobileVans.length}`,
      ``,
      `[التفتيش]`,
      `إجمالي: ${inspections.length}`,
      ...["pending", "approved", "rejected", "cancelled"].map(
        (s) => `  - ${s}: ${inspections.filter((i) => i.status === s).length}`,
      ),
      ``,
      `[التذاكر]`,
      `إجمالي: ${ticketList.length} | مفتوحة: ${openTickets.length} | عاجلة: ${urgentTickets.length}`,
      ``,
      `[المخزون]`,
      `إجمالي: ${inv.length} | منخفض: ${lowStock.length}`,
      ``,
      `[المستخدمون]`,
      `إجمالي: ${userList.length} | نشط: ${activeUsers}`,
      ...Object.entries(roleBreakdown).map(([k, v]) => `  - ${k}: ${v}`),
      ``,
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ltt_full_report_${todayStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    ring: "ring-blue-200" },
  purple:  { bg: "bg-purple-100",  text: "text-purple-700",  ring: "ring-purple-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  orange:  { bg: "bg-orange-100",  text: "text-orange-700",  ring: "ring-orange-200" },
  red:     { bg: "bg-red-100",     text: "text-red-700",     ring: "ring-red-200" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700",   ring: "ring-amber-200" },
  green:   { bg: "bg-green-100",   text: "text-green-700",   ring: "ring-green-200" },
  rose:    { bg: "bg-rose-100",    text: "text-rose-700",    ring: "ring-rose-200" },
  indigo:  { bg: "bg-indigo-100",  text: "text-indigo-700",  ring: "ring-indigo-200" },
  cyan:    { bg: "bg-cyan-100",    text: "text-cyan-700",    ring: "ring-cyan-200" },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700",    ring: "ring-teal-200" },
  gray:    { bg: "bg-gray-100",    text: "text-gray-700",    ring: "ring-gray-200" },
  slate:   { bg: "bg-slate-100",   text: "text-slate-700",   ring: "ring-slate-200" },
};

function KpiCard({ icon: Icon, color, label, value, loading }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  label: string;
  value: number;
  loading: boolean;
}) {
  const c = colorClasses[color] ?? colorClasses.blue;
  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className={`p-2 rounded-lg ${c.bg}`}>
        <Icon size={18} className={c.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-muted-foreground mt-1" />
        ) : (
          <p className="text-xl font-bold text-foreground">{value.toLocaleString("ar-LY")}</p>
        )}
      </div>
    </div>
  );
}

function ReportCard({
  icon: Icon,
  color,
  title,
  subtitle,
  loading,
  onExport,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  title: string;
  subtitle: string;
  loading: boolean;
  onExport: () => void;
  children: React.ReactNode;
}) {
  const c = colorClasses[color] ?? colorClasses.blue;
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg ${c.bg}`}>
            <Icon size={18} className={c.text} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-foreground truncate">{title}</h3>
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onExport}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          <Download size={13} />
          تصدير CSV
        </button>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, color, label, value }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  label: string;
  value: number;
}) {
  const c = colorClasses[color] ?? colorClasses.blue;
  return (
    <div className={`rounded-lg p-2.5 ${c.bg}`}>
      <div className={`flex items-center gap-1.5 ${c.text}`}>
        <Icon size={13} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold mt-0.5 ${c.text}`}>{value}</p>
    </div>
  );
}

function BreakdownList({ title, data, colorMap }: {
  title: string;
  data: Record<string, number>;
  colorMap?: Record<string, string>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([k, v]) => (
          <span
            key={k}
            className={`text-xs px-2 py-1 rounded-full font-medium ${colorMap?.[k] ?? "bg-gray-100 text-gray-700"}`}
          >
            {k}: {v}
          </span>
        ))}
      </div>
    </div>
  );
}
