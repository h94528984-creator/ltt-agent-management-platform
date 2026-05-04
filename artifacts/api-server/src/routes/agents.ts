import { Router, type IRouter } from "express";
import { db, agentsTable, agentScoresTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import {
  CreateAgentBody,
  UpdateAgentBody,
  GetAgentParams,
  UpdateAgentParams,
  DeleteAgentParams,
  BulkImportAgentsBody,
  ListAgentsQueryParams,
} from "@workspace/api-zod";
import { createDefaultScore } from "../lib/scoring";

const router: IRouter = Router();

router.get("/agents", async (req, res): Promise<void> => {
  const params = ListAgentsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (params.success) {
    if (params.data.status) conditions.push(eq(agentsTable.status, params.data.status));
    if (params.data.type) conditions.push(eq(agentsTable.type, params.data.type));
    if (params.data.search) conditions.push(ilike(agentsTable.name, `%${params.data.search}%`));
  }
  const agents = conditions.length > 0
    ? await db.select().from(agentsTable).where(and(...conditions)).orderBy(agentsTable.createdAt)
    : await db.select().from(agentsTable).orderBy(agentsTable.createdAt);
  res.json(agents);
});

router.post("/agents", async (req, res): Promise<void> => {
  const parsed = CreateAgentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [agent] = await db.insert(agentsTable).values({
    ...parsed.data,
    contractStart: parsed.data.contractStart ?? null,
    contractEnd: parsed.data.contractEnd ?? null,
    assignedSalesRepId: parsed.data.assignedSalesRepId ?? null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    notes: parsed.data.notes ?? null,
  }).returning();
  await createDefaultScore(agent.id);
  res.status(201).json(agent);
});

router.post("/agents/bulk-import", async (req, res): Promise<void> => {
  const parsed = BulkImportAgentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  for (const a of parsed.data.agents) {
    try {
      const [agent] = await db.insert(agentsTable).values({
        ...a,
        contractStart: a.contractStart ?? null,
        contractEnd: a.contractEnd ?? null,
        assignedSalesRepId: a.assignedSalesRepId ?? null,
        latitude: a.latitude ?? null,
        longitude: a.longitude ?? null,
        notes: a.notes ?? null,
      }).returning();
      await createDefaultScore(agent.id);
      imported++;
    } catch (err) {
      errors.push(String(err));
    }
  }
  res.json({ imported, skipped, errors });
});

router.get("/agents/:id", async (req, res): Promise<void> => {
  const params = GetAgentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [agent] = await db.select().from(agentsTable).where(eq(agentsTable.id, params.data.id));
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  res.json(agent);
});

router.patch("/agents/:id", async (req, res): Promise<void> => {
  const params = UpdateAgentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAgentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.name != null) updateData.name = d.name;
  if (d.location != null) updateData.location = d.location;
  if (d.type != null) updateData.type = d.type;
  if (d.status != null) updateData.status = d.status;
  if (d.notes !== undefined) updateData.notes = d.notes;
  if (d.contractStart !== undefined) updateData.contractStart = d.contractStart;
  if (d.contractEnd !== undefined) updateData.contractEnd = d.contractEnd;
  if (d.assignedSalesRepId !== undefined) updateData.assignedSalesRepId = d.assignedSalesRepId;
  if (d.latitude !== undefined) updateData.latitude = d.latitude;
  if (d.longitude !== undefined) updateData.longitude = d.longitude;
  const [agent] = await db.update(agentsTable).set(updateData).where(eq(agentsTable.id, params.data.id)).returning();
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  res.json(agent);
});

router.delete("/agents/:id", async (req, res): Promise<void> => {
  const params = DeleteAgentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [agent] = await db.delete(agentsTable).where(eq(agentsTable.id, params.data.id)).returning();
  if (!agent) {
    res.status(404).json({ error: "Agent not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
