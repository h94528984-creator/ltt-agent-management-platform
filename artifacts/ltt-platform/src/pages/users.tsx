import React, { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  head_of_unit: "رئيس الوحدة",
  indirect_sales: "مبيعات غير مباشرة",
  agent_affairs: "شؤون الوكلاء",
  inspection_team: "فريق التفتيش",
  technical_support: "الدعم الفني",
  airport_team: "فريق المطار",
  centers_support: "دعم المراكز",
  admin: "مدير النظام",
  viewer: "مستعرض",
};

const roleColors: Record<string, string> = {
  head_of_unit: "bg-purple-100 text-purple-700 border-purple-200",
  indirect_sales: "bg-blue-100 text-blue-700 border-blue-200",
  agent_affairs: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inspection_team: "bg-orange-100 text-orange-700 border-orange-200",
  technical_support: "bg-cyan-100 text-cyan-700 border-cyan-200",
  airport_team: "bg-sky-100 text-sky-700 border-sky-200",
  centers_support: "bg-teal-100 text-teal-700 border-teal-200",
  admin: "bg-red-100 text-red-700 border-red-200",
  viewer: "bg-gray-100 text-gray-600 border-gray-200",
};

export function Users() {
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ fullName: "", email: "", role: "viewer", department: "", password: "LTT@2024" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useListUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleSubmit = () => {
    if (!form.fullName || !form.email) { toast({ variant: "destructive", title: "يرجى ملء الحقول المطلوبة" }); return; }
    if (editUser) {
      updateUser.mutate({ id: editUser.id, data: { fullName: form.fullName, email: form.email, role: form.role, department: form.department || null } }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); setEditUser(null); toast({ title: "تم تحديث المستخدم" }); },
        onError: () => toast({ variant: "destructive", title: "فشل التحديث" }),
      });
    } else {
      createUser.mutate({ data: { fullName: form.fullName, email: form.email, role: form.role, department: form.department || null, password: form.password } }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); setShowAdd(false); setForm({ fullName: "", email: "", role: "viewer", department: "", password: "LTT@2024" }); toast({ title: "تم إضافة المستخدم" }); },
        onError: () => toast({ variant: "destructive", title: "فشل إضافة المستخدم" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); toast({ title: "تم حذف المستخدم" }); },
    });
  };

  const initials = (name: string) => name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-0.5">إضافة وإدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setForm({ fullName: "", email: "", role: "viewer", department: "", password: "LTT@2024" }); }}>
          <Plus className="h-4 w-4 ml-2" /> إضافة مستخدم
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {users?.map((user: any) => (
            <Card key={user.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {initials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{user.fullName}</h3>
                      {!user.isActive && <span className="text-xs text-muted-foreground">(غير نشط)</span>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge className={`border text-xs ${roleColors[user.role] || "bg-gray-100 text-gray-600"}`}>
                        <Shield className="h-3 w-3 ml-1" />{roleLabels[user.role] || user.role}
                      </Badge>
                      {user.department && <span className="text-xs text-muted-foreground">{user.department}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditUser(user); setForm({ fullName: user.fullName, email: user.email, role: user.role, department: user.department || "", password: "" }); }}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd || !!editUser} onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditUser(null); } }}>
        <DialogContent className="sm:max-w-[480px]" dir="rtl">
          <DialogHeader><DialogTitle>{editUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>الاسم الكامل *</Label><Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>البريد الإلكتروني *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} dir="ltr" className="text-left" /></div>
            <div className="space-y-1.5">
              <Label>الدور الوظيفي</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(roleLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>القسم</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="القسم أو الفريق" /></div>
            {!editUser && (
              <div className="space-y-1.5"><Label>كلمة المرور</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} dir="ltr" /></div>
            )}
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleSubmit} disabled={createUser.isPending || updateUser.isPending}>{editUser ? "تحديث" : "إضافة"}</Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditUser(null); }}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
