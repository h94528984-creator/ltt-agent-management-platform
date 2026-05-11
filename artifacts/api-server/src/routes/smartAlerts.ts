import { Router, type IRouter } from "express";
import { db, agentsTable, agentDocumentsTable, ticketsTable, agentScoresTable, agentRequestsTable } from "@workspace/db";
import { eq, lt, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

interface SmartAlert {
  id: string;
  severity: "high" | "medium" | "low";
  category: "documents" | "agents" | "tickets" | "operations";
  title: string;
  description: string;
  count: number;
  link?: string;
}

router.get("/smart-alerts", requireAuth, async (_req, res): Promise<void> => {
  const alerts: SmartAlert[] = [];

  const expired = await db.select().from(agentDocumentsTable).where(eq(agentDocumentsTable.status, "expired"));
  if (expired.length > 0) {
    alerts.push({
      id: "docs-expired",
      severity: "high",
      category: "documents",
      title: "مستندات منتهية الصلاحية",
      description: `يوجد ${expired.length} مستند منتهٍ يجب تجديده فوراً`,
      count: expired.length,
      link: "/documents",
    });
  }

  const expiringSoon = await db.select().from(agentDocumentsTable).where(eq(agentDocumentsTable.status, "expiring_soon"));
  if (expiringSoon.length > 0) {
    alerts.push({
      id: "docs-expiring",
      severity: "medium",
      category: "documents",
      title: "مستندات قاربت على الانتهاء",
      description: `${expiringSoon.length} مستند سينتهي خلال 30 يوماً`,
      count: expiringSoon.length,
      link: "/documents",
    });
  }

  // Low-performing agents — score < 50
  const lowScores = await db.select({ agentId: agentScoresTable.agentId, score: agentScoresTable.finalScore })
    .from(agentScoresTable)
    .where(lt(agentScoresTable.finalScore, 50));
  if (lowScores.length > 0) {
    alerts.push({
      id: "agents-low-perf",
      severity: "high",
      category: "agents",
      title: "وكلاء منخفضو الأداء",
      description: `${lowScores.length} وكيل بتقييم أقل من 50`,
      count: lowScores.length,
      link: "/agents",
    });
  }

  // Suspended agents
  const suspended = await db.select().from(agentsTable).where(eq(agentsTable.status, "suspended"));
  if (suspended.length > 0) {
    alerts.push({
      id: "agents-suspended",
      severity: "high",
      category: "agents",
      title: "وكلاء موقوفون",
      description: `${suspended.length} وكيل في حالة إيقاف`,
      count: suspended.length,
      link: "/agents",
    });
  }

  // Urgent open tickets
  const urgent = await db.select().from(ticketsTable).where(and(eq(ticketsTable.status, "open"), eq(ticketsTable.priority, "urgent")));
  if (urgent.length > 0) {
    alerts.push({
      id: "tickets-urgent",
      severity: "high",
      category: "tickets",
      title: "تذاكر عاجلة مفتوحة",
      description: `${urgent.length} تذكرة عاجلة بانتظار المعالجة`,
      count: urgent.length,
      link: "/tickets",
    });
  }

  // Stale tickets (open > 7 days)
  const stale = await db.execute<{ c: number }>(
    sql`SELECT count(*)::int as c FROM tickets WHERE status IN ('open','in_progress') AND created_at < now() - interval '7 days'`
  );
  const staleCount = stale.rows[0]?.c ?? 0;
  if (staleCount > 0) {
    alerts.push({
      id: "tickets-stale",
      severity: "medium",
      category: "tickets",
      title: "تذاكر متأخرة",
      description: `${staleCount} تذكرة مفتوحة منذ أكثر من 7 أيام`,
      count: staleCount,
      link: "/tickets",
    });
  }

  // Pending inspections
  const pendingReq = await db.select().from(agentRequestsTable).where(eq(agentRequestsTable.status, "pending"));
  if (pendingReq.length > 5) {
    alerts.push({
      id: "ops-pending",
      severity: "medium",
      category: "operations",
      title: "عمليات بانتظار الموافقة",
      description: `${pendingReq.length} عملية تحتاج موافقة`,
      count: pendingReq.length,
      link: "/inspections",
    });
  }

  res.json(alerts);
});

export default router;
