import { Router, type IRouter } from "express";
import { db, inspectionsTable } from "@workspace/db";
import { eq, and, type SQL } from "drizzle-orm";
import {
  CreateInspectionBody,
  UpdateInspectionBody,
  GetInspectionParams,
  UpdateInspectionParams,
  ListInspectionsQueryParams,
} from "@workspace/api-zod";
import { recalculateScore } from "../lib/scoring";

const router: IRouter = Router();

router.get("/inspections", async (req, res): Promise<void> => {
  const params = ListInspectionsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (params.success) {
    if (params.data.agentId) conditions.push(eq(inspectionsTable.agentId, params.data.agentId));
    if (params.data.status) conditions.push(eq(inspectionsTable.status, params.data.status));
    if (params.data.inspectorId) conditions.push(eq(inspectionsTable.inspectorId, params.data.inspectorId));
  }
  const reports = conditions.length > 0
    ? await db.select().from(inspectionsTable).where(and(...conditions)).orderBy(inspectionsTable.visitDate)
    : await db.select().from(inspectionsTable).orderBy(inspectionsTable.visitDate);
  res.json(reports);
});

router.post("/inspections", async (req, res): Promise<void> => {
  const parsed = CreateInspectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const violations = parsed.data.violations ?? [];
  const complianceScore = violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10);
  const [report] = await db.insert(inspectionsTable).values({
    ...parsed.data,
    violations,
    location: parsed.data.location ?? null,
    notes: parsed.data.notes ?? null,
    complianceScore,
  }).returning();
  await recalculateScore(parsed.data.agentId);
  res.status(201).json(report);
});

router.get("/inspections/:id", async (req, res): Promise<void> => {
  const params = GetInspectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db.select().from(inspectionsTable).where(eq(inspectionsTable.id, params.data.id));
  if (!report) {
    res.status(404).json({ error: "Inspection not found" });
    return;
  }
  res.json(report);
});

router.patch("/inspections/:id", async (req, res): Promise<void> => {
  const params = UpdateInspectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInspectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.violations != null) {
    updateData.violations = d.violations;
    updateData.complianceScore = d.violations.length === 0 ? 100 : Math.max(0, 100 - d.violations.length * 10);
  }
  if (d.notes !== undefined) updateData.notes = d.notes;
  if (d.status != null) updateData.status = d.status;
  if (d.complianceScore !== undefined) updateData.complianceScore = d.complianceScore;
  const [report] = await db.update(inspectionsTable).set(updateData).where(eq(inspectionsTable.id, params.data.id)).returning();
  if (!report) {
    res.status(404).json({ error: "Inspection not found" });
    return;
  }
  await recalculateScore(report.agentId);
  res.json(report);
});

export default router;
