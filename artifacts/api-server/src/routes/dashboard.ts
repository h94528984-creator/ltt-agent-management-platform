import { Router, type IRouter } from "express";
import { db, agentsTable, inspectionsTable, salesLogsTable, ticketsTable, inventoryTable, agentScoresTable, notificationsTable, agentDocumentsTable } from "@workspace/db";
import { eq, gte, lte, count, avg, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [agentCounts] = await db.select({
    total: count(),
    active: sql<number>`COUNT(*) FILTER (WHERE status = 'active')`,
    suspended: sql<number>`COUNT(*) FILTER (WHERE status = 'suspended')`,
    pending: sql<number>`COUNT(*) FILTER (WHERE status = 'pending')`,
  }).from(agentsTable);

  const [newAgents] = await db.select({ cnt: count() }).from(agentsTable)
    .where(gte(agentsTable.createdAt, thirtyDaysAgo));

  const [inspectionCounts] = await db.select({
    total: count(),
    thisMonth: sql<number>`COUNT(*) FILTER (WHERE visit_date >= ${startOfMonth})`,
    violationsThisMonth: sql<number>`COUNT(*) FILTER (WHERE visit_date >= ${startOfMonth} AND array_length(violations, 1) > 0)`,
  }).from(inspectionsTable);

  const [openTickets] = await db.select({ cnt: count() }).from(ticketsTable)
    .where(eq(ticketsTable.status, "open"));

  const [lowStockItems] = await db.select({ cnt: count() }).from(inventoryTable)
    .where(lte(inventoryTable.quantity, inventoryTable.minQuantity));

  const [scoreCounts] = await db.select({
    highRisk: sql<number>`COUNT(*) FILTER (WHERE risk_level = 'High')`,
    gold: sql<number>`COUNT(*) FILTER (WHERE classification = 'Gold')`,
    avgScore: avg(agentScoresTable.finalScore),
  }).from(agentScoresTable);

  const [docCounts] = await db.select({
    total: sql<number>`COUNT(*)`,
    valid: sql<number>`COUNT(*) FILTER (WHERE status = 'valid')`,
    expiringSoon: sql<number>`COUNT(*) FILTER (WHERE status = 'expiring_soon')`,
    expired: sql<number>`COUNT(*) FILTER (WHERE status = 'expired')`,
    suspended: sql<number>`COUNT(*) FILTER (WHERE status = 'suspended')`,
  }).from(agentDocumentsTable);

  res.json({
    totalAgents: Number(agentCounts.total),
    activeAgents: Number(agentCounts.active),
    suspendedAgents: Number(agentCounts.suspended),
    pendingAgents: Number(agentCounts.pending),
    newAgentsLast30Days: Number(newAgents.cnt),
    totalInspections: Number(inspectionCounts.total),
    inspectionsThisMonth: Number(inspectionCounts.thisMonth),
    openTickets: Number(openTickets.cnt),
    lowStockItems: Number(lowStockItems.cnt),
    highRiskAgents: Number(scoreCounts.highRisk),
    goldAgents: Number(scoreCounts.gold),
    totalViolationsThisMonth: Number(inspectionCounts.violationsThisMonth),
    avgAgentScore: scoreCounts.avgScore ? Math.round(Number(scoreCounts.avgScore) * 10) / 10 : 0,
    documents: {
      total: Number(docCounts?.total ?? 0),
      valid: Number(docCounts?.valid ?? 0),
      expiringSoon: Number(docCounts?.expiringSoon ?? 0),
      expired: Number(docCounts?.expired ?? 0),
      suspended: Number(docCounts?.suspended ?? 0),
    },
  });
});

router.get("/dashboard/agent-ranking", async (_req, res): Promise<void> => {
  const ranking = await db
    .select({
      agentId: agentScoresTable.agentId,
      agentName: agentsTable.name,
      finalScore: agentScoresTable.finalScore,
      classification: agentScoresTable.classification,
      riskLevel: agentScoresTable.riskLevel,
      location: agentsTable.location,
    })
    .from(agentScoresTable)
    .innerJoin(agentsTable, eq(agentScoresTable.agentId, agentsTable.id))
    .orderBy(sql`${agentScoresTable.finalScore} DESC`);
  res.json(ranking);
});

router.get("/dashboard/risk-distribution", async (_req, res): Promise<void> => {
  const distribution = await db
    .select({
      riskLevel: agentScoresTable.riskLevel,
      count: count(),
    })
    .from(agentScoresTable)
    .groupBy(agentScoresTable.riskLevel);
  res.json(distribution);
});

router.get("/dashboard/sales-comparison", async (_req, res): Promise<void> => {
  const comparison = await db
    .select({
      agentId: salesLogsTable.agentId,
      agentName: agentsTable.name,
      observedTotal: sql<number>`SUM(${salesLogsTable.observedDailySalesValue})`,
      reportedTotal: sql<number>`SUM(${salesLogsTable.reportedSalesValue})`,
      variance: sql<number>`SUM(${salesLogsTable.variance})`,
      complianceFlag: sql<string>`MODE() WITHIN GROUP (ORDER BY ${salesLogsTable.complianceFlag})`,
    })
    .from(salesLogsTable)
    .innerJoin(agentsTable, eq(salesLogsTable.agentId, agentsTable.id))
    .groupBy(salesLogsTable.agentId, agentsTable.name)
    .orderBy(sql`SUM(${salesLogsTable.variance}) DESC`);
  res.json(comparison);
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(sql`${notificationsTable.createdAt} DESC`)
    .limit(20);
  const activity = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    description: n.message,
    createdAt: n.createdAt,
    entityType: n.entityType,
    entityId: n.entityId,
  }));
  res.json(activity);
});

export default router;
