import React, { useState } from "react";
import { useListTickets, useCreateTicket, useUpdateTicket, getListTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Ticket as TicketIcon, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "مفتوح", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  in_progress: { label: "قيد التنفيذ", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
  resolved: { label: "محلول", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  closed: { label: "مغلق", color: "bg-gray-100 text-gray-600 border-gray-200", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "منخفض", color: "text-gray-500" },
  medium: { label: "متوسط", color: "text-amber-600" },
  high: { label: "مرتفع", color: "text-orange-600" },
  critical: { label: "حرج", color: "text-red-600" },
};

const categoryLabels: Record<string, string> = {
  technical: "فني", billing: "مالي", compliance: "امتثال", stock: "مخزون", other: "أخرى"
};

export function Tickets() {
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [form, setForm] = useState({ title: "", description: "", category: "technical", priority: "medium", createdById: "1" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: tickets, isLoading } = useListTickets({ status: statusFilter });
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();

  const handleSubmit = () => {
    if (!form.title || !form.description) { toast({ variant: "destructive", title: "يرجى ملء الحقول المطلوبة" }); return; }
    createTicket.mutate({ data: { ...form, createdById: Number(form.createdById) } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() }); setShowAdd(false); setForm({ title: "", description: "", category: "technical", priority: "medium", createdById: "1" }); toast({ title: "تم إنشاء التذكرة بنجاح" }); },
      onError: () => toast({ variant: "destructive", title: "فشل إنشاء التذكرة" }),
    });
  };

  const changeStatus = (id: number, status: string) => {
    updateTicket.mutate({ id, data: { status } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() }); toast({ title: "تم تحديث حالة التذكرة" }); },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نظام التذاكر</h1>
          <p className="text-muted-foreground mt-0.5">إدارة البلاغات والطلبات</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 ml-2" /> تذكرة جديدة</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[["all", "الكل"], ["open", "مفتوح"], ["in_progress", "قيد التنفيذ"], ["resolved", "محلول"], ["closed", "مغلق"]].map(([v, l]) => (
          <Button key={v} size="sm" variant={(statusFilter || "all") === v ? "default" : "outline"} onClick={() => setStatusFilter(v === "all" ? undefined : v)}>{l}</Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {tickets?.map((t: any) => {
            const sc = statusConfig[t.status] || statusConfig.open;
            const pc = priorityConfig[t.priority] || priorityConfig.medium;
            const Icon = sc.icon;
            return (
              <Card key={t.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TicketIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{t.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">{categoryLabels[t.category] || t.category}</span>
                          <span className={`text-xs font-medium ${pc.color}`}>أولوية: {pc.label}</span>
                          <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("ar-LY")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`border text-xs ${sc.color}`}><Icon className="h-3 w-3 ml-1" />{sc.label}</Badge>
                      {t.status === "open" && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => changeStatus(t.id, "in_progress")}>بدء التنفيذ</Button>
                      )}
                      {t.status === "in_progress" && (
                        <Button size="sm" variant="outline" className="text-xs h-7 text-emerald-600 border-emerald-200" onClick={() => changeStatus(t.id, "resolved")}>تم الحل</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {tickets?.length === 0 && <div className="text-center py-16 text-muted-foreground">لا توجد تذاكر مطابقة</div>}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader><DialogTitle>إنشاء تذكرة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>العنوان *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان التذكرة" />
            </div>
            <div className="space-y-1.5">
              <Label>الوصف *</Label>
              <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف المشكلة أو الطلب..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الفئة</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">فني</SelectItem>
                    <SelectItem value="billing">مالي</SelectItem>
                    <SelectItem value="compliance">امتثال</SelectItem>
                    <SelectItem value="stock">مخزون</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الأولوية</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفض</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">مرتفع</SelectItem>
                    <SelectItem value="critical">حرج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleSubmit} disabled={createTicket.isPending}>إنشاء</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
