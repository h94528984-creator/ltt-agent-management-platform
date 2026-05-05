import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Eye, CheckCircle, XCircle, Clock,
  MapPin, Phone, Mail, User, Wifi, Activity,
  BarChart3, ChevronRight,
} from "lucide-react";

const ACTIVITY_LABELS: Record<string, string> = {
  agent_main:   "وكيل رئيسي",
  agent_sub:    "وكيل فرعي",
  pos_adsl:     "نقطة بيع ADSL",
  pos_4g:       "نقطة بيع 4G",
  pos_adsl_4g:  "نقطة بيع ADSL/4G",
  center_agent: "وكيل مركز",
};

const STATUS_CFG = {
  pending:  { label: "قيد المراجعة", color: "bg-amber-100 text-amber-800 border-amber-200",  icon: Clock },
  approved: { label: "موافق عليه",   color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle },
  rejected: { label: "مرفوض",        color: "bg-red-100 text-red-800 border-red-200",         icon: XCircle },
};

type AgentRequest = {
  id: number;
  requestId: string;
  representativeName: string;
  representativeEmail: string;
  agentName: string;
  mobile: string;
  landline?: string;
  agentEmail?: string;
  city: string;
  fullAddress?: string;
  activityType: string;
  latitude?: number;
  longitude?: number;
  locationDescription?: string;
  hasSignboard: boolean;
  hasDevices: boolean;
  internetQuality: string;
  staffReadiness: number;
  areaTraffic: string;
  marketDensitySameCity: number;
  marketDensitySameStreet: number;
  transactionVolumeAdsl: number;
  transactionVolume4g: number;
  documentsComplete: boolean;
  brandIdentityCompliant: boolean;
  notes?: string;
  readinessScore: number;
  salesScore: number;
  complianceScore: number;
  finalScore: number;
  sitePhotoUrls: string[];
  interiorPhotoUrls: string[];
  equipmentPhotoUrls: string[];
  status: string;
  createdAt: string;
};

