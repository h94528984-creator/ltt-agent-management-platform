import React, { useState } from "react";
import { useListScores, useRecalculateAgentScore, getListScoresQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Trophy, Shield, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const classificationConfig: Record<string, { label: string; color: string; bg: string; icon: any; border: string }> = {
  Gold: { label: "ذهبي", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: Trophy },
  Silver: { label: "فضي", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: Shield },
  Watchlist: { label: "قيد المراقبة", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Eye },
  High_Risk: { label: "عالي الخطورة", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
};

const scoreComponents = [
  { key: "complianceScore", label: "الامتثال", weight: "30%", color: "bg-blue-500" },
  { key: "salesAccuracyScore", label: "دقة المبيعات", weight: "25%", color: "bg-emerald-500" },
  { key: "salesPerformanceScore", label: "أداء المبيعات", weight: "25%", color: "bg-purple-500" },
  { key: "activityScore", label: "النشاط", weight: "20%", color: "bg-orange-500" },
];

export function Scores() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: scores, isLoading } = useListScores();
  const recalculate = useRecalculateAgentScore();

  const handleRecalc = (agentId: number) => {
    recalculate.mutate({ agentId }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListScoresQueryKey() }); toast({ title: "تم إعادة حساب التقييم" }); },
      onError: () => toast({ variant: "destructive", title: "فشل إعادة الحساب" }),
    });
  };

  const filtered = filter ? scores?.filter((s: any) => s.classification === filter) : scores;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تقييم الوكلاء</h1>
          <p className="text-muted-foreground mt-0.5">نظام تصنيف الوكلاء بناءً على الأداء والامتثال</p>
        </div>
      </div>

      {/* Summary cards */}
      {scores && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(classificationConfig).map(([key, cfg]) => {
            const count = scores.filter((s: any) => s.classification === key).length;
            const Icon = cfg.icon;
            return (
              <Card key={key} className={`border cursor-pointer transition-all ${cfg.border} ${filter === key ? `${cfg.bg} shadow-md` : "hover:shadow-sm"}`} onClick={() => setFilter(filter === key ? undefined : key)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}</div>
      ) : (
        <div className="space-y-4">
          {filtered?.map((score: any) => {
            const cfg = classificationConfig[score.classification] || classificationConfig.Silver;
            const Icon = cfg.icon;
            return (
              <Card key={score.agentId} className={`border ${cfg.border}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${cfg.bg} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${cfg.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{score.agentName}</h3>
                        <Badge className={`border text-xs mt-1 ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">{Math.round(Number(score.finalScore))}</div>
                        <div className="text-xs text-muted-foreground">النقاط الكلية</div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRecalc(score.agentId)} disabled={recalculate.isPending}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {scoreComponents.map(({ key, label, weight, color }) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-muted-foreground font-medium">{weight}</span>
                        </div>
                        <Progress value={Math.round(Number(score[key]))} className={`h-2 [&>div]:${color}`} />
                        <div className="text-right text-sm font-bold">{Math.round(Number(score[key]))}</div>
                      </div>
                    ))}
                  </div>

                  {score.recommendation && (
                    <div className={`text-sm p-3 rounded-lg ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      <span className="font-medium">التوصية: </span>{score.recommendation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filtered?.length === 0 && <div className="text-center py-16 text-muted-foreground">لا يوجد وكلاء في هذه الفئة</div>}
        </div>
      )}
    </div>
  );
}
