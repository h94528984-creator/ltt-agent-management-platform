import { Router, type IRouter } from "express";
import { db, salesLogsTable } from "@workspace/db";
import { eq, and, type SQL } from "drizzle-orm";
import {
  CreateSalesLogBody,
  UpdateSalesLogBody,
  GetSalesLogParams,
  UpdateSalesLogParams,
  ListSalesLogsQueryParams,
} from "@workspace/api-zod";
import { recalculateScore } from "../lib/scoring";

const router: IRouter = Router();

function calcComplianceFlag(variance: number, observed: number): string {
  if (observed === 0) return "OK";
  const pct = Math.abs(variance / observed) * 100;
  if (pct < 10) return "OK";
  if (pct < 25) return "Suspicious";
  return "Violation";
}

router.get("/sales-logs", async (req, res): Promise<void> => {
  const params = ListSalesLogsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (params.success) {
    if (params.data.agentId) conditions.push(eq(salesLogsTable.agentId, params.data.agentId));
    if (params.data.inspectorId) conditions.push(eq(salesLogsTable.inspectorId, params.data.inspectorId));
    if (params.data.complianceFlag) conditions.push(eq(salesLogsTable.complianceFlag, params.data.complianceFlag));
  }
  const logs = conditions.length > 0
    ? await db.select().from(salesLogsTable).where(and(...conditions)).orderBy(salesLogsTable.date)
    : await db.select().from(salesLogsTable).orderBy(salesLogsTable.date);
  res.json(logs);
});

router.post("/sales-logs", async (req, res): Promise<void> => {
  const parsed = CreateSalesLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const variance = parsed.data.observedDailySalesValue - parsed.data.reportedSalesValue;
  const complianceFlag = calcComplianceFlag(variance, parsed.data.observedDailySalesValue);
  const [log] = await db.insert(salesLogsTable).values({
    ...parsed.data,
    visitId: parsed.data.visitId ?? null,
    location: parsed.data.location ?? null,
    rechargeCardsQty: parsed.data.rechargeCardsQty ?? null,
    rechargeCardsValue: parsed.data.rechargeCardsValue ?? null,
    devicesQty: parsed.data.devicesQty ?? null,
    simCardsQty: parsed.data.simCardsQty ?? null,
    ftthCount: parsed.data.ftthCount ?? null,
    adslCount: parsed.data.adslCount ?? null,
    notes: parsed.data.notes ?? null,
    variance,
    complianceFlag,
  }).returning();
  await recalculateScore(parsed.data.agentId);
  res.status(201).json(log);
});

router.get("/sales-logs/:id", async (req, res): Promise<void> => {
  const params = GetSalesLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [log] = await db.select().from(salesLogsTable).where(eq(salesLogsTable.id, params.data.id));
  if (!log) {
    res.status(404).json({ error: "Sales log not found" });
    return;
  }
  res.json(log);
});

router.patch("/sales-logs/:id", async (req, res): Promise<void> => {
  const params = UpdateSalesLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateSalesLogBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.notes !== undefined) updateData.notes = d.notes;
  if (d.complianceFlag != null) updateData.complianceFlag = d.complianceFlag;
  if (d.observedDailySalesValue != null) updateData.observedDailySalesValue = d.observedDailySalesValue;
  if (d.reportedSalesValue != null) updateData.reportedSalesValue = d.reportedSalesValue;
  const [log] = await db.update(salesLogsTable).set(updateData).where(eq(salesLogsTable.id, params.data.id)).returning();
  if (!log) {
    res.status(404).json({ error: "Sales log not found" });
    return;
  }
  await recalculateScore(log.agentId);
  res.json(log);
});

export default router;
