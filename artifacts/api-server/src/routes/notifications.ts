import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { and, eq, isNull, or, type SQL } from "drizzle-orm";
import { MarkNotificationReadParams } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

// Returns notifications for the authenticated user (including global notifications with userId=null)
router.get("/notifications", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const scope = or(eq(notificationsTable.userId, req.userId!), isNull(notificationsTable.userId)) as SQL;
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(scope)
    .orderBy(notificationsTable.createdAt);
  res.json(notifications);
});

router.patch("/notifications/read-all", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const scope = or(eq(notificationsTable.userId, req.userId!), isNull(notificationsTable.userId)) as SQL;
  await db.update(notificationsTable).set({ isRead: true }).where(scope);
  res.json({ success: true });
});

router.patch("/notifications/:id/read", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  // Only allow marking own (or global) notifications as read
  const scope = and(
    eq(notificationsTable.id, params.data.id),
    or(eq(notificationsTable.userId, req.userId!), isNull(notificationsTable.userId)) as SQL,
  ) as SQL;
  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(scope)
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

export default router;
