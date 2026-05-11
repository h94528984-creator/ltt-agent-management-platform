import { useState } from "react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { User as UserIcon, KeyRound, Mail, Shield, Loader2, Check } from "lucide-react";

export default function MyAccount() {
  const user = getUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPassword.length < 6) {
      setMsg({ type: "err", text: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
      return;
    }
    if (newPassword !== confirm) {
      setMsg({ type: "err", text: "كلمتا المرور الجديدتان غير متطابقتين" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/account/change-password", { currentPassword, newPassword });
      setMsg({ type: "ok", text: "تم تغيير كلمة المرور بنجاح" });
      setCurrentPassword(""); setNewPassword(""); setConfirm("");
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "خطأ" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">حسابي</h1>
        <p className="text-muted-foreground text-sm mt-1">معلومات الحساب وتغيير كلمة المرور</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
          <UserIcon size={22} className="text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground">الاسم</p>
            <p className="font-semibold">{user?.fullName ?? "-"}</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
          <Mail size={22} className="text-emerald-500" />
          <div>
            <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
            <p className="font-semibold text-sm">{user?.email ?? "-"}</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
          <Shield size={22} className="text-purple-500" />
          <div>
            <p className="text-xs text-muted-foreground">الدور</p>
            <p className="font-semibold">{user?.role ?? "-"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={20} className="text-orange-500" />
          <h2 className="font-bold text-lg">تغيير كلمة المرور</h2>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label>
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
          <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور الجديدة</label>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" dir="ltr" />
        </div>

        {msg && (
          <div className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg.type === "ok" && <Check size={16} />}
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="bg-primary hover:opacity-90 text-white rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
        </button>
      </form>
    </div>
  );
}
