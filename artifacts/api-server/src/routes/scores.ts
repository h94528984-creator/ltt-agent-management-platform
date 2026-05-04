import { Router, type IRouter } from "express";
import { db, agentScoresTable, agentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetAgentScoreParams, RecalculateAgentScoreParams } from "@workspace/api-zod";
import { recalculateScore, createDefaultScore } from "../lib/scoring";

const router: IRouter = Router();

router.get("/scores", async (_req, res): Promise<void> => {
  const scores = await db
    .select({
      id: agentScoresTable.id,
      agentId: agentScoresTable.agentId,
      agentName: agentsTable.name,
      complianceScore: agentScoresTable.complianceScore,
      salesAccuracyScore: agentScoresTable.salesAccuracyScore,
      salesPerformanceScore: agentScoresTable.salesPerformanceScore,
      activityScore: agentScoresTable.activityScore,
      finalScore: agentScoresTable.finalScore,
      riskLevel: agentScoresTable.riskLevel,
      classification: agentScoresTable.classification,
      recommendation: agentScoresTable.recommendation,
      lastUpdated: agentScoresTable.lastUpdated,
    })
    .from(agentScoresTable)
    .innerJoin(agentsTable, eq(agentScoresTable.agentId, agentsTable.id))
    .orderBy(agentScoresTable.finalScore);
  res.json(scores);
});

router.get("/scores/:agentId", async (req, res): Promise<void> => {
  const params = GetAgentScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [score] = await db
    .select({
      id: agentScoresTable.id,
      agentId: agentScoresTable.agentId,
      agentName: agentsTable.name,
      complianceScore: agentScoresTable.complianceScore,
      salesAccuracyScore: agentScoresTable.salesAccuracyScore,
      salesPerformanceScore: agentScoresTable.salesPerformanceScore,
      activityScore: agentScoresTable.activityScore,
      finalScore: agentScoresTable.finalScore,
      riskLevel: agentScoresTable.riskLevel,
      classification: agentScoresTable.classification,
      recommendation: agentScoresTable.recommendation,
      lastUpdated: agentScoresTable.lastUpdated,
    })
    .from(agentScoresTable)
    .innerJoin(agentsTable, eq(agentScoresTable.agentId, agentsTable.id))
    .where(eq(agentScoresTable.agentId, params.data.agentId));
  if (!score) {
    res.status(404).json({ error: "Score not found" });
    return;
  }
  res.json(score);
});

router.post("/scores/:agentId/recalculate", async (req, res): Promise<void> => {
  const params = RecalculateAgentScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await createDefaultScore(params.data.agentId);
  await recalculateScore(params.data.agentId);
  const [score] = await db
    .select({
      id: agentScoresTable.id,
      agentId: agentScoresTable.agentId,
      agentName: agentsTable.name,
      complianceScore: agentScoresTable.complianceScore,
      salesAccuracyScore: agentScoresTable.salesAccuracyScore,
      salesPerformanceScore: agentScoresTable.salesPerformanceScore,
      activityScore: agentScoresTable.activityScore,
      finalScore: agentScoresTable.finalScore,
      riskLevel: agentScoresTable.riskLevel,
      classification: agentScoresTable.classification,
      recommendation: agentScoresTable.recommendation,
      lastUpdated: agentScoresTable.lastUpdated,
    })
    .from(agentScoresTable)
    .innerJoin(agentsTable, eq(agentScoresTable.agentId, agentsTable.id))
    .where(eq(agentScoresTable.agentId, params.data.agentId));
  if (!score) {
    res.status(404).json({ error: "Score not found" });
    return;
  }
  res.json(score);
});

export default router;
