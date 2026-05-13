import React from "react";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle, Ticket as TicketIcon, TrendingUp, Package } from "lucide-react";

export function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return <div className="p-8">جاري التحميل...</div>;
  }

  const statCards = [
    { title: "إجمالي الوكلاء", value: stats?.totalAgents || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "وكلاء نشطين", value: stats?.activeAgents || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "عالي الخطورة", value: stats?.highRiskAgents || 0, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    { title: "تذاكر مفتوحة", value: stats?.openTickets || 0, icon: TicketIcon, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "نواقص المخزون", value: stats?.lowStockItems || 0, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "متوسط التقييم", value: `${Math.round(stats?.avgAgentScore || 0)}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">لوحة القيادة</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على أداء قسم المبيعات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>نشاط حديث</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
              البيانات غير متوفرة حالياً
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع المخاطر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
              البيانات غير متوفرة حالياً
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
