import { useState } from "react";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { AuthResponse as AR } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<AR>("/auth/login", { email, password });
      saveAuth(data.token, data.user);
      onLogin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطأ في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220,55%,12%)] to-[hsl(220,55%,22%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/ltt-tagline.png" alt="LTT" className="h-16 object-contain mx-auto mb-3" />
          <p className="text-blue-200 text-sm">نظام إدارة المبيعات بالتجزئة — المنطقة الغربية</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ltr"
                placeholder="example@ltt.ly"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ltr"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(220,55%,18%)] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[hsl(220,55%,22%)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>

          <div className="mt-5 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <p className="font-medium mb-1">بيانات الدخول الافتراضية:</p>
            <p className="ltr" dir="ltr">Password: LTT@2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}