function ScorePill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-lg font-black ${color}`}>{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function PhotoGallery({ urls, label }: { urls: string[]; label: string }) {
  if (!urls?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {urls.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
            className="block w-20 h-20 rounded-lg border overflow-hidden bg-gray-50 hover:opacity-80 transition-opacity">
            {url.match(/\.(jpg|jpeg|png)$/i) ? (
              <img src={url} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
      <span className="text-sm text-muted-foreground min-w-[140px] flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-right flex-1">{String(value)}</span>
    </div>
  );
}

export function AgentRequests() {
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [selected, setSelected] = useState<AgentRequest | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<AgentRequest[]>({
    queryKey: ["agent-requests", statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/agent-requests?${params}`);
      if (!res.ok) throw new Error("فشل تحميل الطلبات");
      return res.json() as Promise<AgentRequest[]>;
    },
    staleTime: 15_000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/agent-request/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("فشل تحديث الحالة");
      return res.json() as Promise<AgentRequest>;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["agent-requests"] });
      setSelected(prev => prev?.id === updated.id ? updated : prev);
      const cfg = STATUS_CFG[updated.status as keyof typeof STATUS_CFG];
      toast({ title: `تم تحديث الحالة إلى: ${cfg?.label ?? updated.status}` });
    },
    onError: () => toast({ variant: "destructive", title: "فشل تحديث الحالة" }),
  });

  const scoreColor = (v: number) => v >= 80 ? "text-green-600" : v >= 60 ? "text-yellow-600" : "text-red-600";

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">طلبات تسجيل الوكلاء</h1>
        <p className="text-muted-foreground mt-0.5">مراجعة وإدارة طلبات انضمام الوكلاء الجدد</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {([
          ["all",      "الكل",            "bg-gray-50  border-gray-200  text-gray-700"],
          ["pending",  "قيد المراجعة",    "bg-amber-50 border-amber-200 text-amber-700"],
          ["approved", "موافق عليه",      "bg-green-50 border-green-200 text-green-700"],
          ["rejected", "مرفوض",           "bg-red-50   border-red-200   text-red-700"],
        ] as [keyof typeof counts, string, string][]).map(([key, label, cls]) => (
          <button key={key} onClick={() => setStatus(key)}
            className={`rounded-xl border p-3 text-center transition-all ${cls} ${statusFilter === key ? "ring-2 ring-offset-1 ring-current" : "opacity-70 hover:opacity-100"}`}>
            <div className="text-2xl font-black">{counts[key]}</div>
            <div className="text-xs mt-0.5 font-medium">{label}</div>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم، الجوال، المدينة، رقم الطلب…"
                value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="approved">موافق عليه</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const cfg = STATUS_CFG[req.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
            const StatusIcon = cfg.icon;
            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelected(req)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Score circle */}
                    <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0 ${
                      req.finalScore >= 80 ? "border-green-400 bg-green-50" :
                      req.finalScore >= 60 ? "border-yellow-400 bg-yellow-50" : "border-red-400 bg-red-50"
                    }`}>
                      <span className={`text-lg font-black leading-none ${scoreColor(req.finalScore)}`}>{req.finalScore}</span>
                      <span className="text-[9px] text-muted-foreground">/100</span>
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base truncate">{req.agentName}</span>
                        <Badge className={`text-xs border ${cfg.color} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />{cfg.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">{req.requestId}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{req.representativeName}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{req.city}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{req.mobile}</span>
                        <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{ACTIVITY_LABELS[req.activityType] ?? req.activityType}</span>
                      </div>
                    </div>

                    {/* Sub-scores */}
                    <div className="hidden md:flex gap-5 border-r pr-4">
                      <ScorePill value={req.readinessScore} label="جاهزية" color="text-blue-600" />
                      <ScorePill value={req.salesScore}     label="سوق"    color="text-orange-600" />
                      <ScorePill value={req.complianceScore} label="امتثال" color="text-purple-600" />
                    </div>

                    {/* Date + arrow */}
                    <div className="text-xs text-muted-foreground text-left hidden sm:block">
                      {new Date(req.createdAt).toLocaleDateString("ar-LY")}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={o => { if (!o) setSelected(null); }}>
        {selected && (() => {
          const cfg = STATUS_CFG[selected.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
          const StatusIcon = cfg.icon;
          return (
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <span>{selected.agentName}</span>
                  <Badge className={`text-xs border ${cfg.color} flex items-center gap-1`}>
                    <StatusIcon className="h-3 w-3" />{cfg.label}
                  </Badge>
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-mono">{selected.requestId}</p>
              </DialogHeader>

              <div className="space-y-6">
                {/* Score summary */}
                <div className="bg-[hsl(220,55%,18%)] text-white rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-blue-200">التقييم الإجمالي</span>
                    <span className={`text-4xl font-black ${selected.finalScore >= 80 ? "text-green-400" : selected.finalScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                      {selected.finalScore}<span className="text-lg text-white/40">/100</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "الجاهزية (40%)", val: selected.readinessScore,  color: "text-blue-300" },
                      { label: "السوق (35%)",     val: selected.salesScore,      color: "text-orange-300" },
                      { label: "الامتثال (25%)",  val: selected.complianceScore, color: "text-purple-300" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-white/10 rounded-lg p-2">
                        <div className={`text-xl font-black ${color}`}>{val}</div>
                        <div className="text-xs text-white/60">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Basic info */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">بيانات الوكيل</p>
                  <DetailRow label="المندوب المسؤول"   value={selected.representativeName} icon={User} />
                  <DetailRow label="اسم الوكيل / المحل" value={selected.agentName} />
                  <DetailRow label="الجوال"             value={selected.mobile}           icon={Phone} />
                  <DetailRow label="الهاتف الثابت"      value={selected.landline}          icon={Phone} />
                  <DetailRow label="البريد الإلكتروني"  value={selected.agentEmail}        icon={Mail} />
                  <DetailRow label="المدينة"             value={selected.city}              icon={MapPin} />
                  <DetailRow label="العنوان الكامل"      value={selected.fullAddress} />
                  <DetailRow label="نوع النشاط"          value={ACTIVITY_LABELS[selected.activityType] ?? selected.activityType} icon={Activity} />
                  {selected.latitude && (
                    <div className="flex items-start gap-2 py-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground min-w-[140px]">الإحداثيات</span>
                      <a href={`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline" dir="ltr">
                        {selected.latitude.toFixed(5)}, {selected.longitude?.toFixed(5)}
                      </a>
                    </div>
                  )}
                  {selected.locationDescription && <DetailRow label="وصف الموقع" value={selected.locationDescription} />}
                </div>

                {/* Readiness */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">الجاهزية التشغيلية</p>
                  <DetailRow label="لافتة إعلانية"    value={selected.hasSignboard ? "✅ نعم" : "❌ لا"} icon={Wifi} />
                  <DetailRow label="أجهزة وحاسوب"     value={selected.hasDevices ? "✅ نعم" : "❌ لا"} />
                  <DetailRow label="جودة الإنترنت"    value={selected.internetQuality === "good" ? "🟢 جيد" : selected.internetQuality === "medium" ? "🟡 متوسط" : "🔴 ضعيف"} />
                  <DetailRow label="جاهزية الموظفين"  value={`${selected.staffReadiness}/5`} />
                </div>

                {/* Market */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">إمكانية السوق</p>
                  <DetailRow label="حركة المنطقة"          value={selected.areaTraffic === "high" ? "🔥 عالية" : selected.areaTraffic === "medium" ? "⚡ متوسطة" : "🌙 ضعيفة"} />
                  <DetailRow label="منافسو LTT في المدينة" value={selected.marketDensitySameCity} />
                  <DetailRow label="منافسو LTT في الشارع"  value={selected.marketDensitySameStreet} />
                  <DetailRow label="معاملات ADSL شهرياً"   value={selected.transactionVolumeAdsl.toLocaleString()} />
                  <DetailRow label="معاملات 4G شهرياً"     value={selected.transactionVolume4g.toLocaleString()} />
                  <DetailRow label="الإجمالي الشهري"        value={(selected.transactionVolumeAdsl + selected.transactionVolume4g).toLocaleString()} />
                </div>

                {/* Compliance */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">الامتثال</p>
                  <DetailRow label="مستندات مكتملة"    value={selected.documentsComplete ? "✅ نعم" : "❌ لا"} />
                  <DetailRow label="الهوية البصرية LTT" value={selected.brandIdentityCompliant ? "✅ نعم" : "❌ لا"} />
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">ملاحظات</p>
                    <p className="text-sm bg-gray-50 rounded-lg p-3">{selected.notes}</p>
                  </div>
                )}

                {/* Photos */}
                {(selected.sitePhotoUrls?.length > 0 || selected.interiorPhotoUrls?.length > 0 || selected.equipmentPhotoUrls?.length > 0) && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">الصور المرفقة</p>
                    <PhotoGallery urls={selected.sitePhotoUrls}      label="صور الموقع الخارجي / اللافتة" />
                    <PhotoGallery urls={selected.interiorPhotoUrls}  label="صور الداخل" />
                    <PhotoGallery urls={selected.equipmentPhotoUrls} label="صور الأجهزة والمعدات" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t">
                  {selected.status !== "approved" && (
                    <Button
                      onClick={() => updateStatus.mutate({ id: selected.id, status: "approved" })}
                      disabled={updateStatus.isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle className="h-4 w-4 ml-2" /> الموافقة على الطلب
                    </Button>
                  )}
                  {selected.status !== "rejected" && (
                    <Button variant="destructive"
                      onClick={() => updateStatus.mutate({ id: selected.id, status: "rejected" })}
                      disabled={updateStatus.isPending}
                      className="flex-1">
                      <XCircle className="h-4 w-4 ml-2" /> رفض الطلب
                    </Button>
                  )}
                  {selected.status !== "pending" && (
                    <Button variant="outline"
                      onClick={() => updateStatus.mutate({ id: selected.id, status: "pending" })}
                      disabled={updateStatus.isPending}>
                      <Clock className="h-4 w-4 ml-2" /> إعادة للمراجعة
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}
