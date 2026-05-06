import { Router, type IRouter } from "express";
import { db, ticketsTable } from "@workspace/db";
import { eq, and, type SQL } from "drizzle-orm";
import {
  CreateTicketBody,
  UpdateTicketBody,
  GetTicketParams,
  UpdateTicketParams,
  ListTicketsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tickets", async (req, res): Promise<void> => {
  const params = ListTicketsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (params.success) {
    if (params.data.status) conditions.push(eq(ticketsTable.status, params.data.status));
    if (params.data.assignedTo) conditions.push(eq(ticketsTable.assignedToId, params.data.assignedTo));
  }
  const tickets = conditions.length > 0
    ? await db.select().from(ticketsTable).where(and(...conditions)).orderBy(ticketsTable.createdAt)
    : await db.select().from(ticketsTable).orderBy(ticketsTable.createdAt);
  res.json(tickets);
});

router.post("/tickets", async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const extra = req.body as Record<string, unknown>;
  const lat = extra["latitude"] != null && extra["latitude"] !== "" ? Number(extra["latitude"]) : null;
  const lng = extra["longitude"] != null && extra["longitude"] !== "" ? Number(extra["longitude"]) : null;
  const locationName = extra["locationName"] ? String(extra["locationName"]) : null;
  const [ticket] = await db.insert(ticketsTable).values({
    ...parsed.data,
    assignedToId: parsed.data.assignedToId ?? null,
    agentId: parsed.data.agentId ?? null,
    locationName,
    latitude: lat,
    longitude: lng,
  }).returning();
  res.status(201).json(ticket);
});

router.get("/tickets/:id", async (req, res): Promise<void> => {
  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, params.data.id));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(ticket);
});

router.patch("/tickets/:id", async (req, res): Promise<void> => {
  const params = UpdateTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.title != null) updateData.title = d.title;
  if (d.description != null) updateData.description = d.description;
  if (d.status != null) {
    updateData.status = d.status;
    if (d.status === "closed") updateData.resolvedAt = new Date();
  }
  if (d.priority != null) updateData.priority = d.priority;
  if (d.assignedToId !== undefined) updateData.assignedToId = d.assignedToId;
  if (d.resolvedAt !== undefined) updateData.resolvedAt = d.resolvedAt;
  const [ticket] = await db.update(ticketsTable).set(updateData).where(eq(ticketsTable.id, params.data.id)).returning();
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(ticket);
});

router.delete("/tickets/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db.delete(ticketsTable).where(eq(ticketsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
