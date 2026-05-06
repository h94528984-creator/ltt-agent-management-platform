import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  currentStock: number;
  minStockLevel: number;
  unit: string | null;
  description: string | null;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  sim_cards: "شرائح SIM",
  recharge_cards: "بطاقات شحن",
  devices: "أجهزة",
  ftth_equipment: "معدات FTTH",
  accessories: "إكسسوارات",
  other: "أخرى",
};

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    api.get<InventoryItem[]>("/inventory")
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lowStock = items.filter((i) => i.currentStock <= i.minStockLevel);
  const filtered = showLowStockOnly ? lowStock : items;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة المخزون</h1>
        <p className="text-muted-foreground text-sm mt-1">مستويات المخزون والتنبيهات</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <Package size={22} className="text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            <p className="text-xs text-muted-foreground">إجمالي الأصناف</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <AlertTriangle size={22} className="text-orange-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{lowStock.length}</p>
            <p className="text-xs text-muted-foreground">مخزون منخفض</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <TrendingDown size={22} className="text-green-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{items.filter((i) => i.currentStock > i.minStockLevel * 2).length}</p>
            <p className="text-xs text-muted-foreground">مخزون جيد</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-foreground">عرض المخزون المنخفض فقط</span>
        </label>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الصنف</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الفئة</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الرمز</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المخزون الحالي</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الحد الأدنى</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">لا توجد أصناف</td></tr>
            ) : filtered.map((item) => {
              const isLow = item.currentStock <= item.minStockLevel;
              const isCritical = item.currentStock === 0;
              return (
                <tr key={item.id} className={`transition-colors ${isLow ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-muted/30"}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{CATEGORY_LABELS[item.category] ?? item.category}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${isCritical ? "text-red-600" : isLow ? "text-orange-600" : "text-foreground"}`}>
                      {item.currentStock} <span className="font-normal text-muted-foreground text-xs">{item.unit}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.minStockLevel} {item.unit}</td>
                  <td className="px-4 py-3">
                    {isCritical ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">نفد المخزون</span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">منخفض</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">جيد</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
