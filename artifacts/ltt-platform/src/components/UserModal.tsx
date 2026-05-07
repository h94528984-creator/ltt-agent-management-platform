import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department?: string | null;
  isActive: boolean;
}

interface Props {
  user: UserData | null;
  onClose: () => void;
  onSaved: (u: UserData) => void;
}

const ROLES: { value: string; label: string }[] = [
  { value: "admin", label: "مدير النظام" },
  { value: "head_of_unit", label: "رئيس الوحدة" },
  { value: "indirect_sales", label: "مبيعات غير مباشرة" },
  { value: "agent_affairs", label: "شؤون الوكلاء" },
  { value: "inspection_team", label: "فريق التفتيش" },
  { value: "technical_support", label: "الدعم الفني" },
  { value: "airport_team", label: "فريق المطار" },
  { value: "centers_support", label: "دعم المراكز" },
  { value: "viewer", label: "مشاهد" },
];

export default function UserModal({ user, onClose, onSaved }: Props) {
  const isEdit = user !== null;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [department, setDepartment] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setEmail(user.email ?? "");
      setRole(user.role ?? "viewer");
      setDepartment(user.department ?? "");
      setIsActive(user.isActive);
      setPassword("");
    } else {
      setFullName("");
      setEmail("");
      setRole("viewer");
      setDepartment("");
      setIsActive(true);
      setPassword("");
    }
    setErr(null);
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!fullName.trim() || !email.trim()) {
      setErr("الاسم والبريد الإلكتروني مطلوبان");
      return;
    }
    if (!isEdit && password.length < 4) {
      setErr("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
      return;
    }
    if (isEdit && password.length > 0 && password.length < 4) {
      setErr("كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل");
      return;
    }
    setSaving(true);
    try {
      let saved: UserData;
      if (isEdit) {
        const body: Record<string, unknown> = {
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          department: department.trim() || null,
          isActive,
        };
        if (password.length >= 4) body.password = password;
        saved = await api.patch<UserData>(`/users/${user!.id}`, body);
      } else {
        saved = await api.post<UserData>("/users", {
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
          department: department.trim() || null,
        });
      }
      onSaved(saved);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {isEdit ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">الاسم الكامل *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني *</label>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {isEdit ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور *"}
            </label>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "اتركها فارغة لعدم التغيير" : "4 أحرف على الأقل"}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">الدور *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">القسم (اختياري)</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">المستخدم نشط</span>
            </label>
          )}

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{err}</div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-50">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50">
              {saving ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة المستخدم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
