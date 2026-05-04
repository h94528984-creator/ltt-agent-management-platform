import React, { useState } from "react";
import { useListInventory, useCreateInventoryItem, useRecordInventoryMovement, getListInventoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Plus, Package, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categoryLabels: Record<string, string> = {
  sim_cards: "شرائح SIM",
  recharge_cards: "كروت شحن",
  devices: "أجهزة",
  accessories: "ملحقات",
  ftth_equipment: "معدات FTTH",
  other: "أخرى",
};

export function Inventory() {
  const [showAdd, setShowAdd] = useState(false);
  const [movementItem, setMovementItem] = useState<any>(null);
  const [mvForm, setMvForm] = useState({ type: "in", quantity: "", reason: "" });
  const [form, setForm] = useState({ name: "", category: "sim_cards", quantity: "0", minQuantity: "10", unit: "قطعة", notes: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useListInventory();
  const createItem = useCreateInventoryItem();
  const recordMovement = useRecordInventoryMovement();

  const handleAdd = () => {
    if (!form.name) { toast({ variant: "destructive", title: "يرجى إدخال اسم الصنف" }); return; }
    createItem.mutate({ data: { name: form.name, category: form.category, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), unit: form.unit, notes: form.notes || null } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }); setShowAdd(false); toast({ title: "تم إضافة الصنف" }); },
      onError: () => toast({ variant: "destructive", title: "فشل إضافة الصنف" }),
    });
  };

  const handleMovement = () => {
    if (!mvForm.quantity || Number(mvForm.quantity) <= 0) { toast({ variant: "destructive", title: "يرجى إدخال كمية صحيحة" }); return; }
    recordMovement.mutate({ id: movementItem.id, data: { type: mvForm.type, quantity: Number(mvForm.quantity), reason: mvForm.reason || "" } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }); setMovementItem(null); toast({ title: `تم ${mvForm.type === "in" ? "استلام" : "صرف"} المخزون بنجاح` }); },
      onError: () => toast({ variant: "destructive", title: "فشلت العملية" }),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المخزون</h1>
          <p className="text-muted-foreground mt-0.5">متابعة الأصناف والكميات المتاحة</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 ml-2" /> إضافة صنف</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map((item: any) => {
            const isLow = item.quantity <= item.minQuantity;
            const pct = item.minQuantity > 0 ? Math.min(100, (item.quantity / (item.minQuantity * 3)) * 100) : 50;
            return (
              <Card key={item.id} className={`hover:shadow-md transition-shadow ${isLow ? "border-red-200" : ""}`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{categoryLabels[item.category] || item.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-2xl font-bold text-foreground">{item.quantity.toLocaleString("ar-LY")}</span>
                      <span className="text-xs text-muted-foreground">{item.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>المستوى الأدنى: {item.minQuantity} {item.unit}</span>
                      {isLow && <span className="text-red-600 font-medium">⚠ مستوى منخفض</span>}
                    </div>
                    <Progress value={pct} className={`h-2 ${isLow ? "[&>div]:bg-red-500" : "[&>div]:bg-primary"}`} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => { setMovementItem(item); setMvForm({ type: "in", quantity: "", reason: "" }); }}>
                      <ArrowDown className="h-3.5 w-3.5 ml-1" />استلام
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setMovementItem(item); setMvForm({ type: "out", quantity: "", reason: "" }); }}>
                      <ArrowUp className="h-3.5 w-3.5 ml-1" />صرف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {items?.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">لا توجد أصناف في المخزون</div>}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[460px]" dir="rtl">
          <DialogHeader><DialogTitle>إضافة صنف جديد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>الاسم *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الصنف" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>الفئة</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(categoryLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>الوحدة</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>الكمية الأولية</Label><Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} dir="ltr" /></div>
              <div className="space-y-1.5"><Label>الحد الأدنى</Label><Input type="number" value={form.minQuantity} onChange={e => setForm(f => ({ ...f, minQuantity: e.target.value }))} dir="ltr" /></div>
            </div>
            <div className="space-y-1.5"><Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleAdd} disabled={createItem.isPending}>إضافة</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!movementItem} onOpenChange={(o) => { if (!o) setMovementItem(null); }}>
        <DialogContent className="sm:max-w-[380px]" dir="rtl">
          <DialogHeader><DialogTitle>{mvForm.type === "in" ? "استلام مخزون" : "صرف مخزون"} — {movementItem?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
              <p className="text-2xl font-bold">{movementItem?.quantity} {movementItem?.unit}</p>
            </div>
            <div className="space-y-1.5"><Label>الكمية *</Label><Input type="number" value={mvForm.quantity} onChange={e => setMvForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" dir="ltr" min="1" /></div>
            <div className="space-y-1.5"><Label>السبب</Label><Input value={mvForm.reason} onChange={e => setMvForm(f => ({ ...f, reason: e.target.value }))} placeholder="سبب الحركة" /></div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleMovement} disabled={recordMovement.isPending} className={mvForm.type === "in" ? "" : "bg-red-600 hover:bg-red-700"}>{mvForm.type === "in" ? "تأكيد الاستلام" : "تأكيد الصرف"}</Button>
            <Button variant="outline" onClick={() => setMovementItem(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
