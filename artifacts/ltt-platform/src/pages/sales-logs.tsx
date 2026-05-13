import React, { useState } from "react";
import { useListSalesLogs, useCreateSalesLog, useListAgents, getListSalesLogsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const flagConfig: Record<string, { label: string; color: string; bg: string }> = {
  OK: { label: "طبيعي", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  Suspicious: { label: "مشبوه", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  Violation: { label: "مخالفة", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

export function SalesLogs() {
  const [showAdd, setShowAdd] = useState(false);
  const [flagFilter, setFlagFilter] = useState<string | undefined>(undefined);
  const [form, setForm] = useState({ agentId: "", inspectorId: "1", date: new Date().toISOString().split("T")[0], observedDailySalesValue: "", reportedSalesValue: "", location: "", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useListSalesLogs({ complianceFlag: flagFilter });
  const { data: agents } = useListAgents();
  const createLog = useCreateSalesLog();
  const agentMap = new Map((agents || []).map((a: any) => [a.id, a.name]));

  const handleSubmit = () => {
    if (!form.agentId || !form.observedDailySalesValue || !form.reportedSalesValue) {
      toast({ variant: "destructive", title: "يرجى ملء الحقول المطلوبة" }); return;
    }
    createLog.mutate({
      data: {
        agentId: Number(form.agentId),
        inspectorId: Number(form.inspectorId),
        date: new Date(form.date).toISOString(),
        observedDailySalesValue: Number(form.observedDailySalesValue),
        reportedSalesValue: Number(form.reportedSalesValue),
        location: form.location || null,
        notes: form.notes || null,
      }
    }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSalesLogsQueryKey() }); setShowAdd(false); toast({ title: "تم تسجيل بيانات المبيعات بنجاح" }); },
      onError: () => toast({ variant: "destructive", title: "فشل تسجيل البيانات" }),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سجل مبيعات التفتيش</h1>
          <p className="text-muted-foreground mt-0.5">مقارنة المبيعات الفعلية مع المُبلَّغ عنها</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 ml-2" /> تسجيل مبيعات</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Select value={flagFilter || "all"} onValueChange={v => setFlagFilter(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="تصفية حسب الحالة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع السجلات</SelectItem>
              <SelectItem value="OK">طبيعي</SelectItem>
              <SelectItem value="Suspicious">مشبوه</SelectItem>
              <SelectItem value="Violation">مخالفة</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {logs?.map((log: any) => {
            const cfg = flagConfig[log.complianceFlag] || flagConfig.OK;
            const variancePct = log.observedDailySalesValue ? ((log.variance / log.observedDailySalesValue) * 100).toFixed(1) : "0";
            const isPositive = log.variance >= 0;
            return (
              <Card key={log.id} className={`border ${cfg.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{agentMap.get(log.agentId) || `وكيل #${log.agentId}`}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString("ar-LY")}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">فعلي</p>
                        <p className="font-bold text-foreground">{log.observedDailySalesValue.toLocaleString("ar-LY")} د.ل</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">مُبلَّغ</p>
                        <p className="font-bold">{log.reportedSalesValue.toLocaleString("ar-LY")} د.ل</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">الفارق</p>
                        <div className={`flex items-center gap-1 font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{Math.abs(Number(variancePct))}%</span>
                        </div>
                      </div>
                      <Badge className={`border text-xs ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {logs?.length === 0 && <div className="text-center py-16 text-muted-foreground">لا توجد سجلات مبيعات بعد</div>}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader><DialogTitle>تسجيل بيانات مبيعات ميدانية</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الوكيل *</Label>
              <Select value={form.agentId} onValueChange={v => setForm(f => ({ ...f, agentId: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الوكيل" /></SelectTrigger>
                <SelectContent>{agents?.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>التاريخ</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>المبيعات الفعلية (د.ل) *</Label>
                <Input type="number" value={form.observedDailySalesValue} onChange={e => setForm(f => ({ ...f, observedDailySalesValue: e.target.value }))} placeholder="0" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>المبيعات المُبلَّغة (د.ل) *</Label>
                <Input type="number" value={form.reportedSalesValue} onChange={e => setForm(f => ({ ...f, reportedSalesValue: e.target.value }))} placeholder="0" dir="ltr" />
              </div>
            </div>
            {form.observedDailySalesValue && form.reportedSalesValue && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <span className="text-muted-foreground">الفارق المتوقع: </span>
                <span className={`font-bold ${Number(form.observedDailySalesValue) - Number(form.reportedSalesValue) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {(Number(form.observedDailySalesValue) - Number(form.reportedSalesValue)).toLocaleString("ar-LY")} د.ل
                </span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>الموقع</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="موقع الزيارة" />
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات" />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleSubmit} disabled={createLog.isPending}>تسجيل</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
