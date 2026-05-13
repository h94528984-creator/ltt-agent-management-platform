import React, { useState } from "react";
import { useListInspections, useCreateInspection, useListAgents, getListInspectionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, MapPin, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
  submitted: { label: "مُرسل", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  reviewed: { label: "مراجَع", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  approved: { label: "معتمد", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

export function Inspections() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ agentId: "", inspectorId: "1", visitDate: new Date().toISOString().split("T")[0], location: "", notes: "", status: "submitted", violations: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: inspections, isLoading } = useListInspections();
  const { data: agents } = useListAgents();
  const createInspection = useCreateInspection();

  const handleSubmit = () => {
    if (!form.agentId) { toast({ variant: "destructive", title: "يرجى اختيار الوكيل" }); return; }
    const violations = form.violations ? form.violations.split("\n").filter(Boolean) : [];
    createInspection.mutate({
      data: {
        agentId: Number(form.agentId),
        inspectorId: Number(form.inspectorId),
        visitDate: new Date(form.visitDate).toISOString(),
        location: form.location || null,
        notes: form.notes || null,
        status: form.status,
        violations,
      }
    }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListInspectionsQueryKey() }); setShowAdd(false); toast({ title: "تم إنشاء تقرير التفتيش بنجاح" }); },
      onError: () => toast({ variant: "destructive", title: "فشل إنشاء التقرير" }),
    });
  };

  const agentMap = new Map((agents || []).map((a: any) => [a.id, a.name]));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تقارير التفتيش</h1>
          <p className="text-muted-foreground mt-0.5">سجلات زيارات التفتيش الميداني</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 ml-2" /> تقرير جديد</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {inspections?.map((r: any) => {
            const cfg = statusConfig[r.status] || statusConfig.draft;
            const Icon = cfg.icon;
            return (
              <Card key={r.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.violations?.length > 0 ? "bg-red-100" : "bg-emerald-100"}`}>
                        {r.violations?.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-emerald-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{agentMap.get(r.agentId) || `وكيل #${r.agentId}`}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(r.visitDate).toLocaleDateString("ar-LY")}</span>
                          {r.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.violations?.length > 0 && <span className="text-sm text-red-600 font-medium">{r.violations.length} مخالفة</span>}
                      {r.complianceScore != null && <span className="text-sm font-bold text-foreground">{Math.round(r.complianceScore)}%</span>}
                      <Badge className={`border text-xs ${cfg.color}`}>{cfg.label}</Badge>
                    </div>
                  </div>
                  {r.violations?.length > 0 && (
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-1.5">
                      {r.violations.map((v: string, i: number) => <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-2 py-0.5">{v}</span>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {inspections?.length === 0 && <div className="text-center py-16 text-muted-foreground">لا توجد تقارير تفتيش بعد</div>}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[520px]" dir="rtl">
          <DialogHeader><DialogTitle>إنشاء تقرير تفتيش</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الوكيل *</Label>
              <Select value={form.agentId} onValueChange={v => setForm(f => ({ ...f, agentId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الوكيل" /></SelectTrigger>
                <SelectContent>{agents?.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>تاريخ الزيارة</Label>
                <Input type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="submitted">مُرسل</SelectItem>
                    <SelectItem value="reviewed">مراجَع</SelectItem>
                    <SelectItem value="approved">معتمد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>الموقع</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="موقع الزيارة" />
            </div>
            <div className="space-y-1.5">
              <Label>المخالفات (سطر لكل مخالفة)</Label>
              <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" value={form.violations} onChange={e => setForm(f => ({ ...f, violations: e.target.value }))} placeholder="وصف المخالفة الأولى&#10;وصف المخالفة الثانية" />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية" />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleSubmit} disabled={createInspection.isPending}>إنشاء التقرير</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
