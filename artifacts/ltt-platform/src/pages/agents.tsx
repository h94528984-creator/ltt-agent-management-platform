import React, { useState } from "react";
import { useListAgents, useCreateAgent, useUpdateAgent, useDeleteAgent, getListAgentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  suspended: "bg-red-100 text-red-800 border-red-200",
  terminated: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusLabels: Record<string, string> = {
  active: "نشط", pending: "معلق", suspended: "موقوف", terminated: "منتهي"
};

const typeLabels: Record<string, string> = {
  dealer: "وكيل", sub_agent: "وكيل فرعي", mobile_seller: "بائع متجول", center: "مركز"
};

export function Agents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);
  const [editAgent, setEditAgent] = useState<any>(null);
  const [form, setForm] = useState({ name: "", location: "", type: "dealer", status: "active", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: agents, isLoading } = useListAgents({ status: statusFilter, search: search || undefined });
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();

  const handleSubmit = () => {
    if (!form.name || !form.location) { toast({ variant: "destructive", title: "يرجى ملء الحقول المطلوبة" }); return; }
    if (editAgent) {
      updateAgent.mutate({ id: editAgent.id, data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() }); setEditAgent(null); toast({ title: "تم تحديث الوكيل بنجاح" }); },
        onError: () => toast({ variant: "destructive", title: "فشل تحديث الوكيل" }),
      });
    } else {
      createAgent.mutate({ data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() }); setShowAdd(false); setForm({ name: "", location: "", type: "dealer", status: "active", notes: "" }); toast({ title: "تم إضافة الوكيل بنجاح" }); },
        onError: () => toast({ variant: "destructive", title: "فشل إضافة الوكيل" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الوكيل؟")) return;
    deleteAgent.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAgentsQueryKey() }); toast({ title: "تم حذف الوكيل" }); },
    });
  };

  const openEdit = (agent: any) => {
    setEditAgent(agent);
    setForm({ name: agent.name, location: agent.location, type: agent.type, status: agent.status, notes: agent.notes || "" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الوكلاء</h1>
          <p className="text-muted-foreground mt-0.5">عرض وإدارة جميع الوكلاء والموزعين</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setForm({ name: "", location: "", type: "dealer", status: "active", notes: "" }); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة وكيل
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث عن وكيل..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
            </div>
            <Select value={statusFilter || "all"} onValueChange={v => setStatusFilter(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
                <SelectItem value="terminated">منتهي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents?.map((agent: any) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{agent.location}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs border ${statusColors[agent.status]}`}>{statusLabels[agent.status]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{typeLabels[agent.type] || agent.type}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(agent)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(agent.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {agents?.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">لا يوجد وكلاء مطابقون</div>}
        </div>
      )}

      <Dialog open={showAdd || !!editAgent} onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditAgent(null); } }}>
        <DialogContent className="sm:max-w-[480px]" dir="rtl">
          <DialogHeader><DialogTitle>{editAgent ? "تعديل الوكيل" : "إضافة وكيل جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الاسم *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الوكيل" />
            </div>
            <div className="space-y-1.5">
              <Label>الموقع *</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="المدينة / المنطقة" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>النوع</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dealer">وكيل</SelectItem>
                    <SelectItem value="sub_agent">وكيل فرعي</SelectItem>
                    <SelectItem value="mobile_seller">بائع متجول</SelectItem>
                    <SelectItem value="center">مركز</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="suspended">موقوف</SelectItem>
                    <SelectItem value="terminated">منتهي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ملاحظات</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية" />
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleSubmit} disabled={createAgent.isPending || updateAgent.isPending}>{editAgent ? "تحديث" : "إضافة"}</Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditAgent(null); }}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
