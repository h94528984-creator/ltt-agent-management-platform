import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Search, UserCheck, UserX, Trash2 } from "lucide-react";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department?: string | null;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  head_of_unit: "رئيس الوحدة",
  indirect_sales: "مبيعات غير مباشرة",
  agent_affairs: "شؤون الوكلاء",
  inspection_team: "فريق التفتيش",
  technical_support: "الدعم الفني",
  airport_team: "فريق المطار",
  centers_support: "دعم المراكز",
  admin: "مدير النظام",
  viewer: "مشاهد",
};

const ROLE_COLORS: Record<string, string> = {
  head_of_unit: "bg-purple-100 text-purple-700",
  indirect_sales: "bg-blue-100 text-blue-700",
  agent_affairs: "bg-teal-100 text-teal-700",
  inspection_team: "bg-orange-100 text-orange-700",
  technical_support: "bg-cyan-100 text-cyan-700",
  airport_team: "bg-indigo-100 text-indigo-700",
  centers_support: "bg-emerald-100 text-emerald-700",
  admin: "bg-red-100 text-red-700",
  viewer: "bg-gray-100 text-gray-600",
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<User[]>("/users")
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || (u.fullName ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (ROLE_LABELS[u.role] ?? u.role).includes(q);
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
        <p className="text-muted-foreground text-sm mt-1">فريق العمل وصلاحياتهم في النظام</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <UserCheck size={22} className="text-green-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{users.filter((u) => u.isActive).length}</p>
            <p className="text-xs text-muted-foreground">مستخدم نشط</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <UserX size={22} className="text-red-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{users.filter((u) => !u.isActive).length}</p>
            <p className="text-xs text-muted-foreground">غير نشط</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{users.length}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم المستخدم أو الدور..."
          className="w-full border border-border rounded-lg pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-muted-foreground">لا توجد نتائج</div>
        ) : filtered.map((user) => (
          <div key={user.id} className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                  {(user.fullName ?? "؟").charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground ltr" dir="ltr">{user.email}</p>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full mt-1.5 ${user.isActive ? "bg-green-500" : "bg-gray-300"}`} title={user.isActive ? "نشط" : "غير نشط"} />
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("ar-LY")}
                </span>
                {getUser()?.role === "admin" && getUser()?.id !== user.id && (
                  <button
                    onClick={async () => {
                      if (!confirm(`هل تريد حذف المستخدم "${user.fullName}"؟`)) return;
                      try {
                        await api.delete(`/users/${user.id}`);
                        setUsers((prev) => prev.filter((u) => u.id !== user.id));
                      } catch (e) {
                        alert("تعذر حذف المستخدم");
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 rounded"
                    title="حذف المستخدم"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
