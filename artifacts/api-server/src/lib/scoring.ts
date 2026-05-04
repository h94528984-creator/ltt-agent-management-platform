import { db, agentScoresTable, inspectionsTable, salesLogsTable } from "@workspace/db";
import { eq, avg, count } from "drizzle-orm";

export async function createDefaultScore(agentId: number): Promise<void> {
  const existing = await db.select().from(agentScoresTable).where(eq(agentScoresTable.agentId, agentId));
  if (existing.length > 0) return;
  await db.insert(agentScoresTable).values({
    agentId,
    complianceScore: 70,
    salesAccuracyScore: 70,
    salesPerformanceScore: 70,
    activityScore: 70,
    finalScore: 70,
    riskLevel: "Medium",
    classification: "Silver",
    recommendation: "وكيل جديد - بانتظار بيانات الأداء",
  });
}

function classifyAgent(score: number): { classification: string; riskLevel: string; recommendation: string } {
  if (score >= 85) {
    return {
      classification: "Gold",
      riskLevel: "Low",
      recommendation: "وكيل متميز - مؤهل للحوافز وتوسيع نطاق العمل وأولوية المخزون",
    };
  } else if (score >= 70) {
    return {
      classification: "Silver",
      riskLevel: "Low",
      recommendation: "أداء جيد - متابعة مستمرة لتحسين التصنيف",
    };
  } else if (score >= 50) {
    return {
      classification: "Watchlist",
      riskLevel: "Medium",
      recommendation: "يحتاج متابعة - يُنصح بإعادة التدريب وزيارات تفتيشية إضافية",
    };
  } else {
    return {
      classification: "High_Risk",
      riskLevel: "High",
      recommendation: "خطر مرتفع - يُنصح بالإنذار الرسمي أو الإيقاف المؤقت وإعادة التقييم",
    };
  }
}

export async function recalculateScore(agentId: number): Promise<void> {
  const [inspectionStats] = await db
    .select({ avgCompliance: avg(inspectionsTable.complianceScore), cnt: count() })
    .from(inspectionsTable)
    .where(eq(inspectionsTable.agentId, agentId));

  const [salesStats] = await db
    .select({
      avgObserved: avg(salesLogsTable.observedDailySalesValue),
      avgVariance: avg(salesLogsTable.variance),
      cnt: count(),
    })
    .from(salesLogsTable)
    .where(eq(salesLogsTable.agentId, agentId));

  const complianceScore = inspectionStats.avgCompliance ? Number(inspectionStats.avgCompliance) : 70;
  const inspectionCount = Number(inspectionStats.cnt) || 0;
  const salesCount = Number(salesStats.cnt) || 0;

  const avgObserved = salesStats.avgObserved ? Number(salesStats.avgObserved) : 0;
  const avgVariance = salesStats.avgVariance ? Number(salesStats.avgVariance) : 0;
  let salesAccuracyScore = 70;
  if (avgObserved > 0) {
    const variancePct = Math.abs(avgVariance / avgObserved) * 100;
    salesAccuracyScore = Math.max(0, 100 - variancePct * 2);
  }

  const salesPerformanceScore = salesCount > 0 ? Math.min(100, 60 + salesCount * 5) : 50;
  const activityScore = inspectionCount > 0 ? Math.min(100, 50 + inspectionCount * 10) : 40;

  const finalScore =
    complianceScore * 0.3 +
    salesAccuracyScore * 0.25 +
    salesPerformanceScore * 0.25 +
    activityScore * 0.2;

  const { classification, riskLevel, recommendation } = classifyAgent(finalScore);

  const existing = await db.select().from(agentScoresTable).where(eq(agentScoresTable.agentId, agentId));
  if (existing.length > 0) {
    await db.update(agentScoresTable).set({
      complianceScore,
      salesAccuracyScore,
      salesPerformanceScore,
      activityScore,
      finalScore,
      riskLevel,
      classification,
      recommendation,
      lastUpdated: new Date(),
    }).where(eq(agentScoresTable.agentId, agentId));
  } else {
    await db.insert(agentScoresTable).values({
      agentId,
      complianceScore,
      salesAccuracyScore,
      salesPerformanceScore,
      activityScore,
      finalScore,
      riskLevel,
      classification,
      recommendation,
    });
  }
}
