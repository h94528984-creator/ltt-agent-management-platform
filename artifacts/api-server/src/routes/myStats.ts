import { Router, type IRouter } from "express";
import { db, ticketsTable, auditLogTable } from "@workspace/db";
import { eq, and, count, sql } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/my-stats/:userId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const requested = parseInt(req.params.userId);
  if (Number.isNaN(requested)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }
  // Only allow users to query their own stats unless they are admin
  if (requested !== req.userId && req.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const userId = requested;

  const [assignedTotal] = await db.select({ c: count() }).from(ticketsTable).where(eq(ticketsTable.assignedToId, userId));
  const [assignedOpen] = await db.select({ c: count() }).from(ticketsTable).where(and(eq(ticketsTable.assignedToId, userId), eq(ticketsTable.status, "open")));
  const [assignedResolved] = await db.select({ c: count() }).from(ticketsTable).where(and(eq(ticketsTable.assignedToId, userId), eq(ticketsTable.status, "resolved")));
  const [assignedClosed] = await db.select({ c: count() }).from(ticketsTable).where(and(eq(ticketsTable.assignedToId, userId), eq(ticketsTable.status, "closed")));
  const [createdTickets] = await db.select({ c: count() }).from(ticketsTable).where(eq(ticketsTable.createdById, userId));
  const [auditCount] = await db.select({ c: count() }).from(auditLogTable).where(eq(auditLogTable.userId, userId));

  const activity = await db.execute<{ d: string; c: number }>(
    sql`SELECT to_char(created_at::date, 'YYYY-MM-DD') as d, count(*)::int as c FROM audit_log WHERE user_id = ${userId} AND created_at > now() - interval '30 days' GROUP BY 1 ORDER BY 1`
  );

  res.json({
    tickets: {
      assigned: assignedTotal.c,
      open: assignedOpen.c,
      resolved: assignedResolved.c,
      closed: assignedClosed.c,
      created: createdTickets.c,
    },
    auditEntries: auditCount.c,
    activityLast30Days: activity.rows,
  });
});

export default router;
