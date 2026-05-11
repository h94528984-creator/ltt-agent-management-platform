import { Router, type IRouter } from "express";
import { db, auditLogTable, type InsertAuditLog } from "@workspace/db";
import { desc, eq, and, gte, type SQL } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

export async function logAudit(entry: InsertAuditLog): Promise<void> {
  try {
    await db.insert(auditLogTable).values(entry);
  } catch {
    /* swallow audit failures */
  }
}

router.get("/audit-log", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 200), 1000);
  const conditions: SQL[] = [];
  if (typeof req.query.entityType === "string") {
    conditions.push(eq(auditLogTable.entityType, req.query.entityType));
  }
  if (typeof req.query.userId === "string") {
    const uid = parseInt(req.query.userId);
    if (!Number.isNaN(uid)) conditions.push(eq(auditLogTable.userId, uid));
  }
  if (typeof req.query.since === "string") {
    const since = new Date(req.query.since);
    if (!Number.isNaN(since.getTime())) conditions.push(gte(auditLogTable.createdAt, since));
  }
  const rows = conditions.length > 0
    ? await db.select().from(auditLogTable).where(and(...conditions)).orderBy(desc(auditLogTable.createdAt)).limit(limit)
    : await db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(limit);
  res.json(rows);
});

router.post("/audit-log", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const body = req.body as Partial<InsertAuditLog>;
  if (!body.action || !body.entityType || !body.summary) {
    res.status(400).json({ error: "action, entityType, summary are required" });
    return;
  }
  // Actor is ALWAYS derived from the authenticated session — never trust client-supplied userId/userName
  const [row] = await db.insert(auditLogTable).values({
    action: body.action,
    entityType: body.entityType,
    entityId: body.entityId ?? null,
    summary: body.summary,
    userId: req.userId ?? null,
    userName: req.userName ?? null,
    meta: body.meta ?? null,
  }).returning();
  res.status(201).json(row);
});

export default router;
